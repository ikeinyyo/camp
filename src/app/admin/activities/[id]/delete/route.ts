import { NextRequest, NextResponse } from "next/server";
import { deleteActivity } from "@/lib/activities";
import { getRequestUrl } from "@/lib/admin-auth";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params; await deleteActivity(id); return NextResponse.redirect(getRequestUrl(request, "/admin/activities?saved=deleted"), 303); } catch { return NextResponse.redirect(getRequestUrl(request, "/admin/activities?error=delete"), 303); } }
