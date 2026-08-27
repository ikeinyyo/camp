import { NextResponse } from "next/server";
import { drawBingoNumber } from "@/lib/bingo";

export async function POST() {
  try { return NextResponse.json({ ok: true, ...(await drawBingoNumber()) }); }
  catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudo extraer la bola." }, { status: 400 }); }
}
