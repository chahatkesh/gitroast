import { NextRequest, NextResponse } from "next/server";
import { generateRoasts } from "@/lib/utils/github-utils";
import { ProfileStats, RoastIntensity, RoastResult } from "@/lib/types";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Check for OpenAI API key first using the config utility
    const { config } = await import("@/lib/utils/config");
    if (!config.isOpenAIConfigured()) {
      console.error("OpenAI API key is not properly configured");
      return NextResponse.json(
        {
          error:
            "OpenAI API is not configured properly. Please check server configuration.",
        },
        { status: 500 }
      );
    }

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
  } catch (error: unknown) {
    console.error("Error generating roasts:", error);

    // Specific error handling for different error types
    let status = 500;
    let message = "Failed to generate roasts";

    if (error instanceof Error) {
      message = error.message;

      // Handle API key issues
      if (message.includes("API key")) {
        status = 500;
        message = "API configuration error. Please try again later.";
      }
      // Handle rate limiting
      else if (message.includes("rate limit") || message.includes("429")) {
        status = 429;
        message = "Rate limit exceeded. Please try again later.";
      }
    }

    return NextResponse.json({ error: message }, { status });
  }
}
