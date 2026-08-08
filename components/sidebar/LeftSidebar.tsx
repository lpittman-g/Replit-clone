"use client";

import {
  Box,
  Database,
  Folder,
  GitBranch,
  Lock,
  Settings,
} from "lucide-react";
import { ToolId, useWorkspaceStore } from "@/store/useWorkspaceStore";
import FileTree from "./FileTree";
import PackagesPanel from "./PackagesPanel";
import SecretsPanel from "./SecretsPanel";
import GitPanel from "./GitPanel";
import DatabasePanel from "./DatabasePanel";
import SettingsPanel from "./SettingsPanel";

const tools: { id: ToolId; label: string; icon: typeof Folder }[] = [
  { id: "files", label: "Files", icon: Folder },
  { id: "packages", label: "Packages", icon: Box },
  { id: "secrets", label: "Secrets", icon: Lock },
  { id: "git", label: "Git", icon: GitBranch },
  { id: "database", label: "Database", icon: Database },
  { id: "settings", label: "Settings", icon: Settings },
];

function ToolPanel({ tool }: { tool: ToolId }) {
  switch (tool) {
    case "files":
      return <FileTree />;
    case "packages":
      return <PackagesPanel />;
    case "secrets":
      return <SecretsPanel />;
    case "git":
      return <GitPanel />;
    case "database":
      return <DatabasePanel />;
    case "settings":
      return <SettingsPanel />;
    default:
      return null;
  }
}

export default function LeftSidebar() {
  const activeTool = useWorkspaceStore((s) => s.activeTool);
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen);
  const setActiveTool = useWorkspaceStore((s) => s.setActiveTool);

  return (
    <div className="flex h-full min-w-0 border-r border-[#1e2430] bg-[#0e1117]">
      <div className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-[#1e2430] py-2">
        {tools.map(({ id, label, icon: Icon }) => {
          const active = activeTool === id && sidebarOpen;
          return (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setActiveTool(id)}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
                active
                  ? "bg-[#1C4B39] text-white"
                  : "text-[#8b93a0] hover:bg-[#171c26] hover:text-white"
              }`}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {sidebarOpen && (
        <div className="w-64 min-w-0 shrink-0 overflow-hidden bg-[#10141c]">
          <ToolPanel tool={activeTool} />
        </div>
      )}
    </div>
  );
}
