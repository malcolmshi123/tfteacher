import { ordinal, placeColor } from "@/lib/review/engine";

// One placement badge everywhere: number and suffix in the tactics.tools color, tinted fill, matching border.
const SIZES = {
  sm: "h-6 min-w-[34px] rounded-md px-1.5 text-[13px] [&_.sfx]:text-[10px]",
  md: "h-8 min-w-[42px] rounded-lg px-2 text-[16px] [&_.sfx]:text-[11px]",
  lg: "h-12 w-12 rounded-xl text-[20px] md:h-14 md:w-14 md:text-[22px] [&_.sfx]:text-[12px] md:[&_.sfx]:text-[13px]",
} as const;

export function PlaceBadge({ place, size = "sm" }: { place: number; size?: keyof typeof SIZES }) {
  const c = placeColor(place);
  return (
    <span
      className={`tnum inline-flex shrink-0 items-center justify-center border font-semibold leading-none ${SIZES[size]}`}
      style={{ color: c, borderColor: `color-mix(in oklab, ${c} 60%, transparent)`, background: `color-mix(in oklab, ${c} 14%, var(--panel-2))` }}
    >
      {place}
      <span className="sfx ml-px font-medium">{ordinal(place).slice(String(place).length)}</span>
    </span>
  );
}
