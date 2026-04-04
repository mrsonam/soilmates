/**
 * Viewport-fixed placement for custom dropdowns (native-select-like):
 * align width to trigger, prefer below, flip above when needed, clamp horizontally.
 */

const GAP_PX = 6;
const VIEW_MARGIN_PX = 8;

export type FloatingDropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function computeFloatingDropdownPosition(
  triggerRect: DOMRect,
  options: {
    /** Dropdown width (usually trigger width) */
    width: number;
    /** Upper bound for scrollable list height (px), e.g. min(18rem, 70vh) */
    maxPanelHeightCapPx: number;
  },
): FloatingDropdownPosition {
  const m = VIEW_MARGIN_PX;
  const gap = GAP_PX;
  const cap = Math.max(80, options.maxPanelHeightCapPx);
  const w = options.width;

  let left = triggerRect.left;
  if (left + w > window.innerWidth - m) {
    left = Math.max(m, window.innerWidth - w - m);
  }
  if (left < m) left = m;

  const belowTop = triggerRect.bottom + gap;
  const spaceBelow = window.innerHeight - m - belowTop;
  const spaceAbove = triggerRect.top - gap - m;

  let top: number;
  let maxHeight: number;

  const belowFits = spaceBelow >= Math.min(cap, 160);
  const preferBelow = spaceBelow >= spaceAbove || belowFits;

  if (preferBelow && spaceBelow > 0) {
    top = belowTop;
    maxHeight = Math.min(cap, Math.max(80, spaceBelow));
  } else {
    maxHeight = Math.min(cap, Math.max(80, spaceAbove));
    top = triggerRect.top - gap - maxHeight;
    if (top < m) {
      top = m;
      maxHeight = Math.min(maxHeight, triggerRect.top - gap - m);
    }
  }

  return { top, left, width: w, maxHeight };
}
