import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { createTalent } from "@/lib/talents";

export async function POST(request: NextRequest) {
  const data = await request.formData();

  try {
    const image = data.get("image");
    await createTalent({
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      participantIds: data.getAll("participantIds").map(String),
      ...(image instanceof File && image.size ? { image } : {}),
    });

    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?saved=created"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?error=create"), 303);
  }
}
