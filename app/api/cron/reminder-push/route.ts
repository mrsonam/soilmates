/**
 * Reminder push delivery — intended to be called by an external scheduler
 * (e.g. https://console.cron-job.org/jobs ) with GET + optional Bearer auth.
 */
import { NextResponse } from "next/server";
import { deliverReminderNotifications } from "@/lib/push/deliver-reminders";

export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  try {
    const result = await deliverReminderNotifications(new Date());
    return NextResponse.json(result);
  } catch (e) {
    console.error("[cron/reminder-push]", e);
    return NextResponse.json(
      { error: "Delivery failed" },
      { status: 500 },
    );
  }
}
