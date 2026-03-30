import type { CareLogActionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function findMatchingRemindersForCareLog(
  plantId: string,
  _actionType: CareLogActionType,
) {
  return prisma.reminder.findMany({
    where: {
      plantId,
      archivedAt: null,
      isActive: true,
      isPaused: false,
    },
  });
}
