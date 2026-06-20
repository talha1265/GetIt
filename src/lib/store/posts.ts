"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalPost {
  id: string;
  imageUrl: string; // data URL (compressed) so it survives reloads
  caption: string;
  taggedProductId?: string;
  createdAt: string;
}

interface PostsState {
  posts: LocalPost[];
  addPost: (post: Omit<LocalPost, "id" | "createdAt">) => string;
}

/** Posts the user creates locally (works with no backend; shown on home + profile). */
export const usePosts = create<PostsState>()(
  persist(
    (set) => ({
      posts: [],
      addPost: (post) => {
        const id = `lp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        set((s) => ({
          posts: [{ ...post, id, createdAt: new Date().toISOString() }, ...s.posts],
        }));
        return id;
      },
    }),
    { name: "getit-posts" },
  ),
);
