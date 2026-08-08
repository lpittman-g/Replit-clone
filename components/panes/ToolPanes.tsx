"use client";

import {
  Bot,
  Eye,
  SquareTerminal,
  TerminalSquare,
} from "lucide-react";
import { PaneId, useWorkspaceStore } from "@/store/useWorkspaceStore";
import TerminalPane from "./TerminalPane";
import ConsolePane from "./ConsolePane";
import PreviewPane from "./PreviewPane";
import AgentPane from "./AgentPane";

const panes: { id: PaneId; label: string; icon: typeof Eye }[] = [
  { id: "terminal", label: "Terminal", icon: SquareTerminal },
  { id: "console", label: "Console", icon: TerminalSquare },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "agent", label: "Agent", icon: Bot },
];

function ActivePane({ pane }: { pane: PaneId }) {
  switch (pane) {
    case "terminal":
      return <TerminalPane />;
    case "console":
      return <ConsolePane />;
    case "preview":
      return <PreviewPane />;
    case "agent":
      return <AgentPane />;
    default:
      return null;
  }
}

export default function ToolPanes() {
  const activePane = useWorkspaceStore((s) => s.activePane);
  const setActivePane = useWorkspaceStore((s) => s.setActivePane);

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-[#1e2430] bg-[#0e1117]">
      <div className="flex h-9 items-center gap-1 overflow-x-auto border-b border-[#1e2430] px-2">
        {panes.map(({ id, label, icon: Icon }) => {
          const active = activePane === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActivePane(id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition ${
                active
                  ? "bg-[#1C4B39] text-white"
                  : "text-[#8b93a0] hover:bg-[#171c26] hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1">
        <ActivePane pane={activePane} />
      </div>
    </div>
  );
}
