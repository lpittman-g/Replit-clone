"use client";

import { X } from "lucide-react";
import {
  selectFileById,
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

export default function TabBar() {
  const openTabs = useWorkspaceStore((s) => s.openTabs);
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const setActiveFile = useWorkspaceStore((s) => s.setActiveFile);
  const closeTab = useWorkspaceStore((s) => s.closeTab);

  if (openTabs.length === 0) {
    return (
      <div className="flex h-9 items-center border-b border-[#1e2430] bg-[#0e1117] px-3 text-xs text-[#6b7380]">
        No files open
      </div>
    );
  }

  return (
    <div className="flex h-9 items-stretch overflow-x-auto border-b border-[#1e2430] bg-[#0e1117]">
      {openTabs.map((tab) => {
        const file = selectFileById(fileTree, tab.id);
        if (!file) return null;
        const active = tab.id === activeFileId;
        return (
          <div
            key={tab.id}
            className={`group flex min-w-[120px] max-w-[200px] items-center gap-2 border-r border-[#1e2430] px-3 text-xs ${
              active
                ? "bg-[#151a23] text-white"
                : "bg-[#0e1117] text-[#8b93a0] hover:bg-[#121722]"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveFile(tab.id)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              {tab.dirty && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7dd3a7]" />
              )}
              <span className="truncate">{file.name}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="rounded p-0.5 text-[#6b7380] opacity-70 transition hover:bg-[#1e2430] hover:text-white group-hover:opacity-100"
              aria-label={`Close ${file.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
