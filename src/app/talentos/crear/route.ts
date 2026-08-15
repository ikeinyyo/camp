import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { createTalent, getTalentContestState } from "@/lib/talents";
import { getUserById } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export async function POST(request: NextRequest) {
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);
  const user = await getUserById(session.activeUserId);
  if (!user) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);

  try {
    if (await getTalentContestState() !== "catalog") throw new Error("El catálogo está cerrado.");
    const data = await request.formData();
    const image = data.get("image");
    await createTalent({
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      participantIds: [...new Set([user.id, ...data.getAll("participantIds").map(String)])],
      ...(image instanceof File && image.size ? { image } : {}),
    });
    return NextResponse.redirect(getRequestUrl(request, "/talentos?created=true"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/talentos/nuevo?error=create"), 303);
  }
}
