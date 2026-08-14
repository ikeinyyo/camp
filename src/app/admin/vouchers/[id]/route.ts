import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { updateVoucher } from "@/lib/vouchers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData();
  try {
    await updateVoucher(id, { title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), points: Number(formData.get("points")), active: formData.get("active") === "true", sortOrder: Number(formData.get("sortOrder")) });
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?saved=updated"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?error=update"), 303);
  }
}
