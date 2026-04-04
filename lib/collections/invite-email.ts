/** Normalize invite / profile email for comparisons (lowercase, trim). */
export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}
