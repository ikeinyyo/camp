import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { createVoucher, type VoucherCategory } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  try {
    const maxReservationsValue = String(formData.get("maxReservations") ?? "").trim();
    await createVoucher({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      points: Number(formData.get("points")),
      sortOrder: Number(formData.get("sortOrder")),
      category: String(formData.get("category")) as VoucherCategory,
      maxReservations: maxReservationsValue ? Number(maxReservationsValue) : null,
    });
    return NextResponse.redirect(
      getRequestUrl(request, "/admin/vouchers?saved=created"),
      303,
    );
  } catch {
    return NextResponse.redirect(
      getRequestUrl(request, "/admin/vouchers?error=create"),
      303,
    );
  }
}
