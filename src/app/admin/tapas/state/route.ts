import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setContestState, type ContestState } from "@/lib/tapas";
export async function POST(request: NextRequest) { const state = String((await request.formData()).get("state")); if (!["catalog", "voting", "ranking"].includes(state)) return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?error=state"), 303); await setContestState(state as ContestState); return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?saved=state"), 303); }
