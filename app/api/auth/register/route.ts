import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/password-hash";
import { passwordMeetsAllRequirements } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";

const registerBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.toLowerCase())
    .pipe(z.email()),
  password: z.string().min(1),
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(120),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = registerBodySchema.safeParse(json);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ?? "Check your details and try again.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { email, password, fullName } = parsed.data;

  if (!passwordMeetsAllRequirements(password)) {
    return NextResponse.json(
      { error: "Password does not meet all requirements." },
      { status: 400 },
    );
  }

  const existing = await prisma.profile.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, deletedAt: true },
  });

  if (existing && !existing.deletedAt) {
    if (!existing.passwordHash) {
      return NextResponse.json(
        {
          error:
            "This email is already used with Google. Sign in with Google instead.",
          code: "OAUTH_ONLY",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.profile.create({
      data: {
        id: randomUUID(),
        email,
        fullName,
        passwordHash,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not create account. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
