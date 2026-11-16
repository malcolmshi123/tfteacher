"use client";

import type { SeriesPoint } from "@/lib/review/engine";

// Layout in viewBox units. The compact (landing) version is drawn narrower, so the
// same font sizes render larger, and it gets more room between the lanes.
function layout(compact: boolean) {
  const FS = compact ? 12 : 10.5; // label size
  const PAD_L = compact ? 30 : 34;
  const PAD_R = 12;
  const HP_TOP = compact ? 34 : 18; // compact: legend row sits above the plot
  const HP_H = compact ? 136 : 128;
  const GOLD_TOP = HP_TOP + HP_H + (compact ? 40 : 26);
  const GOLD_H = compact ? 56 : 64;
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
  const lobbyPath = series.map((p, i) => `${i ? "L" : "M"}${cx(i)},${hpY(p.lobbyHp)}`).join(" ");
  const hl = new Set(highlight ?? []);

  // stage boundaries
  const stageStarts = series
    .map((p, i) => ({ s: p.stage.split("-")[0], i }))
    .filter((x, k, a) => k === 0 || a[k - 1].s !== x.s);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="img" aria-label="Round by round timeline of HP, gold and fight results">
      <defs>
        <linearGradient id="hpFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--hp)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--hp)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* highlighted rounds */}
      {series.map((p, i) =>
        hl.has(p.stage) ? (
          <rect key={`h${i}`} x={cx(i) - step / 2} y={HP_TOP - 2} width={step} height={STRIP_TOP + STRIP_H - HP_TOP + 6} fill="var(--brand)" opacity={0.07} />
        ) : null,
      )}

      {/* stage separators */}
      {stageStarts.slice(1).map(({ i }) => (
        <line key={`s${i}`} x1={cx(i) - step / 2} x2={cx(i) - step / 2} y1={HP_TOP - 8} y2={STRIP_TOP + STRIP_H + 4} stroke="var(--line)" strokeWidth={1} />
      ))}

      {/* HP grid */}
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={hpY(v)} y2={hpY(v)} stroke="var(--line)" strokeDasharray={v === 0 ? undefined : "2 4"} />
          <text x={PAD_L - 8} y={hpY(v) + FS / 3} textAnchor="end" fontSize={FS - 0.5} fill="var(--muted)" className="tnum">
            {v}
          </text>
        </g>
      ))}
      <text x={PAD_L} y={compact ? 14 : HP_TOP - 6} fontSize={FS} fill="var(--ink-2)">
        HP after combat
      </text>
      <g transform={`translate(${W - PAD_R - (compact ? 170 : 150)}, ${compact ? 4 : HP_TOP - 14})`}>
        <line x1={0} x2={16} y1={0} y2={0} stroke="var(--hp)" strokeWidth={2} transform="translate(0,4)" />
        <text x={22} y={FS * 0.75} fontSize={FS} fill="var(--ink-2)">You</text>
        <line x1={compact ? 66 : 58} x2={compact ? 84 : 74} y1={4} y2={4} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={compact ? 90 : 80} y={FS * 0.75} fontSize={FS} fill="var(--ink-2)">Lobby median</text>
      </g>

      <path d={hpArea} fill="url(#hpFill)" />
      <path d={lobbyPath} fill="none" stroke="var(--ink-2)" strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="3 3" />
      <path d={hpPath} fill="none" stroke="var(--hp)" strokeWidth={2.25} strokeLinejoin="round" />
      {series.map((p, i) =>
        p.damage > 0 ? <circle key={`d${i}`} cx={cx(i)} cy={hpY(after(p))} r={2.6} fill="var(--bg)" stroke="var(--hp)" strokeWidth={1.6} /> : null,
      )}

      {/* gold */}
      <text x={PAD_L} y={GOLD_TOP - (compact ? 14 : 8)} fontSize={FS} fill="var(--ink-2)">
        Gold at round start
      </text>
      <line x1={PAD_L} x2={W - PAD_R} y1={goldY(50)} y2={goldY(50)} stroke="var(--gold)" strokeOpacity={0.35} strokeDasharray="2 4" />
      <text x={PAD_L - 8} y={goldY(50) + FS / 3} textAnchor="end" fontSize={FS - 0.5} fill="var(--muted)" className="tnum">
        50
      </text>
      {series.map((p, i) => (
        <rect
          key={`g${i}`}
          x={cx(i) - step * 0.3}
          y={goldY(p.gold)}
          width={step * 0.6}
          height={GOLD_TOP + GOLD_H - goldY(p.gold)}
          rx={1.5}
          fill="var(--gold)"
          opacity={selected === p.stage ? 1 : hl.has(p.stage) ? 0.85 : 0.45}
        />
      ))}

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
            fontSize={compact ? FS : 10}
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
          <rect key="sel" x={cx(i) - step / 2 + 1} y={HP_TOP - 2} width={step - 2} height={STRIP_TOP + STRIP_H - HP_TOP + 6} fill="none" stroke="var(--ink)" strokeOpacity={0.7} strokeWidth={1.25} rx={4} />
        ) : null,
      )}

      {/* hit targets */}
      {onSelect &&
        series.map((p, i) => (
          <rect key={`t${i}`} x={cx(i) - step / 2} y={0} width={step} height={H} fill="transparent" className="cursor-pointer" onClick={() => onSelect(p.stage)}>
            <title>{`${p.stage}: ${after(p)} HP, ${p.gold} gold, level ${p.level}`}</title>
          </rect>
        ))}
    </svg>
  );
}
