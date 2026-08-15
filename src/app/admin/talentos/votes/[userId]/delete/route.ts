import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { deleteTalentVote } from "@/lib/talents";

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await deleteTalentVote((await params).userId);
    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?saved=vote-deleted"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?error=vote-delete"), 303);
  }
}
