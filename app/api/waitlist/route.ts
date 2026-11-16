import { appendFile, mkdir } from "node:fs/promises";
import { NextResponse } from "next/server";

// Local stand-in for a real mailing list: appends to data/waitlist.jsonl (gitignored).
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const email = String(form?.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.redirect(new URL("/download?error=1", req.url), 303);
  }
  await mkdir("data", { recursive: true });
  await appendFile("data/waitlist.jsonl", JSON.stringify({ email, at: new Date().toISOString() }) + "\n");
  return NextResponse.redirect(new URL("/download?joined=1", req.url), 303);
}
