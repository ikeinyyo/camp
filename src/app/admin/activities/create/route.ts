import { NextRequest, NextResponse } from "next/server";
import { createActivity } from "@/lib/activities";
import { activityInputFromForm } from "@/lib/activity-form";
import { getRequestUrl } from "@/lib/admin-auth";
export async function POST(request: NextRequest) { try { await createActivity(activityInputFromForm(await request.formData())); return NextResponse.redirect(getRequestUrl(request, "/admin/activities?saved=created"), 303); } catch { return NextResponse.redirect(getRequestUrl(request, "/admin/activities?error=create"), 303); } }
