import { describe, expect, it } from "vitest";
import { collectionSlugSchema, plantSlugSchema } from "./entities";

describe("entity slug schemas", () => {
  it("accepts valid slugs", () => {
    expect(collectionSlugSchema.safeParse("my-garden").success).toBe(true);
    expect(plantSlugSchema.safeParse("monstera-deliciosa").success).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(collectionSlugSchema.safeParse("Bad Slug").success).toBe(false);
    expect(plantSlugSchema.safeParse("").success).toBe(false);
  });
});
