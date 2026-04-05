import type { CareLogCreatorSnapshot } from "@/lib/optimistic/care-log";

export function careLogCreatorFromProfile(profile: {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}): CareLogCreatorSnapshot {
  return {
    userId: profile.id,
    displayName:
      profile.name?.trim() ||
      profile.email?.split("@")[0]?.trim() ||
      "You",
    avatarUrl: profile.image,
  };
}
