import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { getTalent, getTalentContestState, updateTalent } from "@/lib/talents";
import { getUserById } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);

  const [user, talent, state] = await Promise.all([
    getUserById(session.activeUserId),
    getTalent(id),
    getTalentContestState(),
  ]);
  if (!user) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);
  if (!talent || state !== "catalog" || !talent.participantIds.includes(user.id)) {
    return NextResponse.redirect(getRequestUrl(request, "/talentos"), 303);
  }

  try {
    const data = await request.formData();
    const image = data.get("image");
    await updateTalent(id, {
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      participantIds: talent.participantIds,
      active: talent.active,
      ...(image instanceof File && image.size ? { image } : {}),
    });
    return NextResponse.redirect(getRequestUrl(request, "/talentos?updated=true"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, `/talentos/${id}/editar?error=update`), 303);
  }
}
