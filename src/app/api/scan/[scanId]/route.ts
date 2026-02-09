import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;

  const scan = await db.scan.findUnique({
    where: { id: scanId },
    include: {
      platformResults: true,
      queries: {
        include: {
          responses: {
            select: {
              id: true,
              platform: true,
              responseText: true,
              mentioned: true,
              mentionType: true,
              mentionExcerpt: true,
              citationUrl: true,
              confidence: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  return NextResponse.json(scan);
}
