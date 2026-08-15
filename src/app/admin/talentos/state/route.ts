import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setTalentContestState, type TalentContestState } from "@/lib/talents";

export async function POST(request: NextRequest) {
  const state = String((await request.formData()).get("state"));
  if (!["catalog", "voting", "ranking"].includes(state)) {
    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?error=state"), 303);
  }

  await setTalentContestState(state as TalentContestState);
  return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?saved=state"), 303);
}
