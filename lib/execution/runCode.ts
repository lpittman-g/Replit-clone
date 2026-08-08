import {
  spawn,
  type ChildProcessByStdio,
} from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Readable } from "node:stream";
import {
  EXECUTION_MAX_OUTPUT_BYTES,
  EXECUTION_TIMEOUT_MS,
  NODE_MAX_OLD_SPACE_MB,
  type ExecuteEvent,
  type ExecuteRequest,
  type ExecutionLanguage,
} from "@/lib/execution/types";

type RunHandlers = {
  onEvent: (event: ExecuteEvent) => void;
  signal?: AbortSignal;
};

type SpawnedProcess = ChildProcessByStdio<null, Readable, Readable>;

function createLineBuffer(onLine: (line: string) => void) {
  let buffer = "";
  return {
    push(chunk: string) {
      buffer += chunk;
      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        onLine(part);
      }
    },
    flush() {
      if (buffer.length > 0) {
        onLine(buffer);
        buffer = "";
      }
    },
  };
}

function resolveCommand(
  language: ExecutionLanguage,
  filePath: string,
): { command: string; args: string[]; display: string } {
  if (language === "python") {
    return {
      command: "python3",
      args: ["-u", filePath],
      display: `python3 -u ${filePath}`,
    };
  }

  return {
    command: "node",
    args: [`--max-old-space-size=${NODE_MAX_OLD_SPACE_MB}`, filePath],
    display: `node --max-old-space-size=${NODE_MAX_OLD_SPACE_MB} ${filePath}`,
  };
}

function killProcessTree(child: SpawnedProcess) {
  if (child.killed) return;
  try {
    child.kill("SIGKILL");
  } catch {
    // ignore
  }
}

export async function runCodeInChildProcess(
  request: ExecuteRequest,
  handlers: RunHandlers,
): Promise<void> {
  const { onEvent, signal } = handlers;
  const language = request.language;
  const filename =
    request.filename?.replace(/[^\w.\-]/g, "_") ||
    (language === "python" ? "main.py" : "main.js");

  let tempDir: string | null = null;
  let child: SpawnedProcess | null = null;
  let timedOut = false;
  let outputBytes = 0;
  let settled = false;

  const startedAt = Date.now();

  const cleanup = async () => {
    if (child && !child.killed) {
      killProcessTree(child);
    }
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
      tempDir = null;
    }
  };

  const finishExit = (
    code: number | null,
    exitSignal: string | null,
  ) => {
    if (settled) return;
    settled = true;
    onEvent({
      type: "exit",
      code,
      signal: exitSignal,
      timedOut,
      durationMs: Date.now() - startedAt,
    });
  };

  try {
    if (signal?.aborted) {
      onEvent({ type: "error", message: "Execution aborted before start" });
      finishExit(null, "ABORT");
      return;
    }

    tempDir = await mkdtemp(
      join(/*turbopackIgnore: true*/ tmpdir(), "replit-clone-exec-"),
    );
    const filePath = join(/*turbopackIgnore: true*/ tempDir, filename);
    await writeFile(filePath, request.code, "utf8");

    const resolved = resolveCommand(language, filePath);
    onEvent({
      type: "start",
      language,
      filename,
      command: resolved.display,
    });

    const childEnv: NodeJS.ProcessEnv = {
      PATH: process.env.PATH,
      HOME: tempDir,
      TMPDIR: tempDir,
      LANG: "C.UTF-8",
      NODE_ENV: process.env.NODE_ENV,
      NODE_OPTIONS: "",
      PYTHONUNBUFFERED: "1",
      PYTHONDONTWRITEBYTECODE: "1",
    };

    const activeChild = spawn(
      /*turbopackIgnore: true*/ resolved.command,
      resolved.args,
      {
        cwd: tempDir,
        env: childEnv,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    child = activeChild;

    const stdoutBuffer = createLineBuffer((line) => {
      onEvent({ type: "stdout", data: line });
    });
    const stderrBuffer = createLineBuffer((line) => {
      onEvent({ type: "stderr", data: line });
    });

    const onChunk = (stream: "stdout" | "stderr", chunk: Buffer) => {
      outputBytes += chunk.length;
      if (outputBytes > EXECUTION_MAX_OUTPUT_BYTES) {
        timedOut = false;
        onEvent({
          type: "stderr",
          data: `[runner] Output exceeded ${EXECUTION_MAX_OUTPUT_BYTES} bytes; killing process`,
        });
        killProcessTree(activeChild);
        return;
      }
      const text = chunk.toString("utf8");
      if (stream === "stdout") stdoutBuffer.push(text);
      else stderrBuffer.push(text);
    };

    activeChild.stdout.on("data", (chunk: Buffer) => onChunk("stdout", chunk));
    activeChild.stderr.on("data", (chunk: Buffer) => onChunk("stderr", chunk));

    const timeout = setTimeout(() => {
      timedOut = true;
      onEvent({
        type: "stderr",
        data: `[runner] Timed out after ${EXECUTION_TIMEOUT_MS}ms`,
      });
      killProcessTree(activeChild);
    }, EXECUTION_TIMEOUT_MS);

    const onAbort = () => {
      onEvent({ type: "stderr", data: "[runner] Stopped by user" });
      killProcessTree(activeChild);
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    await new Promise<void>((resolve) => {
      activeChild.on("error", (error) => {
        onEvent({
          type: "error",
          message: error.message || "Failed to start process",
        });
        finishExit(null, null);
        resolve();
      });
      activeChild.on("close", (code, exitSignal) => {
        stdoutBuffer.flush();
        stderrBuffer.flush();
        finishExit(code, exitSignal);
        resolve();
      });
    });

    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown execution error";
    onEvent({ type: "error", message });
    finishExit(1, null);
  } finally {
    await cleanup();
  }
}
