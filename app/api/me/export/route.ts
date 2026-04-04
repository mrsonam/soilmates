import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { buildUserDataExport } from "@/lib/data-export/build-export";
import {
  buildCareLogsCsv,
  buildPlantsCsv,
  buildRemindersCsv,
} from "@/lib/data-export/csv-export";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    const body = await buildUserDataExport(userId);
    return new NextResponse(JSON.stringify(body, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="soilmates-export-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (format === "csv") {
    const kind = searchParams.get("kind") ?? "plants";
    let text: string;
    let name: string;
    if (kind === "care_logs") {
      text = await buildCareLogsCsv(userId);
      name = `soilmates-care-logs-${stamp}.csv`;
    } else if (kind === "reminders") {
      text = await buildRemindersCsv(userId);
      name = `soilmates-reminders-${stamp}.csv`;
    } else {
      text = await buildPlantsCsv(userId);
      name = `soilmates-plants-${stamp}.csv`;
    }
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
