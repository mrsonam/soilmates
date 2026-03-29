import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "NEXTAUTH_SECRET is not set. Add it to .env (e.g. openssl rand -base64 32).",
  );
}

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [...(googleProvider ? [googleProvider] : [])],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!googleProvider || account?.provider !== "google" || !user.email) {
        return false;
      }

      await prisma.profile.upsert({
        where: { email: user.email },
        create: {
          id: randomUUID(),
          email: user.email,
          fullName: user.name ?? null,
          avatarUrl: user.image ?? null,
        },
        update: {
          fullName: user.name ?? undefined,
          avatarUrl: user.image ?? undefined,
          deletedAt: null,
        },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email && !token.id) {
        const profile = await prisma.profile.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        if (profile) {
          token.id = profile.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
