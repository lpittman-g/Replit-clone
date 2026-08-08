"use client";

import { GitBranch, Cpu, MemoryStick } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function StatusBar() {
  const branch = useWorkspaceStore((s) => s.branch);
  const settings = useWorkspaceStore((s) => s.settings);
  const isRunning = useWorkspaceStore((s) => s.isRunning);
  const cpuUsage = useWorkspaceStore((s) => s.cpuUsage);
  const ramUsage = useWorkspaceStore((s) => s.ramUsage);

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#1e2430] bg-[#0b0e13] px-3 text-[11px] text-[#8b93a0]">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          {branch}
        </span>
        <span>
          {settings.indentType === "spaces" ? "Spaces" : "Tabs"}:{" "}
          {settings.indentSize}
        </span>
        <span>UTF-8</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isRunning ? "bg-emerald-400" : "bg-[#4b5563]"
            }`}
          />
          {isRunning ? "Running" : "Idle"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          CPU {cpuUsage}%
          <span className="ml-1 inline-block h-1.5 w-12 overflow-hidden rounded-full bg-[#1e2430]">
            <span
              className="block h-full rounded-full bg-[#1C4B39]"
              style={{ width: `${cpuUsage}%` }}
            />
          </span>
        </span>
        <span className="inline-flex items-center gap-1">
          <MemoryStick className="h-3 w-3" />
          RAM {ramUsage}%
          <span className="ml-1 inline-block h-1.5 w-12 overflow-hidden rounded-full bg-[#1e2430]">
            <span
              className="block h-full rounded-full bg-[#3b6d57]"
              style={{ width: `${ramUsage}%` }}
            />
          </span>
        </span>
      </div>
    </footer>
  );
}
