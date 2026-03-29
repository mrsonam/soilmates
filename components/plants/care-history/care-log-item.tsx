"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import { formatCareLogWhen } from "@/lib/format";
import { CareLogActionBadge } from "./care-log-action-badge";
import { CareLogMetaSummary } from "./care-log-meta-summary";
import { careLogActionIcon } from "./care-log-ui";

type CareLogItemProps = {
  log: CareLogListItem;
  isOwner: boolean;
  isLast: boolean;
  onEdit: (log: CareLogListItem) => void;
  onDelete: (log: CareLogListItem) => void;
};

export function CareLogItem({
  log,
  isOwner,
  isLast,
  onEdit,
  onDelete,
}: CareLogItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const Icon = careLogActionIcon(log.actionType);

  return (
    <li className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed/40 text-primary ring-4 ring-surface-container-lowest">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        {!isLast ? (
          <span
            className="mt-2 w-px flex-1 min-h-[2rem] bg-outline-variant/25"
            aria-hidden
          />
        ) : null}
      </div>

      <article className="min-w-0 flex-1 pb-8">
        <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CareLogActionBadge actionType={log.actionType} />
              <p className="mt-2 text-sm text-on-surface-variant">
                <time dateTime={log.actionAt}>{formatCareLogWhen(log.actionAt)}</time>
                <span className="text-on-surface-variant/50"> · </span>
                <span className="inline-flex items-center gap-2">
                  {log.creator.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={log.creator.avatarUrl}
                      alt=""
                      className="size-5 rounded-full object-cover ring-1 ring-outline-variant/15"
                    />
                  ) : (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[0.6rem] font-semibold text-primary">
                      {log.creator.displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="font-medium text-on-surface">
                    {log.creator.displayName}
                  </span>
                </span>
              </p>
            </div>
            {isOwner ? (
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Log actions"
                >
                  <MoreVertical className="size-5" strokeWidth={1.5} aria-hidden />
                </button>
                {menuOpen ? (
                  <ul
                    className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-2xl bg-surface-container-lowest py-1 shadow-lg ring-1 ring-outline-variant/15"
                    role="menu"
                  >
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-on-surface transition hover:bg-surface-container-low"
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(log);
                        }}
                      >
                        <Pencil className="size-4" strokeWidth={1.75} aria-hidden />
                        Edit
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-700 transition hover:bg-red-50/80"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(log);
                        }}
                      >
                        <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                        Delete
                      </button>
                    </li>
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          {log.notes?.trim() ? (
            <p className="mt-3 text-sm leading-relaxed text-on-surface">
              {log.notes.trim()}
            </p>
          ) : null}

          <CareLogMetaSummary metadata={log.metadata} />

          {log.tags.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {log.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-surface-container-high px-2 py-0.5 text-[0.65rem] font-medium text-on-surface-variant"
                >
                  #{t}
                </li>
              ))}
            </ul>
          ) : null}

          {log.imageAttachmentCount > 0 ? (
            <p className="mt-2 text-xs text-on-surface-variant">
              {log.imageAttachmentCount} photo
              {log.imageAttachmentCount === 1 ? "" : "s"} (attachments coming soon)
            </p>
          ) : null}
        </div>
      </article>
    </li>
  );
}
