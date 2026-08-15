import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { deleteTapa } from "@/lib/tapas";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { await deleteTapa((await params).id); return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?saved=deleted"), 303); } catch { return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?error=delete"), 303); } }
