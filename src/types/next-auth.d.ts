import type { DefaultSession } from "next-auth";

type Role = "USER" | "SELLER" | "ADMIN";

declare module "next-auth" {
  interface User {
    phone?: string;
    username?: string;
    role?: Role;
  }
  interface Session {
    user: {
      id?: string;
      phone?: string;
      username?: string;
      role?: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    phone?: string;
    username?: string;
    role?: Role;
  }
}
