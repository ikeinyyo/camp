import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { updateTalent } from "@/lib/talents";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.formData();

  try {
    const image = data.get("image");
    await updateTalent(id, {
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      participantIds: data.getAll("participantIds").map(String),
      active: data.get("active") === "true",
      ...(image instanceof File && image.size ? { image } : {}),
    });

    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?saved=updated"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?error=update"), 303);
  }
}
