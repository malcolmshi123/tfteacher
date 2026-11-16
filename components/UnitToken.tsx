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
}: {
  piece?: Piece;
  unitId?: string;
  size?: number;
  state?: "normal" | "missed" | "bought" | "flex" | "dim";
  showName?: boolean;
}) {
  const id = piece?.unit ?? unitId!;
  const u = UNIT_BY_ID[id];
  const color = COST_VAR[u.cost];
  const star = piece?.star ?? 0;
  const small = size < 36;
  const b = small ? 1.5 : 2;
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: showName ? Math.max(size + 10, 66) : size, opacity: state === "dim" ? 0.55 : 1 }}>
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(6, size * 0.18),
          // board tiles always leave room for item icons, so names line up across a row
          marginBottom: piece ? Math.round(size * 0.18) : 0,
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

        {piece && piece.items.length > 0 && (
          <span className="absolute left-1/2 flex -translate-x-1/2 gap-[2px]" style={{ bottom: -Math.round(size * 0.16) }}>
            {piece.items.map((it, k) => (
              <ItemIcon key={k} id={it} size={Math.max(11, Math.min(Math.round(size * 0.36), Math.floor((size - 2 * (piece.items.length - 1)) / piece.items.length)))} />
            ))}
          </span>
        )}
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
      style={{ width: size, height: size, boxShadow: "0 0 0 1.5px var(--bg)" }}
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
