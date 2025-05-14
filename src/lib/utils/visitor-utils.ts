import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "visitors.json");

// Make sure the data directory exists
const ensureDataDirectory = async () => {
  try {
    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
};

// Get current visitor count
export async function getVisitorCount(): Promise<number> {
  try {
    await ensureDataDirectory();

    try {
      const data = await fs.readFile(dataFilePath, "utf8");
      return JSON.parse(data).count || 0;
    } catch {
      // File doesn't exist or is invalid
      return 0;
    }
  } catch (error) {
    console.error("Error reading visitor count:", error);
    return 0;
  }
}

// Increment visitor count
export async function incrementVisitorCount(): Promise<number> {
  try {
    await ensureDataDirectory();

    let count = await getVisitorCount();
    count += 1;

    await fs.writeFile(dataFilePath, JSON.stringify({ count }), "utf8");
    return count;
  } catch (error) {
    console.error("Error incrementing visitor count:", error);
    return 0;
  }
}
