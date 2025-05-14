/**
 * MongoDB-based visitor counter implementation
 *
 * This utility provides functions to track and retrieve visitor counts using MongoDB.
 * It includes connection pooling, caching for better performance, and is designed to
 * work in serverless environments.
 */
import { MongoClient, Db, Collection, Document } from "mongodb";

// MongoDB connection URI - you'll need to set this in your environment variables
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://username:password@cluster0.mongodb.net";
const MONGODB_DB = process.env.MONGODB_DB || "gitroast";
const COLLECTION_NAME = "visitors";

// Define the counter document interface
interface VisitorCounter extends Document {
  _id: string;
  count: number;
}

// Create MongoDB client with connection caching for better performance
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Otherwise create a new connection
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (!MONGODB_DB) {
    throw new Error("Please define the MONGODB_DB environment variable");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Cache the database connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// Get visitors collection with proper typing
async function getCollection(): Promise<Collection<VisitorCounter>> {
  const { db } = await connectToDatabase();
  return db.collection<VisitorCounter>(COLLECTION_NAME);
}

// Cache visitor count to reduce database queries
let cachedCount: number | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 1000; // Cache for 1 minute

// Get current visitor count
export async function getVisitorCount(): Promise<number> {
  // Return cached value if available and not expired
  const now = Date.now();
  if (cachedCount !== null && now - lastCacheTime < CACHE_TTL) {
    return cachedCount;
  }

  try {
    const collection = await getCollection();

    // Get the visitor counter document
    const counter = await collection.findOne({ _id: "visitor_counter" });

    // Update cache
    cachedCount = counter?.count || 0;
    lastCacheTime = now;

    return cachedCount;
  } catch (error) {
    console.error("Error fetching visitor count from MongoDB:", error);
    return cachedCount || 0; // Use cached value if available, otherwise return 0
  }
}

// Increment visitor count
export async function incrementVisitorCount(): Promise<number> {
  try {
    const collection = await getCollection();

    // Use findOneAndUpdate to atomically update the counter
    const result = await collection.findOneAndUpdate(
      { _id: "visitor_counter" },
      { $inc: { count: 1 } },
      {
        upsert: true, // Create if it doesn't exist
        returnDocument: "after", // Return the updated document
      }
    );

    // Update cache with the new count
    const newCount = result?.count || 1;
    cachedCount = newCount;
    lastCacheTime = Date.now();

    // Return the updated count
    return newCount;
  } catch (error) {
    console.error("Error incrementing visitor count in MongoDB:", error);

    // If we have a cached count, increment it locally as fallback
    if (cachedCount !== null) {
      cachedCount += 1;
      return cachedCount;
    }

    return 0;
  }
}
