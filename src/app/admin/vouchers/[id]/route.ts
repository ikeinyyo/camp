import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { updateVoucher, type VoucherCategory } from "@/lib/vouchers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData();
  try {
    const maxReservationsValue = String(formData.get("maxReservations") ?? "").trim();
    await updateVoucher(id, { title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), points: Number(formData.get("points")), active: formData.get("active") === "true", sortOrder: Number(formData.get("sortOrder")), category: String(formData.get("category")) as VoucherCategory, maxReservations: maxReservationsValue ? Number(maxReservationsValue) : null, reservedUserIds: formData.getAll("reservedUserIds").map(String) });
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?saved=updated"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?error=update"), 303);
  }
}
