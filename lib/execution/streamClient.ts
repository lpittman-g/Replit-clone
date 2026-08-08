import type { ExecuteEvent, ExecuteRequest } from "@/lib/execution/types";

export async function streamExecute(
  request: ExecuteRequest,
  options: {
    signal?: AbortSignal;
    onEvent: (event: ExecuteEvent) => void;
  },
): Promise<void> {
  const response = await fetch("/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: options.signal,
  });

  if (!response.ok) {
    let message = `Execute failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    options.onEvent({ type: "error", message });
    return;
  }

  if (!response.body) {
    options.onEvent({ type: "error", message: "No response stream" });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const event = JSON.parse(trimmed) as ExecuteEvent;
        options.onEvent(event);
      } catch {
        options.onEvent({
          type: "stderr",
          data: `[client] Failed to parse event: ${trimmed}`,
        });
      }
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    try {
      options.onEvent(JSON.parse(trailing) as ExecuteEvent);
    } catch {
      // ignore incomplete trailing frame
    }
  }
}

export function languageFromFilename(
  filename: string,
): "javascript" | "python" | "preview" | "unsupported" {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["js", "mjs", "cjs"].includes(ext)) return "javascript";
  if (ext === "py") return "python";
  if (["html", "htm", "css"].includes(ext)) return "preview";
  return "unsupported";
}
