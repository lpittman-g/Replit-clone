import type { Metadata } from "next";
<<<<<<< HEAD
import "@xterm/xterm/css/xterm.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Replit Clone",
  description: "A browser-based IDE scaffold built with Next.js, Monaco, and Xterm.js.",
=======
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Replit Clone",
  description: "A Replit-inspired online IDE workspace",
>>>>>>> origin/main
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
<<<<<<< HEAD
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
=======
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-[#0e1117] text-[#e8eaed]">
        {children}
      </body>
>>>>>>> origin/main
    </html>
  );
}
