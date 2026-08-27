import { NextResponse } from "next/server";
import { resetBingo } from "@/lib/bingo";

export async function POST() {
  try { await resetBingo(); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudo reiniciar el bingo." }, { status: 400 }); }
}
