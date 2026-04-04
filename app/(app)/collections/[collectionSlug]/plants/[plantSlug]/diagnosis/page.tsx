import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ collectionSlug: string; plantSlug: string }>;
};

/** Focused URL for diagnosis; main UI lives on the plant detail Diagnosis tab. */
export default async function PlantDiagnosisPage({ params }: Props) {
  const { collectionSlug, plantSlug } = await params;
  redirect(
    `/collections/${collectionSlug}/plants/${plantSlug}?tab=assistant#plant-check-in`,
  );
}
