import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TrefleError } from "@/lib/integrations/trefle/client";
import { getPlantReference } from "@/lib/integrations/trefle/service";

type RouteContext = {
  params: Promise<{ identifier: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { identifier } = await params;

  try {
    const reference = await getPlantReference(identifier);
    return NextResponse.json({ reference });
  } catch (error) {
    if (error instanceof TrefleError) {
      return NextResponse.json(
        { error: "Unable to load plant reference right now." },
        { status: error.status >= 400 && error.status < 600 ? error.status : 503 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Unable to load plant reference right now." },
      { status: 503 },
    );
  }
}
