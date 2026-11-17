import { ITEMS, UNIT_BY_ID } from "@/lib/game/set";
import type { Piece } from "@/lib/game/types";

const COST_VAR = ["", "var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

// A unit tile: the champion icon from Riot's public game data, a cost-colored
// border like the game uses, star pips and item slots.
// Highlight ring colors, shared with the legends that explain them.
export const HIGHLIGHT: Partial<Record<string, string>> = { bought: "var(--ink)", missed: "var(--hp)", flex: "var(--brand)" };

// A legend swatch: just the highlight ring.
export function HighlightSwatch({ state }: { state: "bought" | "missed" | "flex" }) {
  return (
    <span
      className="block h-[17px] w-[17px] rounded-[4px]"
      style={{ boxShadow: `inset 0 0 0 2px ${HIGHLIGHT[state]}` }}
    />
  );
}

export function UnitToken({
  piece,
  unitId,
  size = 52,
  state = "normal",
  showName = true,
  items: extraItems,
}: {
  piece?: Piece;
  unitId?: string;
  size?: number;
  state?: "normal" | "missed" | "bought" | "flex" | "dim";
  showName?: boolean;
  items?: string[]; // items to show on a bare unit (recommended builds)
}) {
  const id = piece?.unit ?? unitId!;
  const u = UNIT_BY_ID[id];
  const color = COST_VAR[u.cost];
  const star = piece?.star ?? 0;
  const small = size < 36;
  const b = small ? 1.5 : 2;
  const items = piece?.items ?? extraItems ?? [];
  // item icons: a row no wider than the portrait, so neighbours never touch
  const GAP = 2;
  const itemSize = (n: number) => Math.min(Math.round(size * 0.36), Math.floor((size - GAP * (n - 1)) / n));
  // a quarter of the icon sits on the portrait, three quarters below its bottom edge
  const below = (s: number) => Math.ceil(s * 0.75);
  const reserve = piece || extraItems ? below(itemSize(3)) + 3 : 0;
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: showName ? Math.max(size + 10, 76) : size, opacity: state === "dim" ? 0.55 : 1 }}>
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(6, size * 0.18),
          // board tiles always leave room for three items, so names line up across a row
          marginBottom: reserve,
          // the cost border always shows; a highlight is a second ring outside it
          boxShadow: HIGHLIGHT[state]
            ? `0 0 0 ${b}px ${color}, 0 0 0 ${b + 1.5}px var(--panel-2), 0 0 0 ${b + 3.5}px ${HIGHLIGHT[state]}`
            : `0 0 0 ${b}px ${color}`,
        }}
        title={`${u.name} · ${u.cost}-cost · ${u.traits.join(", ")}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/units/${id}.png`}
          alt={u.name}
          width={size}
          height={size}
          className="block h-full w-full object-cover"
          style={{ borderRadius: "inherit" }}
        />
        {star > 0 && (
          <span className="absolute -top-[7px] left-1/2 flex -translate-x-1/2 gap-[3px] rounded-full bg-[var(--bg)] px-1 py-[2px]">
            {Array.from({ length: star }).map((_, i) => (
              <span key={i} className="block h-[5px] w-[5px] rotate-45" style={{ background: star === 3 ? "var(--c5)" : "var(--ink)" }} />
            ))}
          </span>
        )}

        {items.length > 0 &&
          (() => {
            const s = itemSize(items.length);
            return (
              <span className="absolute left-1/2 flex w-max -translate-x-1/2" style={{ gap: GAP, bottom: -below(s) }}>
                {items.map((it, k) => (
                  <ItemIcon key={k} id={it} size={s} />
                ))}
              </span>
            );
          })()}
      </div>
      {showName && <span className="mt-0.5 block w-full truncate text-center text-[11px] leading-none text-[var(--ink-2)]" title={u.name}>{u.name}</span>}
    </div>
  );
}

export function ItemIcon({ id, size = 14 }: { id: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/items/${id}.png`}
      alt={ITEMS[id]}
      title={ITEMS[id]}
      width={size}
      height={size}
      className="block rounded-[3px]"
      style={{ width: size, height: size }}
    />
  );
}

export function ItemChip({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel-2)] py-1 pl-1 pr-2 text-[12px] text-[var(--ink-2)]">
      <ItemIcon id={id} size={18} />
      {ITEMS[id]}
    </span>
  );
}
