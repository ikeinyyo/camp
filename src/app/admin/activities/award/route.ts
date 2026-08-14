import { NextRequest, NextResponse } from "next/server";
import { applyActivityPoints } from "@/lib/activities";
import { getRequestUrl } from "@/lib/admin-auth";
import { DuplicatePointMovementError } from "@/lib/points";
export async function POST(request: NextRequest) { const data = await request.formData(); try { await applyActivityPoints(String(data.get("activityId")), String(data.get("userId")), String(data.get("reward")) as "participation" | "first" | "second" | "third"); return NextResponse.redirect(getRequestUrl(request, "/admin/validation?saved=awarded"), 303); } catch (error) { return NextResponse.redirect(getRequestUrl(request, `/admin/validation?error=${error instanceof DuplicatePointMovementError ? "duplicate" : "award"}`), 303); } }
