"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

interface SocialState {
  likedPosts: Record<string, true>;
  likedReels: Record<string, true>;
  saved: Record<string, true>; // product ids
  follows: Record<string, true>; // usernames
  comments: Record<string, Comment[]>; // key: "post:<id>" | "reel:<id>"

  toggleLikePost: (id: string) => void;
  toggleLikeReel: (id: string) => void;
  toggleSave: (productId: string) => void;
  toggleFollow: (username: string) => void;
  addComment: (key: string, text: string) => void;
}

function flip(map: Record<string, true>, id: string): Record<string, true> {
  const next = { ...map };
  if (next[id]) delete next[id];
  else next[id] = true;
  return next;
}

export const useSocial = create<SocialState>()(
  persist(
    (set) => ({
      likedPosts: {},
      likedReels: {},
      saved: {},
      follows: {},
      comments: {},

      toggleLikePost: (id) => set((s) => ({ likedPosts: flip(s.likedPosts, id) })),
      toggleLikeReel: (id) => set((s) => ({ likedReels: flip(s.likedReels, id) })),
      toggleSave: (productId) => set((s) => ({ saved: flip(s.saved, productId) })),
      toggleFollow: (username) => set((s) => ({ follows: flip(s.follows, username) })),
      addComment: (key, text) =>
        set((s) => ({
          comments: {
            ...s.comments,
            [key]: [
              ...(s.comments[key] ?? []),
              { id: `c_${Date.now().toString(36)}`, text, createdAt: new Date().toISOString() },
            ],
          },
        })),
    }),
    { name: "getit-social" },
  ),
);
