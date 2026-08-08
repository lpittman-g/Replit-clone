"use client";

import {
  Bot,
  Eye,
  SquareTerminal,
  TerminalSquare,
} from "lucide-react";
import {
  BottomPaneId,
  PaneId,
  RightPaneId,
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";
import TerminalPane from "./TerminalPane";
import ConsolePane from "./ConsolePane";
import PreviewPane from "./PreviewPane";
import AgentPane from "./AgentPane";

const bottomPanes: {
  id: BottomPaneId;
  label: string;
  icon: typeof Eye;
}[] = [
  { id: "terminal", label: "Shell", icon: SquareTerminal },
  { id: "console", label: "Console", icon: TerminalSquare },
];

const rightPanes: {
  id: RightPaneId;
  label: string;
  icon: typeof Eye;
}[] = [
  { id: "preview", label: "Webview", icon: Eye },
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

export function BottomPanes() {
  const activeBottomPane = useWorkspaceStore((s) => s.activeBottomPane);
  const setActiveBottomPane = useWorkspaceStore((s) => s.setActiveBottomPane);
  const toggleBottomPanel = useWorkspaceStore((s) => s.toggleBottomPanel);

  return (
    <div className="flex h-full min-h-0 flex-col border-t border-[#1e2430] bg-[#0e1117]">
      <div className="flex h-9 items-center justify-between border-b border-[#1e2430] px-2">
        <div className="flex items-center gap-1">
          {bottomPanes.map(({ id, label, icon: Icon }) => {
            const active = activeBottomPane === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveBottomPane(id)}
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
        <button
          type="button"
          onClick={toggleBottomPanel}
          className="rounded px-2 py-1 text-[11px] text-[#6b7380] hover:bg-[#171c26] hover:text-white"
        >
          Hide
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <ActivePane pane={activeBottomPane} />
      </div>
    </div>
  );
}

export function RightPanes() {
  const activeRightPane = useWorkspaceStore((s) => s.activeRightPane);
  const setActiveRightPane = useWorkspaceStore((s) => s.setActiveRightPane);

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-[#1e2430] bg-[#0e1117]">
      <div className="flex h-9 items-center gap-1 overflow-x-auto border-b border-[#1e2430] px-2">
        {rightPanes.map(({ id, label, icon: Icon }) => {
          const active = activeRightPane === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveRightPane(id)}
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
        <ActivePane pane={activeRightPane} />
      </div>
    </div>
  );
}

export default function ToolPanes() {
  return <RightPanes />;
}
