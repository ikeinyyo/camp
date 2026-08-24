import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setDominoMode } from "@/lib/domino";

export async function POST(request: NextRequest) {
  const mode = String((await request.formData()).get("mode"));
  if (mode !== "registration" && mode !== "tournament") return NextResponse.redirect(getRequestUrl(request, "/admin/domino?error=mode"), 303);
  try {
    await setDominoMode(mode);
    return NextResponse.redirect(getRequestUrl(request, "/admin/domino?saved=mode"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/domino?error=mode"), 303);
  }
}
