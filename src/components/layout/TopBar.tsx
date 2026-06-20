"use client";

import Link from "next/link";
import { Bell, Search, Send } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1">
          <span
            className="bg-clip-text text-2xl font-extrabold tracking-tight text-transparent"
            style={{ backgroundImage: "var(--ring-gradient)" }}
          >
            getIt
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <Search className="h-[21px] w-[21px]" strokeWidth={1.8} />
          </Link>
          <button
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <Bell className="h-[22px] w-[22px]" strokeWidth={1.8} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-like ring-2 ring-surface" />
          </button>
          <button
            aria-label="Messages"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <Send className="h-[21px] w-[21px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}
