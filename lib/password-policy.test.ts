import { describe, expect, it } from "vitest";
import {
  evaluatePasswordRequirements,
  passwordMeetsAllRequirements,
} from "./password-policy";

describe("passwordMeetsAllRequirements", () => {
  it("accepts a strong password", () => {
    expect(passwordMeetsAllRequirements("Good1!pass")).toBe(true);
  });

  it("rejects short password", () => {
    expect(passwordMeetsAllRequirements("Aa1!xyz")).toBe(false);
  });

  it("rejects when missing special", () => {
    expect(passwordMeetsAllRequirements("GoodPass12")).toBe(false);
  });
});

describe("evaluatePasswordRequirements", () => {
  it("tracks each rule independently", () => {
    const r = evaluatePasswordRequirements("a");
    expect(r.lowercase).toBe(true);
    expect(r.minLength).toBe(false);
    expect(r.uppercase).toBe(false);
    expect(r.number).toBe(false);
    expect(r.special).toBe(false);
  });
});
