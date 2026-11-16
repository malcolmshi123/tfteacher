import { ITEMS, UNIT_BY_ID, UNIT_MARK } from "@/lib/game/set";
import type { Piece } from "@/lib/game/types";
import { TraitGlyph } from "./TraitGlyph";

const COST_VAR = ["", "var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

// Units are drawn in code: a cost-colored tile with the unit's main trait crest,
// its second trait in the corner, star pips and item slots. No game art.
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
  const small = size < 36;
  const border =
    state === "missed" ? "inset 0 0 0 2px var(--hp)" : state === "bought" ? "inset 0 0 0 2.5px var(--ink)" : `inset 0 0 0 1.5px color-mix(in oklab, ${color} 75%, transparent)`;
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: size + (showName ? 10 : 0), opacity: state === "dim" ? 0.55 : 1 }}>
      <div
        className="relative grid place-items-center"
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(7, size * 0.22),
          background:
            state === "missed"
              ? `linear-gradient(160deg, color-mix(in oklab, var(--hp) 32%, var(--panel-2)), color-mix(in oklab, var(--hp) 12%, var(--panel)))`
              : `radial-gradient(120% 90% at 30% 15%, color-mix(in oklab, ${color} 38%, var(--panel-2)) 0%, color-mix(in oklab, ${color} 12%, var(--panel)) 70%)`,
          boxShadow: border,
        }}
        title={`${u.name} · ${u.cost}-cost · ${u.traits.join(", ")}`}
      >
        {/* each unit: its own letter as the main mark, main trait as a crest behind it */}
        <span className="absolute inset-0 grid place-items-center opacity-30">
          <TraitGlyph trait={u.traits[0]} size={size * 0.78} color={`color-mix(in oklab, ${color} 70%, white)`} />
        </span>
        <span className="relative font-semibold leading-none" style={{ fontSize: size * (UNIT_MARK[id].length > 1 ? 0.34 : 0.42), color: `color-mix(in oklab, ${color} 35%, white)`, textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
          {UNIT_MARK[id]}
        </span>
        {!small && (
          <span className="absolute bottom-[3px] right-[3px] opacity-70">
            <TraitGlyph trait={u.traits[1]} size={Math.max(9, size * 0.22)} color={`color-mix(in oklab, ${color} 45%, var(--ink-2))`} />
          </span>
        )}
        {star > 0 && (
          <span className="absolute -top-[7px] left-1/2 flex -translate-x-1/2 gap-[3px] rounded-full bg-[var(--bg)] px-1 py-[2px]">
            {Array.from({ length: star }).map((_, i) => (
              <span key={i} className="block h-[5px] w-[5px] rotate-45" style={{ background: star === 3 ? "var(--c5)" : "var(--ink)" }} />
            ))}
          </span>
        )}
        {state === "missed" && <Badge color="var(--hp)">2★</Badge>}

        {piece && piece.items.length > 0 && (
          <span className="absolute -bottom-[6px] left-1/2 flex -translate-x-1/2 gap-[2px] rounded-[4px] bg-[var(--bg)] p-[2px]">
            {piece.items.map((it) => (
              <span key={it} title={ITEMS[it]} className="block h-[8px] w-[8px] rounded-[2px]" style={{ background: itemColor(it) }} />
            ))}
          </span>
        )}
      </div>
      {showName && <span className="mt-0.5 text-[11px] leading-none text-[var(--ink-2)]">{u.name}</span>}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="absolute -right-[6px] -top-[6px] grid h-[15px] min-w-[15px] place-items-center rounded-full px-[3px] text-[8.5px] font-bold leading-none text-[var(--bg)]" style={{ background: color, boxShadow: "0 0 0 2px var(--panel)" }}>
      {children}
    </span>
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
