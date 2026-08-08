"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import Header from "@/components/Header";
import StatusBar from "@/components/StatusBar";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import EditorWorkspace from "@/components/editor/EditorWorkspace";
import { BottomPanes, RightPanes } from "@/components/panes/ToolPanes";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function Workspace() {
  const bottomPanelOpen = useWorkspaceStore((s) => s.bottomPanelOpen);
  const toggleBottomPanel = useWorkspaceStore((s) => s.toggleBottomPanel);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#0e1117] text-[#e8eaed]">
      <KeyboardShortcuts />
      <Header />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <Group orientation="horizontal" className="min-h-0 min-w-0 flex-1">
          <Panel defaultSize="64%" minSize="35%">
            <div className="relative h-full min-h-0">
              <Group orientation="vertical" className="h-full min-h-0">
                <Panel
                  defaultSize={bottomPanelOpen ? "68%" : "100%"}
                  minSize="30%"
                >
                  <EditorWorkspace />
                </Panel>
                {bottomPanelOpen ? (
                  <>
                    <Separator className="h-1 bg-[#1e2430] transition hover:bg-[#2a3344]" />
                    <Panel defaultSize="32%" minSize="18%">
                      <BottomPanes />
                    </Panel>
                  </>
                ) : null}
              </Group>
              {!bottomPanelOpen ? (
                <button
                  type="button"
                  onClick={toggleBottomPanel}
                  className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#2a3344] bg-[#151a23] px-3 py-1 text-[11px] text-[#9aa4b2] shadow-lg hover:text-white"
                >
                  Show Shell
                </button>
              ) : null}
            </div>
          </Panel>
          <Separator className="w-1 bg-[#1e2430] transition hover:bg-[#2a3344]" />
          <Panel defaultSize="36%" minSize="22%">
            <RightPanes />
          </Panel>
        </Group>
      </div>
      <StatusBar />
    </div>
  );
}
