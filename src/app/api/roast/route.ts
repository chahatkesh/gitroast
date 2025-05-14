import { NextRequest, NextResponse } from "next/server";
import { generateRoasts } from "@/lib/utils/github-utils";
import { ProfileStats, RoastIntensity, RoastResult } from "@/lib/types";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stats, intensity = "medium" } = body;

    if (!stats || !stats.user) {
      return NextResponse.json(
        { error: "Profile statistics are required" },
        { status: 400 }
      );
    }

    const validIntensities: RoastIntensity[] = ["mild", "medium", "spicy"];
    if (!validIntensities.includes(intensity as RoastIntensity)) {
      return NextResponse.json(
        {
          error:
            "Invalid intensity level. Must be 'mild', 'medium', or 'spicy'",
        },
        { status: 400 }
      );
    }

    const roasts = await generateRoasts(
      stats as ProfileStats,
      intensity as RoastIntensity
    );

    const result: RoastResult = {
      username: stats.user.login,
      profileStats: stats as ProfileStats,
      roasts,
      intensity: intensity as RoastIntensity,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error generating roasts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate roasts" },
      { status: 500 }
    );
  }
}
