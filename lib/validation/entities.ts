import { z } from "zod";

/** URL-safe collection slug segment */
export const collectionSlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid collection slug");

export const plantSlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid plant slug");

export const cuidLikeSchema = z.string().min(10).max(40);
