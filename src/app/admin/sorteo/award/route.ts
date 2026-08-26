import { NextResponse } from "next/server";
import { awardLotteryPoints } from "@/lib/lottery";
import { DuplicatePointMovementError } from "@/lib/points";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userId?: string; points?: number; drawId?: string };
    await awardLotteryPoints(String(body.userId ?? ""), Number(body.points), String(body.drawId ?? ""));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof DuplicatePointMovementError ? "Este sorteo ya se había asignado." : error instanceof Error ? error.message : "No se pudieron asignar los puntos.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
