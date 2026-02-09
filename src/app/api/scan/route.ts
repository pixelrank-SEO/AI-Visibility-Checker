import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeUrl, extractDomain } from "@/lib/utils";
import { runScanEngine } from "@/lib/scan-engine";

const createScanSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url: rawUrl } = createScanSchema.parse(body);

    const url = normalizeUrl(rawUrl);
    const domain = extractDomain(url);

    const scan = await db.scan.create({
      data: {
        url,
        domain,
        status: "PENDING",
        progress: 0,
      },
    });

    // Fire and forget - scan runs in background
    runScanEngine(scan.id).catch((error) => {
      console.error("Scan engine error:", error);
    });

    return NextResponse.json(
      { scanId: scan.id, status: scan.status },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating scan:", error);
    return NextResponse.json(
      { error: "Failed to create scan" },
      { status: 500 }
    );
  }
}
