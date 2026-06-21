"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";
import { useSocial } from "@/lib/store/social";
import { relativeTime } from "@/lib/utils";

export function CommentSheet({
  open,
  onClose,
  commentKey,
}: {
  open: boolean;
  onClose: () => void;
  commentKey: string;
}) {
  const comments = useSocial((s) => s.comments[commentKey] ?? []);
  const addComment = useSocial((s) => s.addComment);
  const [text, setText] = useState("");

  if (!open) return null;

  function submit() {
    const t = text.trim();
    if (!t) return;
    addComment(commentKey, t);
    setText("");
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col justify-end">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative flex max-h-[70%] flex-col rounded-t-3xl bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-bold">Comments</h3>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <span className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-[var(--ring-gradient)]" />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">you</span>{" "}
                    <span className="text-[11px] text-muted">{relativeTime(c.createdAt)}</span>
                  </p>
                  <p className="text-sm text-muted-strong">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Add a comment…"
            className="h-10 flex-1 rounded-full border border-border bg-surface-muted px-4 text-sm outline-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            aria-label="Send"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
