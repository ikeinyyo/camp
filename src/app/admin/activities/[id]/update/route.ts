import { NextRequest, NextResponse } from "next/server";
import { updateActivity } from "@/lib/activities";
import { activityInputFromForm } from "@/lib/activity-form";
import { getRequestUrl } from "@/lib/admin-auth";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params; await updateActivity(id, activityInputFromForm(await request.formData())); return NextResponse.redirect(getRequestUrl(request, "/admin/activities?saved=updated"), 303); } catch { return NextResponse.redirect(getRequestUrl(request, "/admin/activities?error=update"), 303); } }
