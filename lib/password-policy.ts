/**
 * Shared password rules for email/password auth (server + client UX).
 * Enforce only on the server for security; UI mirrors these checks in real time.
 */

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRequirementId =
  | "minLength"
  | "uppercase"
  | "lowercase"
  | "number"
  | "special";

export type PasswordRequirementState = Record<PasswordRequirementId, boolean>;

const SPECIAL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export const PASSWORD_REQUIREMENT_META: {
  id: PasswordRequirementId;
  label: string;
}[] = [
  { id: "minLength", label: `At least ${PASSWORD_MIN_LENGTH} characters` },
  { id: "uppercase", label: "One uppercase letter" },
  { id: "lowercase", label: "One lowercase letter" },
  { id: "number", label: "One number" },
  { id: "special", label: "One special character (!@#$…)" },
];

export function evaluatePasswordRequirements(
  password: string,
): PasswordRequirementState {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: SPECIAL_RE.test(password),
  };
}

export function passwordMeetsAllRequirements(password: string): boolean {
  const r = evaluatePasswordRequirements(password);
  return (
    r.minLength &&
    r.uppercase &&
    r.lowercase &&
    r.number &&
    r.special
  );
}
