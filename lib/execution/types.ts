export type ExecutionLanguage = "javascript" | "python";

export type ExecuteRequest = {
  code: string;
  language: ExecutionLanguage;
  filename?: string;
};

export type ExecuteEvent =
  | {
      type: "start";
      language: ExecutionLanguage;
      filename: string;
      command: string;
    }
  | { type: "stdout"; data: string }
  | { type: "stderr"; data: string }
  | {
      type: "exit";
      code: number | null;
      signal: string | null;
      timedOut: boolean;
      durationMs: number;
    }
  | { type: "error"; message: string };

export const EXECUTION_TIMEOUT_MS = 10_000;
export const EXECUTION_MAX_OUTPUT_BYTES = 256 * 1024;
export const EXECUTION_MAX_CODE_BYTES = 128 * 1024;
export const NODE_MAX_OLD_SPACE_MB = 64;
