import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { createTapa } from "@/lib/tapas";
export async function POST(request: NextRequest) { const data = await request.formData(); try { const image = data.get("image"); if (!(image instanceof File)) throw new Error(); await createTapa({ name: String(data.get("name") ?? ""), description: String(data.get("description") ?? ""), participantIds: data.getAll("participantIds").map(String), image }); return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?saved=created"), 303); } catch { return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?error=create"), 303); } }
