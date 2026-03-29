import { z } from "zod";

export const createAreaSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter an area name")
      .max(120, "Name is too long"),
    description: z.string().trim().max(500, "Description is too long").optional(),
  })
  .transform((d) => ({
    name: d.name,
    description:
      d.description && d.description.length > 0 ? d.description : undefined,
  }));

export const updateAreaSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter an area name")
      .max(120, "Name is too long"),
    description: z.string().trim().max(500, "Description is too long").optional(),
  })
  .transform((d) => ({
    name: d.name,
    description:
      d.description && d.description.length > 0 ? d.description : null,
  }));
