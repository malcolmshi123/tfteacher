import { ITEMS, UNIT_BY_ID } from "@/lib/game/set";
import type { Piece } from "@/lib/game/types";

const COST_VAR = ["", "var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

// Units are drawn in code: a cost-colored tile with the unit's initials, star
// pips and item slots. No game art.
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
  state?: "normal" | "missed" | "bought" | "dim";
  showName?: boolean;
}) {
  const id = piece?.unit ?? unitId!;
  const u = UNIT_BY_ID[id];
  const color = COST_VAR[u.cost];
  const star = piece?.star ?? 0;
  const ring =
    state === "missed"
      ? "0 0 0 2px var(--bg), 0 0 0 4px var(--hp)"
      : state === "bought"
        ? "0 0 0 2px var(--bg), 0 0 0 4px var(--good)"
        : undefined;
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: size + 8, opacity: state === "dim" ? 0.45 : 1 }}>
      <div
        className="relative grid place-items-center rounded-[10px]"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(160deg, color-mix(in oklab, ${color} 30%, var(--panel-2)) 0%, color-mix(in oklab, ${color} 10%, var(--panel)) 100%)`,
          boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${color} 70%, transparent)${ring ? ", " + ring : ""}`,
        }}
        title={`${u.name} · ${u.cost}-cost · ${u.traits.join(", ")}`}
      >
        <span className="text-[15px] font-semibold tracking-tight" style={{ color: `color-mix(in oklab, ${color} 55%, white)`, fontSize: size * 0.3 }}>
          {u.name.slice(0, 2)}
        </span>
        {star > 0 && (
          <span className="absolute -top-[7px] left-1/2 flex -translate-x-1/2 gap-[3px] rounded-full bg-[var(--bg)] px-1 py-[2px]">
            {Array.from({ length: star }).map((_, i) => (
              <span key={i} className="block h-[5px] w-[5px] rotate-45" style={{ background: star === 3 ? "var(--c5)" : "var(--ink-2)" }} />
            ))}
          </span>
        )}
        {piece && piece.items.length > 0 && (
          <span className="absolute -bottom-[5px] left-1/2 flex -translate-x-1/2 gap-[3px]">
            {piece.items.map((it) => (
              <span key={it} title={ITEMS[it]} className="block h-[9px] w-[9px] rounded-[3px] border border-[var(--bg)]" style={{ background: itemColor(it) }} />
            ))}
          </span>
        )}
      </div>
      {showName && <span className="text-[11px] leading-none text-[var(--muted)]">{u.name}</span>}
    </div>
  );
}

const ITEM_COLORS: Record<string, string> = {
  edge: "#e8e2d4", bow: "#f2a65a", rod: "#e8605a", tear: "#5aa9f2", vest: "#9aa3af",
  cloak: "#7cc4c0", belt: "#d47a5a", glove: "#e6c95a", staff: "#a68af0", guard: "#8fb3a0", hunter: "#d4d46a",
};

export function itemColor(id: string) {
  return ITEM_COLORS[id] ?? "#888";
}

export function ItemChip({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 text-[12px] text-[var(--ink-2)]">
      <span className="block h-[10px] w-[10px] rounded-[3px]" style={{ background: itemColor(id) }} />
      {ITEMS[id]}
    </span>
  );
}
