import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { getContestState, getTapa, updateTapa } from "@/lib/tapas";
import { getUserById } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);

  const [user, tapa, state] = await Promise.all([
    getUserById(session.activeUserId),
    getTapa(id),
    getContestState(),
  ]);
  if (!user) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);
  if (!tapa || state !== "catalog" || !tapa.participantIds.includes(user.id)) {
    return NextResponse.redirect(getRequestUrl(request, "/tapas"), 303);
  }

  try {
    const data = await request.formData();
    const image = data.get("image");
    await updateTapa(id, {
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      participantIds: tapa.participantIds,
      active: tapa.active,
      ...(image instanceof File && image.size ? { image } : {}),
    });
    return NextResponse.redirect(getRequestUrl(request, "/tapas?updated=true"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, `/tapas/${id}/editar?error=update`), 303);
  }
}
