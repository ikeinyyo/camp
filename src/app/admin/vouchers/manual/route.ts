import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { applyVoucherManually } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  try {
    await applyVoucherManually(String(formData.get("voucherId") ?? ""), String(formData.get("userId") ?? ""));
    return NextResponse.redirect(getRequestUrl(request, "/admin/validation?saved=applied"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/validation?error=apply"), 303);
  }
}
