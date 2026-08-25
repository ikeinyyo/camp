import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setRankingPrizesVisibility } from "@/lib/ranking-mode";

export async function POST(request: NextRequest) {
  const visible = String((await request.formData()).get("visible"));
  if (visible !== "true" && visible !== "false") return NextResponse.redirect(getRequestUrl(request, "/admin/ranking?error=prizes"), 303);
  try {
    await setRankingPrizesVisibility(visible === "true");
    return NextResponse.redirect(getRequestUrl(request, "/admin/ranking?saved=prizes"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/ranking?error=prizes"), 303);
  }
}
