import type { LucideIcon } from "lucide-react";
import {
  Activity,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Settings,
  Sprout,
  FolderKanban,
} from "lucide-react";

export type NavEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Primary sidebar navigation (desktop). */
export const sidebarNav: NavEntry[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/collections", label: "Collections", icon: FolderKanban },
  { href: "/invitations", label: "Invitations", icon: Mail },
  { href: "/plants", label: "Plants", icon: Sprout },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/assistant", label: "Assistant", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Bottom tab bar (mobile) — matches primary app areas; Assistant stays desktop/sidebar. */
export const bottomNav: NavEntry[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/collections", label: "Collections", icon: FolderKanban },
  { href: "/plants", label: "Plants", icon: Sprout },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** First path segment after `/` (ignores query/hash). Used so nav active state matches top-level section only. */
function firstPathSegment(path: string): string | undefined {
  const pathOnly = path.split(/[?#]/)[0] ?? path;
  return pathOnly.split("/").filter(Boolean)[0];
}

export function isNavActive(pathname: string, href: string): boolean {
  const pathSeg = firstPathSegment(pathname);
  const hrefSeg = firstPathSegment(href);
  if (!hrefSeg) return false;
  return pathSeg === hrefSeg;
}

const pathOnly = (pathname: string) => pathname.split(/[?#]/)[0] ?? pathname;

/** Mobile bottom bar: highlights Plants when on global `/plants` or any collection plant list/detail. */
export function isBottomNavActive(pathname: string, href: string): boolean {
  const p = pathOnly(pathname);
  if (href === "/plants") {
    if (p === "/plants" || p.startsWith("/plants/")) return true;
    return /^\/collections\/[^/]+\/plants(\/|$)/.test(p);
  }
  return isNavActive(pathname, href);
}

/** Default page titles when no dynamic segment. */
export function titleForPath(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/collections" || pathname.startsWith("/collections/"))
    return "Collections";
  if (pathname.startsWith("/plants")) return "Plants";
  if (/^\/collections\/[^/]+\/plants/.test(pathname)) return "Plants";
  if (pathname.startsWith("/activity")) return "Activity";
  if (pathname.startsWith("/assistant")) return "Assistant";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/invitations")) return "Invitations";
  return "Soil Mates";
}
