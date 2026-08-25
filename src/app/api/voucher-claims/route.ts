import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { isSectionEnabled } from "@/lib/sections";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { createVoucherClaim, VoucherAlreadyClaimedError } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  if (!(await isSectionEnabled("vouchers"))) return NextResponse.json({ error: "Sección no disponible." }, { status: 404 });
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  const body = (await request.json()) as { voucherId?: string };
  if (!body.voucherId) return NextResponse.json({ error: "Vale no válido." }, { status: 400 });

  try {
    const claim = await createVoucherClaim(body.voucherId, session.activeUserId);
    const payload = JSON.stringify({ type: "gallardo-camp-voucher", claimId: claim.id, voucherId: claim.voucherId, userId: claim.userId });
    const qrCode = await QRCode.toDataURL(payload, { width: 420, margin: 2, color: { dark: "#052e16", light: "#ffffff" } });
    return NextResponse.json({ claim, qrCode, payload });
  } catch (error) {
    return NextResponse.json({ error: error instanceof VoucherAlreadyClaimedError ? "Este vale ya se ha reclamado." : "No se pudo generar el vale." }, { status: 400 });
  }
}
