"use client";

import { useState } from "react";
import { Box, Plus, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function PackagesPanel() {
  const packages = useWorkspaceStore((s) => s.packages);
  const addPackage = useWorkspaceStore((s) => s.addPackage);
  const removePackage = useWorkspaceStore((s) => s.removePackage);
  const appendConsoleLog = useWorkspaceStore((s) => s.appendConsoleLog);
  const [query, setQuery] = useState("");

  const install = () => {
    const name = query.trim();
    if (!name) return;
    addPackage(name);
    appendConsoleLog("stdout", `Installed ${name}`);
    setQuery("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1e2430] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a0]">
          Packages
        </span>
      </div>
      <div className="space-y-3 p-3">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && install()}
            placeholder="Search npm / pip…"
            className="min-w-0 flex-1 rounded-md border border-[#2a3344] bg-[#0b0e13] px-2.5 py-1.5 text-xs text-[#e8eaed] outline-none placeholder:text-[#5c6573] focus:border-[#1C4B39]"
          />
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-1 rounded-md bg-[#1C4B39] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#246348]"
          >
            <Plus className="h-3.5 w-3.5" />
            Install
          </button>
        </div>
        <ul className="space-y-1">
          {packages.map((pkg) => (
            <li
              key={pkg}
              className="flex items-center justify-between rounded-md border border-[#1e2430] bg-[#121722] px-2.5 py-2 text-xs text-[#d7dce5]"
            >
              <span className="inline-flex items-center gap-2">
                <Box className="h-3.5 w-3.5 text-[#7dd3a7]" />
                {pkg}
              </span>
              <button
                type="button"
                onClick={() => removePackage(pkg)}
                className="rounded p-1 text-[#6b7380] hover:text-red-400"
                aria-label={`Remove ${pkg}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
