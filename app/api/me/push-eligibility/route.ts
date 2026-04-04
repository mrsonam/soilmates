import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPushPrerequisites } from "@/lib/push/eligibility";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prerequisites = await getPushPrerequisites(session.user.id);
  return NextResponse.json(prerequisites);
}
