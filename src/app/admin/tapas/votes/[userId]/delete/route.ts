import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { deleteTapaVote } from "@/lib/tapas";

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await deleteTapaVote((await params).userId);
    return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?saved=vote-deleted"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?error=vote-delete"), 303);
  }
}
