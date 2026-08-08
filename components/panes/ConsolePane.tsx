"use client";

import { Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const levelStyles = {
  stdout: "text-[#d7dce5]",
  stderr: "text-red-300",
  info: "text-[#7dd3a7]",
} as const;

export default function ConsolePane() {
  const consoleLogs = useWorkspaceStore((s) => s.consoleLogs);
  const clearConsole = useWorkspaceStore((s) => s.clearConsole);

  return (
    <div className="flex h-full flex-col bg-[#0b0e13]">
      <div className="flex items-center justify-between border-b border-[#1e2430] px-3 py-1.5">
        <span className="text-[11px] uppercase tracking-wide text-[#6b7380]">
          Console output
        </span>
        <button
          type="button"
          onClick={clearConsole}
          className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-[#8b93a0] hover:bg-[#171c26] hover:text-white"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-auto p-3 font-mono text-[12px]">
        {consoleLogs.length === 0 ? (
          <p className="text-[#6b7380]">No console output yet.</p>
        ) : (
          consoleLogs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <span className="shrink-0 text-[#4b5563]">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="shrink-0 uppercase text-[#6b7380]">
                {log.level}
              </span>
              <span className={levelStyles[log.level]}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
