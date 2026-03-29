import { redirect } from "next/navigation";

export default async function CollectionsChooseRedirectPage() {
  redirect("/collections");
}
