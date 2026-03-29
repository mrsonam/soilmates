import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a collection name")
    .max(120, "Name is too long"),
});

export const joinInviteSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Enter an invite code")
    .max(256, "Invite code is too long"),
});
