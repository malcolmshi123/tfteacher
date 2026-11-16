import { ITEMS, UNIT_BY_ID } from "@/lib/game/set";
import type { Piece } from "@/lib/game/types";

const COST_VAR = ["", "var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

// A unit tile: the champion icon from Riot's public game data, a cost-colored
// border like the game uses, star pips and item slots.
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
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: size + (showName ? 10 : 0), opacity: state === "dim" ? 0.55 : 1 }}>
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(6, size * 0.18),
          marginBottom: piece?.items.length ? Math.round(size * 0.18) : 0,
          boxShadow: state === "bought" ? `0 0 0 2px var(--panel-2), 0 0 0 4px var(--ink)` : `0 0 0 ${small ? 1.5 : 2}px ${state === "missed" ? "var(--hp)" : color}`,
        }}
        title={`${u.name} · ${u.cost}-cost · ${u.traits.join(", ")}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/units/${id}.png`}
          alt={u.name}
          width={size}
          height={size}
          loading="lazy"
          className="block h-full w-full object-cover"
          style={{ borderRadius: "inherit", filter: state === "missed" ? "saturate(0.6)" : undefined }}
        />
        {state === "missed" && <span className="absolute inset-0" style={{ borderRadius: "inherit", background: "color-mix(in oklab, var(--hp) 28%, transparent)" }} />}
        {state === "bought" && <span className="absolute inset-0" style={{ borderRadius: "inherit", boxShadow: "inset 0 0 0 2.5px var(--ink)" }} />}
        {star > 0 && (
          <span className="absolute -top-[7px] left-1/2 flex -translate-x-1/2 gap-[3px] rounded-full bg-[var(--bg)] px-1 py-[2px]">
            {Array.from({ length: star }).map((_, i) => (
              <span key={i} className="block h-[5px] w-[5px] rotate-45" style={{ background: star === 3 ? "var(--c5)" : "var(--ink)" }} />
            ))}
          </span>
        )}
        {state === "missed" && <Badge color="var(--hp)">2★</Badge>}

        {piece && piece.items.length > 0 && (
          <span className="absolute left-1/2 flex -translate-x-1/2 gap-[2px]" style={{ bottom: -Math.round(size * 0.16) }}>
            {piece.items.map((it, k) => (
              <ItemIcon key={k} id={it} size={Math.max(11, Math.min(Math.round(size * 0.36), Math.floor((size - 2 * (piece.items.length - 1)) / piece.items.length)))} />
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
