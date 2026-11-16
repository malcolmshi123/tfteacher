import { NextResponse } from "next/server";
import { answer } from "@/lib/ask/answer";
import { buildSampleGame } from "@/lib/game/sample";
import { analyze } from "@/lib/review/engine";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { gameId?: string; question?: string };
  const question = (body.question ?? "").trim().slice(0, 300);
  if (!question) return NextResponse.json({ error: "Ask a question about this game." }, { status: 400 });
  if (body.gameId !== "sample") return NextResponse.json({ error: "Game not found." }, { status: 404 });
  try {
    const result = await answer(analyze(buildSampleGame()), question);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "The coach couldn't answer right now. Try again in a moment." }, { status: 502 });
  }
}
