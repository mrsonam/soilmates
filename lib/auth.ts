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

/** Profile.id is @db.Uuid — reject OAuth `sub` and other non-UUID values in the JWT. */
const PROFILE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isProfileUuid(id: unknown): id is string {
  return typeof id === "string" && PROFILE_UUID_RE.test(id);
}

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
      if (user?.email) {
        token.email = user.email;
      }
      const email = typeof token.email === "string" ? token.email : undefined;
      if (email && (!token.id || !isProfileUuid(token.id))) {
        const profile = await prisma.profile.findUnique({
          where: { email },
          select: { id: true },
        });
        if (profile) {
          token.id = profile.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      let id: string | undefined =
        token.id && isProfileUuid(token.id) ? token.id : undefined;
      if (!id && session.user.email) {
        const profile = await prisma.profile.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (profile) id = profile.id;
      }
      if (id) {
        session.user.id = id;
      } else {
        delete (session.user as { id?: string }).id;
      }
      return session;
    },
  },
});
