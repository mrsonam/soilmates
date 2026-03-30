import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ collectionSlug: string; plantSlug: string }>;
};

/** Consistent entry: dedicated URL opens the plant with Reminders tab selected. */
export default async function PlantRemindersRedirectPage({ params }: Props) {
  const { collectionSlug, plantSlug } = await params;
  redirect(
    `/collections/${collectionSlug}/plants/${plantSlug}?tab=reminders`,
  );
}
