import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { createVoucherProposal } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);
  try {
    const data = await request.formData();
    await createVoucherProposal(String(data.get("text") ?? ""), session.activeUserId);
    return NextResponse.redirect(getRequestUrl(request, "/vales?proposed=true"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/vales?error=proposal"), 303);
  }
}
