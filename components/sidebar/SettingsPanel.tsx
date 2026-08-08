"use client";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function SettingsPanel() {
  const settings = useWorkspaceStore((s) => s.settings);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1e2430] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a0]">
          Settings
        </span>
      </div>
      <div className="space-y-4 overflow-auto p-3 text-xs text-[#c5cbd5]">
        <label className="block space-y-1.5">
          <span className="text-[#8b93a0]">Theme</span>
          <select
            value={settings.theme}
            onChange={(e) =>
              updateSettings({
                theme: e.target.value as "dark" | "light",
              })
            }
            className="w-full rounded-md border border-[#2a3344] bg-[#0b0e13] px-2.5 py-1.5 outline-none focus:border-[#1C4B39]"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[#8b93a0]">
            Font size ({settings.fontSize}px)
          </span>
          <input
            type="range"
            min={12}
            max={20}
            value={settings.fontSize}
            onChange={(e) =>
              updateSettings({ fontSize: Number(e.target.value) })
            }
            className="w-full accent-[#1C4B39]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[#8b93a0]">Indent type</span>
          <select
            value={settings.indentType}
            onChange={(e) =>
              updateSettings({
                indentType: e.target.value as "spaces" | "tabs",
              })
            }
            className="w-full rounded-md border border-[#2a3344] bg-[#0b0e13] px-2.5 py-1.5 outline-none focus:border-[#1C4B39]"
          >
            <option value="spaces">Spaces</option>
            <option value="tabs">Tabs</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[#8b93a0]">
            Indent size ({settings.indentSize})
          </span>
          <input
            type="range"
            min={2}
            max={8}
            step={2}
            value={settings.indentSize}
            onChange={(e) =>
              updateSettings({ indentSize: Number(e.target.value) })
            }
            className="w-full accent-[#1C4B39]"
          />
        </label>
      </div>
    </div>
  );
}
