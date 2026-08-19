import { NextRequest, NextResponse } from "next/server";
import { isSectionEnabled } from "@/lib/sections";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { reserveVoucher, VoucherAlreadyReservedError, VoucherFullError } from "@/lib/vouchers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isSectionEnabled("vouchers"))) return NextResponse.json({ error: "Sección no disponible." }, { status: 404 });
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  try {
    const voucher = await reserveVoucher((await params).id, session.activeUserId);
    return NextResponse.json({ voucher });
  } catch (error) {
    const message = error instanceof VoucherFullError ? "No quedan plazas disponibles." : error instanceof VoucherAlreadyReservedError ? "Ya tienes una plaza reservada." : "No se pudo reservar la plaza.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
