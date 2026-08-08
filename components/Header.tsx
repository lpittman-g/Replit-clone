"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Menu,
  Play,
  Square,
  Rocket,
  Lock,
  UserPlus,
  User,
  LayoutDashboard,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function Header() {
  const { data: session } = useSession();
  const projectName = useWorkspaceStore((s) => s.projectName);
  const isRunning = useWorkspaceStore((s) => s.isRunning);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const setActiveTool = useWorkspaceStore((s) => s.setActiveTool);
  const runProject = useWorkspaceStore((s) => s.runProject);
  const stopProject = useWorkspaceStore((s) => s.stopProject);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#1e2430] bg-[#0e1117] px-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-[#9aa4b2] transition hover:bg-[#1a2030] hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1C4B39] text-[10px] font-bold text-white">
            R
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#e8eaed]">
              {projectName}
            </p>
            <p className="truncate text-[10px] text-[#6b7380]">Workspace</p>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center">
        <button
          type="button"
          onClick={() => (isRunning ? stopProject() : runProject())}
          className="inline-flex items-center gap-2 rounded-md bg-[#1C4B39] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(28,75,57,0.6)] transition hover:bg-[#246348]"
        >
          {isRunning ? (
            <Square className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
          {isRunning ? "Stop" : "Run"}
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href={session?.user ? "/dashboard" : "/login"}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#9aa4b2] transition hover:bg-[#1a2030] hover:text-white"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          {session?.user ? "Dashboard" : "Sign in"}
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#2a3344] bg-[#151a23] px-2.5 py-1.5 text-xs font-medium text-[#d7dce5] transition hover:border-[#3a465c] hover:bg-[#1a2030]"
        >
          <Rocket className="h-3.5 w-3.5" />
          Deploy
        </button>
        <button
          type="button"
          onClick={() => setActiveTool("secrets")}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#9aa4b2] transition hover:bg-[#1a2030] hover:text-white"
        >
          <Lock className="h-3.5 w-3.5" />
          Secrets
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#9aa4b2] transition hover:bg-[#1a2030] hover:text-white"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite
        </button>
        <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#1C4B39] text-xs font-semibold text-white">
          <User className="h-3.5 w-3.5" />
        </div>
      </div>
    </header>
  );
}
