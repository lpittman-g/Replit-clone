"use client";

import { GitBranch, GitCommitHorizontal, Plus } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const mockChanges = [
  { path: "src/index.html", status: "modified" },
  { path: "src/styles.css", status: "modified" },
  { path: "server/app.py", status: "untracked" },
];

export default function GitPanel() {
  const branch = useWorkspaceStore((s) => s.branch);
  const appendConsoleLog = useWorkspaceStore((s) => s.appendConsoleLog);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1e2430] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a0]">
          Source Control
        </span>
      </div>
      <div className="space-y-3 overflow-auto p-3">
        <div className="flex items-center justify-between rounded-md border border-[#1e2430] bg-[#121722] px-2.5 py-2 text-xs text-[#d7dce5]">
          <span className="inline-flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-[#7dd3a7]" />
            {branch}
          </span>
          <span className="text-[#6b7380]">origin/{branch}</span>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] uppercase tracking-wide text-[#6b7380]">
            Changes
          </p>
          <ul className="space-y-1">
            {mockChanges.map((change) => (
              <li
                key={change.path}
                className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-[#c5cbd5] hover:bg-[#171c26]"
              >
                <span className="truncate">{change.path}</span>
                <span
                  className={
                    change.status === "modified"
                      ? "text-amber-300"
                      : "text-emerald-300"
                  }
                >
                  {change.status === "modified" ? "M" : "U"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() =>
            appendConsoleLog("info", `Committed changes on ${branch}`)
          }
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1C4B39] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#246348]"
        >
          <GitCommitHorizontal className="h-3.5 w-3.5" />
          Commit all
        </button>

        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[#2a3344] px-2.5 py-1.5 text-xs font-medium text-[#c5cbd5] hover:bg-[#171c26]"
        >
          <Plus className="h-3.5 w-3.5" />
          Create branch
        </button>
      </div>
    </div>
  );
}
