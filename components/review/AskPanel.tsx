"use client";

import { useState } from "react";
import type { AskResult } from "@/lib/ask/answer";

const SUGGESTED = ["Should I have rolled at 4-1?", "Why did I lose at 4-5?", "What should I change next game?"];

export function AskPanel({ gameId, onCite }: { gameId: string; onCite: (stage: string) => void }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<AskResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setBusy(true);
    setErr(null);
    setQ(question);
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ gameId, question }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Something went wrong.");
      setRes(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
      <h2 className="text-[15px] font-medium">Ask about this game</h2>
      <p className="mt-1 text-[13px] text-[var(--muted)]">Answers only use this recording. Any number that doesn&apos;t match it is removed.</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
      >
        <label htmlFor="ask" className="sr-only">Question</label>
        <input
          id="ask"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Should I have rolled at 4-1?"
          className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--line-2)] bg-[var(--bg)] px-4 text-[15px] placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:outline-none"
        />
        <button disabled={busy} className="h-11 shrink-0 rounded-xl bg-[var(--ink)] px-4 text-[14px] font-medium text-[var(--bg)] disabled:opacity-50">
          {busy ? "Checking" : "Ask"}
        </button>
      </form>
      {!res && !busy && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => ask(s)} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[13px] text-[var(--ink-2)] hover:border-[var(--line-2)] hover:text-[var(--ink)]">
              {s}
            </button>
          ))}
        </div>
      )}
      {err && <p className="mt-4 text-[14px] text-[var(--hp)]">{err}</p>}
      {res && (
        <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4" aria-live="polite">
          <p className="text-[15px] leading-relaxed">
            {res.sentences.map((s, i) => (
              <span key={i}>
                {linkStages(s.text, onCite)}{" "}
              </span>
            ))}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="block h-1.5 w-1.5 rounded-full bg-[var(--good)]" />
              {res.sentences.length} sentence{res.sentences.length === 1 ? "" : "s"} checked against the recording
            </span>
            {res.removed > 0 && <span>{res.removed} removed: numbers didn&apos;t match</span>}
            {res.mode === "offline" && <span>Answered from your findings (no model connected)</span>}
          </div>
        </div>
      )}
    </section>
  );
}

function linkStages(text: string, onCite: (s: string) => void) {
  const parts = text.split(/\b(\d-\d)\b/);
  return parts.map((p, i) =>
    /^\d-\d$/.test(p) ? (
      <button key={i} onClick={() => onCite(p)} className="tnum rounded-md border border-[var(--line-2)] px-1 text-[14px] font-medium hover:bg-[var(--panel-2)]">
        {p}
      </button>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
