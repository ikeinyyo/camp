import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setRankingMode, type RankingMode } from "@/lib/ranking-mode";

export async function POST(request: NextRequest) {
  const mode = String((await request.formData()).get("mode"));
  if (mode !== "live" && mode !== "final") return NextResponse.redirect(getRequestUrl(request, "/admin/ranking?error=mode"), 303);
  await setRankingMode(mode as RankingMode);
  return NextResponse.redirect(getRequestUrl(request, "/admin/ranking?saved=true"), 303);
}
