import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { userHasActiveCollection } from "@/lib/collections/memberships";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const hasCollection = await userHasActiveCollection(session.user.id);
  if (hasCollection) {
    redirect("/dashboard");
  }

  redirect("/onboarding/collections");
}
