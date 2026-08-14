import { NextRequest, NextResponse } from "next/server";
import { redeemActivityClaim } from "@/lib/activities";
import { redeemVoucherClaim } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { type?: string; claimId?: string };
    if (!body.claimId) throw new Error("Código no válido.");
    const result = body.type === "gallardo-camp-voucher" ? await redeemVoucherClaim(body.claimId) : body.type === "gallardo-camp-activity" ? await redeemActivityClaim(body.claimId) : null;
    if (!result) throw new Error("Tipo no válido.");
    return NextResponse.json({ alreadyRedeemed: result.alreadyRedeemed, points: result.claim.points, displayName: result.claim.displayName });
  } catch {
    return NextResponse.json({ error: "El código no existe, ya no es válido o no se pudo aplicar." }, { status: 400 });
  }
}
