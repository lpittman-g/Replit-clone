"use client";

import { Database, Table2 } from "lucide-react";

const tables = [
  { name: "users", rows: 128 },
  { name: "projects", rows: 42 },
  { name: "sessions", rows: 903 },
];

export default function DatabasePanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1e2430] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a0]">
          Database
        </span>
      </div>
      <div className="space-y-3 overflow-auto p-3">
        <div className="rounded-md border border-[#1e2430] bg-[#121722] px-2.5 py-2 text-xs text-[#d7dce5]">
          <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
            <Database className="h-3.5 w-3.5 text-[#7dd3a7]" />
            PostgreSQL
          </div>
          <p className="text-[#6b7380]">localhost:5432 / app</p>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] uppercase tracking-wide text-[#6b7380]">
            Tables
          </p>
          <ul className="space-y-1">
            {tables.map((table) => (
              <li
                key={table.name}
                className="flex items-center justify-between rounded-md border border-[#1e2430] bg-[#121722] px-2.5 py-2 text-xs text-[#c5cbd5]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Table2 className="h-3.5 w-3.5 text-[#8b93a0]" />
                  {table.name}
                </span>
                <span className="text-[#6b7380]">{table.rows} rows</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-[#1e2430] bg-[#0b0e13] p-2.5 font-mono text-[11px] text-[#9aa4b2]">
          <p className="mb-1 text-[#6b7380]">SQL preview</p>
          <pre>{`SELECT id, email, created_at
FROM users
ORDER BY created_at DESC
LIMIT 25;`}</pre>
        </div>
      </div>
    </div>
  );
}
