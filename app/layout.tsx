import type { Metadata } from "next";
import "@xterm/xterm/css/xterm.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Replit Clone",
  description: "A browser-based IDE scaffold built with Next.js, Monaco, and Xterm.js.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
