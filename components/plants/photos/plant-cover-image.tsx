import { PlantImagePlaceholder } from "@/components/plants/plant-image-placeholder";

type PlantCoverImageProps = {
  imageUrl: string | null;
  alt: string;
  className?: string;
};

/**
 * Presentational cover for plant hero and other surfaces. Prefer signed URLs
 * passed from the server after auth checks.
 */
export function PlantCoverImage({
  imageUrl,
  alt,
  className,
}: PlantCoverImageProps) {
  if (imageUrl) {
    return (
      <div
        className={
          className ??
          "overflow-hidden rounded-3xl bg-surface-container-low shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- signed or legacy URL */}
        <img src={imageUrl} alt={alt} className="aspect-[4/3] w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={
        className ??
        "overflow-hidden rounded-3xl shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]"
      }
    >
      <PlantImagePlaceholder className="aspect-[4/3]" />
    </div>
  );
}
