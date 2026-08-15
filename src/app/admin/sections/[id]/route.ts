import { NextRequest, NextResponse } from "next/server";
import { SECTION_DEFINITIONS, type SectionId } from "@/config/sections";
import { getRequestUrl } from "@/lib/admin-auth";
import { updateSection } from "@/lib/sections";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const formData = await request.formData();
  const enabled = formData.get("enabled");
  const requiresAuth = formData.get("requiresAuth");
  const isKnownSection = SECTION_DEFINITIONS.some((section) => section.id === id);

  if (!isKnownSection || (enabled !== "true" && enabled !== "false") || (requiresAuth !== "true" && requiresAuth !== null)) {
    return NextResponse.redirect(getRequestUrl(request, "/admin/sections?error=true"), 303);
  }

  try {
    await updateSection(id as SectionId, enabled === "true", requiresAuth === "true");
    return NextResponse.redirect(getRequestUrl(request, "/admin/sections?saved=true"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/sections?error=true"), 303);
  }
}
