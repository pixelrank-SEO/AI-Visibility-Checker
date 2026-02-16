import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeUrl, extractDomain } from "@/lib/utils";
import { runScanEngine } from "@/lib/scan-engine";
import { REGIONS } from "@/lib/constants";

const createScanSchema = z.object({
  url: z.string().min(1, "URL is required"),
  regions: z.array(z.string()).min(1).max(10).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url: rawUrl, regions } = createScanSchema.parse(body);

    const url = normalizeUrl(rawUrl);
    const domain = extractDomain(url);

    const validRegionCodes = REGIONS.map((r) => r.code);
    const selectedRegions = regions
      ? regions.filter((r) => validRegionCodes.includes(r))
      : REGIONS.slice(0, 5).map((r) => r.code);

    if (selectedRegions.length === 0) {
      return NextResponse.json(
        { error: "At least one valid region is required" },
        { status: 400 }
      );
    }

    const scan = await db.scan.create({
      data: {
        url,
        domain,
        status: "PENDING",
        progress: 0,
        selectedRegions,
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
