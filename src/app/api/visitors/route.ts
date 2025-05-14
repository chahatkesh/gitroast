import { NextResponse } from "next/server";
import { incrementVisitorCount } from "@/lib/utils/visitor-utils";

export async function GET() {
  // Increment the counter when the API is called
  const count = await incrementVisitorCount();

  // Return the current count
  return NextResponse.json({ count });
}
