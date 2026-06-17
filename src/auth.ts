import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOtp } from "@/lib/otp";
import { prisma, hasDatabase } from "@/lib/db";

async function uniqueUsername(phone: string): Promise<string> {
  const base = `user${phone.slice(-4)}`;
  if (!hasDatabase) return base;
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}${Math.floor(Math.random() * 9000) + 1000}`;
    const exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
  }
  return `${base}${Date.now().toString().slice(-5)}`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "otp",
      name: "Phone OTP",
      credentials: { phone: {}, code: {} },
      authorize: async (creds) => {
        const phone = String(creds?.phone ?? "");
        const code = String(creds?.code ?? "");
        const result = await verifyOtp(phone, code);
        if (!result.ok) return null;

        if (hasDatabase) {
          const user = await prisma.user.upsert({
            where: { phone: result.phone },
            update: {},
            create: {
              phone: result.phone,
              username: await uniqueUsername(result.phone),
              displayName: "New User",
            },
          });
          return {
            id: user.id,
            name: user.displayName,
            phone: user.phone,
            username: user.username,
            role: user.role,
          };
        }

        // No DB connected (dev): issue an ephemeral session keyed by phone.
        return {
          id: result.phone,
          name: "Guest",
          phone: result.phone,
          username: `user${result.phone.slice(-4)}`,
          role: "USER",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id as string;
        token.phone = user.phone;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.uid) session.user.id = token.uid as string;
        session.user.phone = token.phone as string | undefined;
        session.user.username = token.username as string | undefined;
        session.user.role = token.role as "USER" | "SELLER" | "ADMIN" | undefined;
      }
      return session;
    },
  },
});
