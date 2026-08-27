import { NextResponse } from "next/server";
import { awardBingoPrize, type BingoPrize } from "@/lib/bingo";
import { DuplicatePointMovementError } from "@/lib/points";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userId?: string; prize?: BingoPrize };
    const result = await awardBingoPrize(String(body.userId ?? ""), String(body.prize ?? "") as BingoPrize);
    return NextResponse.json({ ok: true, displayName: result.user.displayName, points: result.points });
  } catch (error) {
    const message = error instanceof DuplicatePointMovementError ? "Ese premio ya se había asignado a este participante." : error instanceof Error ? error.message : "No se pudo asignar el premio.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
