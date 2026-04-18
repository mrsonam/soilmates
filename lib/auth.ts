import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { randomUUID } from "crypto";
import { verifyPassword } from "@/lib/password-hash";
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

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return t.length > 0 ? t : null;
}

const credentialsProvider = Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const email = normalizeEmail(credentials?.email);
    const password =
      typeof credentials?.password === "string" ? credentials.password : "";
    if (!email || !password) return null;

    const profile = await prisma.profile.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        passwordHash: true,
        deletedAt: true,
      },
    });

    if (!profile?.passwordHash || profile.deletedAt) return null;

    const valid = await verifyPassword(password, profile.passwordHash);
    if (!valid) return null;

    return {
      id: profile.id,
      email: profile.email,
      name: profile.fullName,
      image: profile.avatarUrl,
    };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [...(googleProvider ? [googleProvider] : []), credentialsProvider],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return Boolean(user?.email);
      }

      if (account?.provider === "google") {
        if (!googleProvider || !user.email) {
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
      }

      return false;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      if (user && "id" in user && typeof user.id === "string" && user.id) {
        token.id = user.id;
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
