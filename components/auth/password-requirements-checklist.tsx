"use client";

import { Check, Minus } from "lucide-react";
import {
  evaluatePasswordRequirements,
  PASSWORD_REQUIREMENT_META,
} from "@/lib/password-policy";

type PasswordRequirementsChecklistProps = {
  password: string;
};

export function PasswordRequirementsChecklist({
  password,
}: PasswordRequirementsChecklistProps) {
  const state = evaluatePasswordRequirements(password);

  return (
    <ul
      className="space-y-2 text-left text-[0.8125rem] leading-snug"
      aria-label="Password requirements"
    >
      {PASSWORD_REQUIREMENT_META.map(({ id, label }) => {
        const met = state[id];
        return (
          <li key={id} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full"
              aria-hidden
            >
              {met ? (
                <Check
                  className="size-3.5 text-primary"
                  strokeWidth={2.5}
                  aria-hidden
                />
              ) : (
                <Minus
                  className="size-3.5 text-on-surface-variant/45"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
            </span>
            <span
              className={
                met
                  ? "font-medium text-on-surface"
                  : "text-on-surface-variant"
              }
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
