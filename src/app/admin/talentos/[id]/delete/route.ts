import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { deleteTalent } from "@/lib/talents";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await deleteTalent((await params).id);
    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?saved=deleted"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?error=delete"), 303);
  }
}
