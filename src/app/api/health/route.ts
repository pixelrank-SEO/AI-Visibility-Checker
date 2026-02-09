import { NextResponse } from "next/server";
import { getConfiguredPlatforms } from "@/lib/ai-platforms";

export async function GET() {
  const platforms = getConfiguredPlatforms();

  return NextResponse.json({
    status: "ok",
    platforms: platforms.map((p) => ({
      name: p.name,
      key: p.platformKey,
      configured: true,
    })),
    platformCount: platforms.length,
  });
}
