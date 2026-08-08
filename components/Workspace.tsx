"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import Header from "@/components/Header";
import StatusBar from "@/components/StatusBar";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import EditorWorkspace from "@/components/editor/EditorWorkspace";
import ToolPanes from "@/components/panes/ToolPanes";

export default function Workspace() {
  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#0e1117] text-[#e8eaed]">
      <Header />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <Group orientation="horizontal" className="min-h-0 min-w-0 flex-1">
          <Panel defaultSize="62%" minSize="30%">
            <EditorWorkspace />
          </Panel>
          <Separator className="w-1 bg-[#1e2430] transition data-[separator=active]:bg-[#1C4B39] hover:bg-[#2a3344]" />
          <Panel defaultSize="38%" minSize="22%">
            <ToolPanes />
          </Panel>
        </Group>
      </div>
      <StatusBar />
    </div>
  );
}
