"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function TerminalPane() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const writtenCount = useRef(0);
  const terminalOutput = useWorkspaceStore((s) => s.terminalOutput);
  const appendTerminalOutput = useWorkspaceStore((s) => s.appendTerminalOutput);

  useEffect(() => {
    if (!containerRef.current || termRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      theme: {
        background: "#0b0e13",
        foreground: "#d7dce5",
        cursor: "#7dd3a7",
        selectionBackground: "#1C4B39",
        red: "#f87171",
      },
      convertEol: true,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();

    let command = "";
    term.onData((data) => {
      if (data === "\r") {
        const trimmed = command.trim();
        term.write("\r\n");
        if (trimmed === "run") {
          useWorkspaceStore.getState().runProject();
        } else if (trimmed === "clear") {
          term.clear();
          writtenCount.current =
            useWorkspaceStore.getState().terminalOutput.length;
        } else if (trimmed) {
          appendTerminalOutput(
            `sh: unknown command \`${trimmed}\` — try \`run\` or use the Run button`,
          );
        }
        command = "";
        return;
      }
      if (data === "\u0003") {
        useWorkspaceStore.getState().stopProject();
        command = "";
        term.write("^C\r\n");
        return;
      }
      if (data === "\u007f") {
        if (command.length > 0) {
          command = command.slice(0, -1);
          term.write("\b \b");
        }
        return;
      }
      if (data.length === 1 && data.charCodeAt(0) < 32) {
        return;
      }
      command += data;
      term.write(data);
    });

    termRef.current = term;
    fitRef.current = fit;

    const observer = new ResizeObserver(() => fit.fit());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
      writtenCount.current = 0;
    };
  }, [appendTerminalOutput]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    const next = terminalOutput.slice(writtenCount.current);
    for (const line of next) {
      term.writeln(line);
    }
    writtenCount.current = terminalOutput.length;
    fitRef.current?.fit();
  }, [terminalOutput]);

  return <div ref={containerRef} className="h-full w-full bg-[#0b0e13] p-2" />;
}
