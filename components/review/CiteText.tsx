import type { Cite } from "@/lib/review/engine";

// One tag format everywhere: "2-3: 100 HP before combat", "2-3 to 4-1: +23 streak gold"
export function CiteText({ c }: { c: Cite }) {
  return (
    <>
      <span className="font-semibold text-[var(--ink)]">{c.stage}</span>
      {c.to && (
        <>
          {" to "}
          <span className="font-semibold text-[var(--ink)]">{c.to}</span>
        </>
      )}
      : {c.label}
    </>
  );
}
