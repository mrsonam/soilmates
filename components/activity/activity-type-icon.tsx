import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Droplets,
  FolderKanban,
  ImagePlus,
  MapPin,
  Repeat,
  RotateCcw,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import { ActivityEventTypes } from "@/lib/activity/event-types";

function iconForEventType(eventType: string): LucideIcon {
  switch (eventType) {
    case ActivityEventTypes.collectionCreated:
      return FolderKanban;
    case ActivityEventTypes.areaCreated:
    case ActivityEventTypes.areaUpdated:
      return MapPin;
    case ActivityEventTypes.plantAdded:
    case ActivityEventTypes.plantMoved:
      return Sprout;
    case ActivityEventTypes.careLogAdded:
    case ActivityEventTypes.careLogUpdated:
      return Droplets;
    case ActivityEventTypes.reminderCreated:
    case ActivityEventTypes.reminderCompleted:
      return Repeat;
    case ActivityEventTypes.imageUploaded:
    case ActivityEventTypes.coverImageChanged:
    case ActivityEventTypes.collectionCoverChanged:
    case ActivityEventTypes.areaCoverChanged:
      return ImagePlus;
    case ActivityEventTypes.inviteCreated:
    case ActivityEventTypes.inviteAccepted:
    case ActivityEventTypes.inviteDeclined:
    case ActivityEventTypes.inviteRevoked:
    case ActivityEventTypes.memberRemoved:
      return Users;
    case ActivityEventTypes.plantArchived:
    case ActivityEventTypes.areaArchived:
    case ActivityEventTypes.collectionArchived:
      return Archive;
    case ActivityEventTypes.plantRestored:
    case ActivityEventTypes.areaRestored:
    case ActivityEventTypes.collectionRestored:
      return RotateCcw;
    default:
      return Sparkles;
  }
}

export function ActivityTypeIcon({
  eventType,
  className = "size-4 text-primary",
}: {
  eventType: string;
  className?: string;
}) {
  const Icon = iconForEventType(eventType);
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}

export function ActivityAvatar({
  displayName,
  avatarUrl,
  className = "size-10",
}: {
  displayName: string;
  avatarUrl: string | null;
  className?: string;
}) {
  const initial = displayName.slice(0, 1).toUpperCase() || "?";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={`${className} rounded-full object-cover ring-2 ring-surface`}
      />
    );
  }
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-semibold text-primary ring-2 ring-surface`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
