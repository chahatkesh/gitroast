import { NextRequest, NextResponse } from "next/server";
import { compileGitHubStats } from "@/lib/utils/github-utils";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username parameter is required" },
      { status: 400 }
    );
  }

  try {
    const stats = await compileGitHubStats(username);
    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error(`Error fetching GitHub data for ${username}:`, error);

    // Determine appropriate status code
    let status = 500;
    let errorMessage = "An error occurred while fetching GitHub data";

    // Extract error message if it's an Error object
    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes("not found")) {
        status = 404;
      } else if (
        errorMessage.includes("Rate limit") ||
        errorMessage.includes("401")
      ) {
        status = 429; // Too Many Requests is more appropriate for rate limiting
        errorMessage +=
          ". GitHub API rate limit may be exceeded. Try again later or add a GitHub token to .env.local";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
