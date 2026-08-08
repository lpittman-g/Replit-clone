import { runCodeInChildProcess } from "@/lib/execution/runCode";
import {
  EXECUTION_MAX_CODE_BYTES,
  type ExecuteEvent,
  type ExecuteRequest,
  type ExecutionLanguage,
} from "@/lib/execution/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isLanguage(value: unknown): value is ExecutionLanguage {
  return value === "javascript" || value === "python";
}

function encodeEvent(event: ExecuteEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function POST(request: Request) {
  let body: Partial<ExecuteRequest>;
  try {
    body = (await request.json()) as Partial<ExecuteRequest>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  const language = body.language;
  const filename =
    typeof body.filename === "string" ? body.filename : undefined;

  if (!isLanguage(language)) {
    return Response.json(
      { error: "language must be 'javascript' or 'python'" },
      { status: 400 },
    );
  }

  if (!code.trim()) {
    return Response.json({ error: "code is required" }, { status: 400 });
  }

  if (Buffer.byteLength(code, "utf8") > EXECUTION_MAX_CODE_BYTES) {
    return Response.json(
      {
        error: `code exceeds ${EXECUTION_MAX_CODE_BYTES} byte limit`,
      },
      { status: 413 },
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: ExecuteEvent) => {
        try {
          controller.enqueue(encodeEvent(event));
        } catch {
          // stream may already be closed
        }
      };

      void runCodeInChildProcess(
        { code, language, filename },
        {
          signal: request.signal,
          onEvent: send,
        },
      )
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Execution failed";
          send({ type: "error", message });
        })
        .finally(() => {
          try {
            controller.close();
          } catch {
            // ignore
          }
        });
    },
    cancel() {
      // AbortSignal on the request is triggered by the client disconnect.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
