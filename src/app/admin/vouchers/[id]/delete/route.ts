import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { deleteVoucher } from "@/lib/vouchers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteVoucher(id);
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?saved=deleted"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?error=delete"), 303);
  }
}
