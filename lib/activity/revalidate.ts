import { revalidatePath } from "next/cache";

export function revalidateActivityPaths(opts: {
  collectionSlug: string;
  plantSlug?: string;
}) {
  const { collectionSlug, plantSlug } = opts;
  revalidatePath("/activity");
  revalidatePath("/dashboard");
  revalidatePath(`/collections/${collectionSlug}`);
  revalidatePath(`/collections/${collectionSlug}/activity`);
  if (plantSlug) {
    revalidatePath(`/collections/${collectionSlug}/plants/${plantSlug}`);
  }
}
