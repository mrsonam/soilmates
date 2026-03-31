import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TrefleError } from "@/lib/integrations/trefle/client";
import { searchPlants } from "@/lib/integrations/trefle/service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchPlants(q);
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof TrefleError) {
      return NextResponse.json(
        { error: "Unable to load plant references right now." },
        { status: error.status >= 400 && error.status < 600 ? error.status : 503 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Unable to load plant references right now." },
      { status: 503 },
    );
  }
}
