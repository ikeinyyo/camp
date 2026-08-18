import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { deleteVoucherProposal } from "@/lib/vouchers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await deleteVoucherProposal((await params).id);
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?saved=proposal-deleted"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?error=proposal-delete"), 303);
  }
}
