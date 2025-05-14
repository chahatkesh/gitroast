import { NextResponse } from "next/server";
import { incrementVisitorCount } from "@/lib/utils/mongo-visitor";

export const dynamic = "force-dynamic"; // Ensure this route is not statically optimized

export async function GET() {
  try {
    // Increment the visitor counter using MongoDB
    const count = await incrementVisitorCount();

    // Return the current count
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error in visitor API route:", error);
    return NextResponse.json(
      { count: 0, error: "Failed to get visitor count" },
      { status: 500 }
    );
  }
}
