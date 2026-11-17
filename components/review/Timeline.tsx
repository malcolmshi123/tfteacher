"use client";

import type { SeriesPoint } from "@/lib/review/engine";

// Layout in viewBox units. The compact (landing) version is drawn narrower, so the
// same font sizes render larger, and it gets more room between the lanes.
function layout(compact: boolean) {
  const FS = 12; // label size
  const PAD_L = compact ? 30 : 34;
  const PAD_R = 12;
  const HP_TOP = compact ? 34 : 42; // the lane label and its key sit in their own row above the plot
  const HP_H = compact ? 136 : 108;
  const GOLD_TOP = HP_TOP + HP_H + (compact ? 40 : 48);
  const GOLD_H = compact ? 56 : 52;
  const STRIP_TOP = GOLD_TOP + GOLD_H + 14;
  const STRIP_H = compact ? 14 : 18;
  const AXIS_Y = STRIP_TOP + STRIP_H + (compact ? 20 : 18);
  const H = AXIS_Y + 8;
  return { FS, PAD_L, PAD_R, HP_TOP, HP_H, GOLD_TOP, GOLD_H, STRIP_TOP, STRIP_H, AXIS_Y, H };
}
const after = (p: SeriesPoint) => Math.max(0, p.hp - p.damage);

export function Timeline({
  series,
  selected,
  highlight,
  onSelect,
  compact = false,
  width = 1000,
}: {
  series: SeriesPoint[];
  selected?: string;
  highlight?: string[];
  onSelect?: (stage: string) => void;
  compact?: boolean;
  width?: number;
}) {
  const W = width;
  const { FS, PAD_L, PAD_R, HP_TOP, HP_H, GOLD_TOP, GOLD_H, STRIP_TOP, STRIP_H, AXIS_Y, H } = layout(compact);
  const n = series.length;
  const step = (W - PAD_L - PAD_R) / n;
  const cx = (i: number) => PAD_L + step * i + step / 2;
  const hpY = (hp: number) => HP_TOP + HP_H - (hp / 100) * HP_H;
  const maxGold = Math.max(60, ...series.map((p) => p.gold));
  const goldY = (g: number) => GOLD_TOP + GOLD_H - (g / maxGold) * GOLD_H;

  const hpPath = series.map((p, i) => `${i ? "L" : "M"}${cx(i)},${hpY(after(p))}`).join(" ");
  const hpArea = `${hpPath} L${cx(n - 1)},${HP_TOP + HP_H} L${cx(0)},${HP_TOP + HP_H} Z`;
  // the lobby median stops once fewer than 4 opponents are left
  const lobbyPath = series.filter((p) => p.lobbyAlive >= 4).map((p, i) => `${i ? "L" : "M"}${cx(series.indexOf(p))},${hpY(p.lobbyHp)}`).join(" ");
  const hl = new Set(highlight ?? []);

  // stage boundaries
  const stageStarts = series
    .map((p, i) => ({ s: p.stage.split("-")[0], i }))
    .filter((x, k, a) => k === 0 || a[k - 1].s !== x.s);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="img" aria-label="Round by round timeline of HP, gold and fight results">
      <defs>
        <linearGradient id="hpFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--hp)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--hp)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* rounds in the selected finding: one band per run of rounds, bracketed above the plot */}
      {(() => {
        const runs: [number, number][] = [];
        series.forEach((p, i) => {
          if (!hl.has(p.stage)) return;
          const last = runs[runs.length - 1];
          if (last && last[1] === i - 1) last[1] = i;
          else runs.push([i, i]);
        });
        return runs.map(([a, b]) => (
          <g key={`h${a}`}>
            <rect x={cx(a) - step / 2} y={HP_TOP - 2} width={step * (b - a + 1)} height={STRIP_TOP + STRIP_H - HP_TOP + 6} fill="var(--brand)" opacity={0.06} />
            <rect x={cx(a) - step / 2 + 2} y={HP_TOP - 7} width={step * (b - a + 1) - 4} height={3} rx={1.5} fill="var(--brand)" opacity={0.8} />
          </g>
        ));
      })()}

      {/* stage separators */}
      {stageStarts.slice(1).map(({ i }) => (
        <line key={`s${i}`} x1={cx(i) - step / 2} x2={cx(i) - step / 2} y1={HP_TOP - 8} y2={STRIP_TOP + STRIP_H + 4} stroke="var(--line)" strokeWidth={1} />
      ))}

      {/* HP grid */}
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={hpY(v)} y2={hpY(v)} stroke="var(--line)" strokeDasharray={v === 0 ? undefined : "2 4"} />
          <text x={PAD_L - 8} y={hpY(v) + FS / 3} textAnchor="end" fontSize={FS} fill="var(--ink-2)" className="tnum">
            {v}
          </text>
        </g>
      ))}
      <text x={PAD_L} y={compact ? 14 : HP_TOP - 18} fontSize={FS} fill="var(--ink-2)">
        HP after combat
      </text>
      {<g transform={`translate(${W - PAD_R - 170}, ${compact ? 4 : HP_TOP - 27})`}>
        <line x1={0} x2={16} y1={0} y2={0} stroke="var(--hp)" strokeWidth={2} transform="translate(0,4)" />
        <text x={22} y={FS * 0.75} fontSize={FS} fill="var(--ink-2)">You</text>
        <line x1={compact ? 66 : 58} x2={compact ? 84 : 74} y1={4} y2={4} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={compact ? 90 : 80} y={FS * 0.75} fontSize={FS} fill="var(--ink-2)">Lobby median</text>
      </g>}

      <path d={hpArea} fill="url(#hpFill)" />
      {(() => {
        // say why the lobby line stops early
        const lastLive = series.reduce((k, p, i) => (p.lobbyAlive >= 4 ? i : k), -1);
        if (compact || lastLive < 0 || lastLive === series.length - 1) return null;
        return (
          <text x={cx(lastLive)} y={HP_TOP + HP_H + 15} textAnchor="end" fontSize={FS - 1} fill="var(--muted)">
            Lobby median ends here: only {series[lastLive + 1].lobbyAlive} opponents left
          </text>
        );
      })()}
      <path d={lobbyPath} fill="none" stroke="var(--ink-2)" strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="3 3" />
      <path d={hpPath} fill="none" stroke="var(--hp)" strokeWidth={2.25} strokeLinejoin="round" />
      {series.map((p, i) =>
        p.damage > 0 ? <circle key={`d${i}`} cx={cx(i)} cy={hpY(after(p))} r={2.6} fill="var(--bg)" stroke="var(--hp)" strokeWidth={1.6} /> : null,
      )}

      {/* gold: solid is what you took into combat, the faint cap is what you spent that round */}
      <text x={PAD_L} y={GOLD_TOP - (compact ? 14 : 18)} fontSize={FS} fill="var(--ink-2)">
        Gold into combat
      </text>
      {<g transform={`translate(${PAD_L + 150}, ${compact ? GOLD_TOP - 14 - FS * 0.75 : GOLD_TOP - 27})`}>
        <rect x={0} y={0} width={10} height={10} rx={2} fill="var(--gold)" fillOpacity={0.3} />
        <text x={16} y={FS * 0.75} fontSize={FS} fill="var(--ink-2)">Spent that round</text>
      </g>}
      <line x1={PAD_L} x2={W - PAD_R} y1={goldY(50)} y2={goldY(50)} stroke="var(--gold)" strokeOpacity={0.35} strokeDasharray="2 4" />
      <text x={PAD_L - 8} y={goldY(50) + FS / 3} textAnchor="end" fontSize={FS} fill="var(--ink-2)" className="tnum">
        50
      </text>
      <text x={PAD_L - 8} y={goldY(0) + FS / 3} textAnchor="end" fontSize={FS} fill="var(--ink-2)" className="tnum">
        0
      </text>
      {series.map((p, i) => {
        const on = selected === p.stage ? 1 : hl.has(p.stage) ? 0.92 : 0.72;
        const x = cx(i) - step * 0.3;
        const w = step * 0.6;
        return (
          <g key={`g${i}`}>
            {p.gold > p.goldEnd && (
              <rect x={x} y={goldY(p.gold)} width={w} height={goldY(p.goldEnd) - goldY(p.gold)} rx={1.5} fill="var(--gold)" fillOpacity={0.22 * on + 0.08} />
            )}
            <rect x={x} y={goldY(p.goldEnd)} width={w} height={GOLD_TOP + GOLD_H - goldY(p.goldEnd)} rx={1.5} fill="var(--gold)" opacity={on} />
          </g>
        );
      })}

      {/* fight strip */}
      {series.map((p, i) => {
        const fill =
          p.kind === "carousel" ? "transparent" : p.kind === "pve" ? "var(--line-2)" : p.outcome === "win" ? "var(--good)" : p.outcome === "loss" ? "var(--hp)" : "var(--line-2)";
        return (
          <rect
            key={`o${i}`}
            x={cx(i) - step * 0.36}
            y={STRIP_TOP}
            width={step * 0.72}
            height={STRIP_H}
            rx={3}
            fill={fill}
            fillOpacity={p.kind === "pve" ? 1 : 0.85}
            stroke={p.kind === "carousel" ? "var(--line-2)" : "none"}
            strokeDasharray={p.kind === "carousel" ? "2 2" : undefined}
          />
        );
      })}

      {/* axis */}
      {series.map((p, i) => {
        const isStart = p.stage.endsWith("-1");
        if (compact && !isStart) return null;
        return (
          <text
            key={`a${i}`}
            x={cx(i)}
            y={AXIS_Y}
            textAnchor="middle"
            fontSize={compact ? FS : 11}
            className="tnum"
            fill={selected === p.stage ? "var(--ink)" : isStart ? "var(--ink-2)" : "var(--muted)"}
            fontWeight={selected === p.stage ? 600 : 400}
          >
            {p.stage}
          </text>
        );
      })}

      {/* selection */}
      {series.map((p, i) =>
        p.stage === selected ? (
          <g key="sel">
            <rect x={cx(i) - step / 2 + 1} y={HP_TOP - 2} width={step - 2} height={STRIP_TOP + STRIP_H - HP_TOP + 6} fill="var(--ink)" opacity={0.08} rx={3} />
          </g>
        ) : null,
      )}

      {/* hit targets */}
      {onSelect &&
        series.map((p, i) => (
          <rect key={`t${i}`} x={cx(i) - step / 2} y={0} width={step} height={H} fill="transparent" className="cursor-pointer" onClick={() => onSelect(p.stage)}>
            <title>{`${p.stage}: ${after(p)} HP, ${p.gold} gold at start, ${p.goldEnd} into combat, level ${p.level}`}</title>
          </rect>
        ))}
    </svg>
  );
}
