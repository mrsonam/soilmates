import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ collectionSlug: string; plantSlug: string }>;
};

/** Deep link: same plant detail with Assistant tab selected. */
export default async function PlantAssistantRoutePage({ params }: Props) {
  const { collectionSlug, plantSlug } = await params;
  redirect(
    `/collections/${collectionSlug}/plants/${plantSlug}?tab=assistant`,
  );
}
