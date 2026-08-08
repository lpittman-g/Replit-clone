"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Plus, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function SecretsPanel() {
  const secrets = useWorkspaceStore((s) => s.secrets);
  const addSecret = useWorkspaceStore((s) => s.addSecret);
  const removeSecret = useWorkspaceStore((s) => s.removeSecret);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const submit = () => {
    if (!key.trim() || !value.trim()) return;
    addSecret(key.trim(), value.trim());
    setKey("");
    setValue("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1e2430] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a0]">
          Secrets
        </span>
      </div>
      <div className="space-y-3 overflow-auto p-3">
        <div className="space-y-2 rounded-md border border-[#1e2430] bg-[#121722] p-2.5">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="KEY"
            className="w-full rounded-md border border-[#2a3344] bg-[#0b0e13] px-2.5 py-1.5 text-xs text-[#e8eaed] outline-none focus:border-[#1C4B39]"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="value"
            className="w-full rounded-md border border-[#2a3344] bg-[#0b0e13] px-2.5 py-1.5 text-xs text-[#e8eaed] outline-none focus:border-[#1C4B39]"
          />
          <button
            type="button"
            onClick={submit}
            className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-[#1C4B39] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#246348]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add secret
          </button>
        </div>

        <ul className="space-y-1.5">
          {secrets.map((secret) => {
            const show = revealed[secret.id];
            return (
              <li
                key={secret.id}
                className="rounded-md border border-[#1e2430] bg-[#121722] px-2.5 py-2"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#e8eaed]">
                    <Lock className="h-3 w-3 text-[#7dd3a7]" />
                    {secret.key}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((prev) => ({
                          ...prev,
                          [secret.id]: !prev[secret.id],
                        }))
                      }
                      className="rounded p-1 text-[#6b7380] hover:text-white"
                    >
                      {show ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSecret(secret.id)}
                      className="rounded p-1 text-[#6b7380] hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="truncate font-mono text-[11px] text-[#8b93a0]">
                  {show ? secret.value : "••••••••••••••••"}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
