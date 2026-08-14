import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { createVoucher } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  try {
    await createVoucher({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      points: Number(formData.get("points")),
      sortOrder: Number(formData.get("sortOrder")),
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
