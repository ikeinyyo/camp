import { NextRequest, NextResponse } from "next/server";
import { reorderVouchers, type VoucherCategory } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { items?: Array<{ id?: string; category?: string }> };
    if (!Array.isArray(body.items)) throw new Error("Orden no válido.");
    await reorderVouchers(body.items.map((item) => ({ id: String(item.id ?? ""), category: String(item.category ?? "") as VoucherCategory })));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el orden." }, { status: 400 });
  }
}
