import { NextResponse } from "next/server";
import { getTalentImage } from "@/lib/talents";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const download = await getTalentImage((await params).id);
    if (!download.readableStreamBody) throw new Error();

    const chunks: Uint8Array[] = [];
    for await (const chunk of download.readableStreamBody) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    return new NextResponse(new Uint8Array(Buffer.concat(chunks)), {
      headers: {
        "Content-Type": download.contentType ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
