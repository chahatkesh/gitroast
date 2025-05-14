import { GitHubRepo, GitHubUser, ProfileStats, RoastIntensity } from "../types";
import OpenAI from "openai";
import { config } from "./config";

const GITHUB_API_URL = "https://api.github.com";

// Initialize OpenAI client with proper error handling
let openai: OpenAI;

try {
  openai = new OpenAI({
    apiKey: config.openaiApiKey,
    dangerouslyAllowBrowser: false, // Prevent client-side usage
  });
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
  // Create a placeholder that will throw clear errors if used without proper setup
  openai = {
    chat: {
      completions: {
        create: () => {
          throw new Error("OpenAI API client not properly initialized");
        },
      },
    },
  } as unknown as OpenAI;
}

// Fetch GitHub user data
export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  // Only add Authorization header if we have a valid token
  if (config.isGitHubTokenConfigured()) {
    headers.Authorization = `token ${config.githubToken}`;
  }

  const response = await fetch(`${GITHUB_API_URL}/users/${username}`, {
    headers,
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`GitHub user ${username} not found`);
    }
    if (response.status === 401) {
      console.warn(
        "GitHub API rate limit may be exceeded. Consider adding a valid GITHUB_TOKEN to .env.local"
      );
      throw new Error(
        `GitHub API error: Rate limit may be exceeded. Try again later.`
      );
    }
    throw new Error(`Error fetching GitHub user: ${response.status}`);
  }

  return response.json();
}

// Fetch GitHub repositories
export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  // Only add Authorization header if we have a valid token
  if (config.isGitHubTokenConfigured()) {
    headers.Authorization = `token ${config.githubToken}`;
  }

  const response = await fetch(
    `${GITHUB_API_URL}/users/${username}/repos?per_page=100`,
    {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      console.warn(
        "GitHub API rate limit may be exceeded. Consider adding a valid GITHUB_TOKEN to .env.local"
      );
      throw new Error(
        `GitHub API error: Rate limit may be exceeded. Try again later.`
      );
    }
    throw new Error(`Error fetching repositories: ${response.status}`);
  }

  return response.json();
}

// Calculate top languages from repos
export function calculateTopLanguages(repos: GitHubRepo[]): {
  [key: string]: number;
} {
  const languages: { [key: string]: number } = {};

  repos.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  // Sort languages by count and return top 5
  return Object.fromEntries(
    Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  );
}

// Calculate account age in days
export function calculateAccountAge(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Get total stars across all repositories
export function calculateTotalStars(repos: GitHubRepo[]): number {
  return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
}

// Generate commit pattern description (simplified for now)
export function getCommitPattern(repos: GitHubRepo[]): string {
  const recentRepos = repos
    .filter((repo) => !repo.fork)
    .sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    )
    .slice(0, 10);

  if (recentRepos.length === 0) return "Inactive";

  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  const recentActivity = recentRepos.filter(
    (repo) => new Date(repo.pushed_at) > oneMonthAgo
  ).length;

  if (recentActivity === 0) return "Inactive";
  if (recentActivity <= 2) return "Occasional";
  if (recentActivity <= 5) return "Regular";
  return "Very Active";
}

// Compile all GitHub stats
export async function compileGitHubStats(
  username: string
): Promise<ProfileStats> {
  const user = await fetchGitHubUser(username);
  const repos = await fetchUserRepos(username);

  const topLanguages = calculateTopLanguages(repos);
  const totalStars = calculateTotalStars(repos);
  const accountAge = calculateAccountAge(user.created_at);
  const commitPattern = getCommitPattern(repos);

  return {
    user,
    repos,
    topLanguages,
    totalStars,
    accountAge,
    commitPattern,
  };
}

// Generate roasts using OpenAI
export async function generateRoasts(
  stats: ProfileStats,
  intensity: RoastIntensity = "medium"
): Promise<string[]> {
  const { user, topLanguages, totalStars, accountAge, commitPattern } = stats;

  // Format language data
  const languages = Object.keys(topLanguages).join(", ");

  // Adjust temperature based on intensity
  const temperatures: Record<RoastIntensity, number> = {
    mild: 0.8,
    medium: 0.9,
    spicy: 1.0,
  };

  // Check if OpenAI API key is configured
  if (!config.isOpenAIConfigured()) {
    console.error("OpenAI API key is not properly configured");
    throw new Error(
      "OpenAI API key is not properly configured. Please check your environment variables."
    );
  }

  const promptTemplate = `You are GitRoast, an AI comedy roast master specializing in ULTRA-MEMEABLE developer humor. You analyze GitHub profiles and deliver savage, technically-accurate roasts that developers will screenshot and share immediately. Your roasts should combine tech references with popular meme formats.

SUBJECT'S GITHUB STATS:
- Username: ${user.login}
- Public repositories: ${user.public_repos}
- Followers: ${user.followers}
- Following: ${user.following}
- Main languages: ${languages || "None detected"}
- Account created: ${new Date(
    user.created_at
  ).toLocaleDateString()} (${accountAge} days ago)
- Commit frequency: ${commitPattern}
- Stars received: ${totalStars}

CREATE EXACTLY 4 SHORT ROASTS. Each roast MUST BE 1-2 LINES MAX - absolutely no more than 2 lines per roast. Number them 1-4.

ROASTING ANGLES (MEME-STYLE):
- Repo quantity vs quality using classic meme references ("Your repos are like null checks - technically exist but serve no purpose")
- Language choices as personality flaws with meme references ("Still using jQuery? Even Internet Explorer moved on faster than you")
- Follower ratio as an extremely shareable tech joke ("Your follower-to-following ratio is like a recursive function with no base case - it only goes down")
- Commit patterns as meme-worthy dev jokes ("Your commit history looks like my WiFi signal when the microwave is on")
- Stars count with viral dev humor ("Got ${totalStars} stars? That's like having a commented-out TODO from 2019 - technically visible but nobody cares")
- Account age vs. visible progress with meme references ("${accountAge} days on GitHub and still coding like it's your first day - the real Y2K bug was your development skills")

ROAST INTENSITY: ${intensity.toUpperCase()}. ${
    intensity === "spicy"
      ? "Go full viral meme savagery - these should be screenshots waiting to happen."
      : intensity === "mild"
      ? "Light meme-quality teasing that's still extremely shareable but not career-ending."
      : "Standard meme-style roasting - perfect balance between viral potential and professional humor."
  }

REQUIREMENTS FOR EACH ROAST:
1. MUST reference specific GitHub data from their profile
2. MUST include developer humor that references popular memes or formats
3. MUST be extremely shareable and screenshot-worthy
4. MUST be exactly 1-2 lines (no more!)
5. MUST include at least one reference to: "stack overflow", "CSS centering", "dark mode", "semicolons", "tabs vs spaces", "it works on my machine", or other viral dev topics

FORMATTING:
1. [First meme-worthy roast - exactly 1-2 lines]
2. [Second meme-worthy roast - exactly 1-2 lines]
3. [Third meme-worthy roast - exactly 1-2 lines]
4. [Fourth meme-worthy roast - exactly 1-2 lines]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are GitRoast, the internet's most viral dev meme generator disguised as a roast master. You create developer roasts so memeable and shareable that they spread across Twitter, Discord, and Slack channels instantly. Your understanding of developer culture, memes, and inside jokes is unmatched. Your specialty is creating short, punchy, screenshot-worthy roasts that combine GitHub profile data with trending developer humor that will make anyone viewing it say 'I need to share this right now.'",
        },
        { role: "user", content: promptTemplate },
      ],
      temperature: temperatures[intensity],
      max_tokens: 450,
    });

    // Parse the response text into separate roasts
    const roastText = response.choices[0].message.content || "";
    let roasts = roastText
      .split(/\d+\.\s+/) // Split by numbered list format
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());

    // Ensure we have exactly 4 roasts
    if (roasts.length === 0) {
      roasts = ["Your GitHub profile is so unique it left our AI speechless!"];
    }

    // Always return exactly 4 roasts, either trimming excess or adding defaults if needed
    if (roasts.length > 4) {
      roasts = roasts.slice(0, 4);
    } else
      while (roasts.length < 4) {
        roasts.push(
          "Your code is like a mystery box - nobody knows what's inside, including you."
        );
      }

    // Ensure each roast is concise (trim if over 150 chars)
    roasts = roasts.map((roast) =>
      roast.length > 150 ? roast.substring(0, 147) + "..." : roast
    );

    return roasts;
  } catch (error) {
    console.error("Error generating roasts:", error);
    // Handle rate limiting specifically
    if (error instanceof Error && error.message.includes("rate limit")) {
      return [
        "Our roasting service is rate limited at the moment. Please try again later.",
        "Even our AI needs a break sometimes. Try again in a moment.",
      ];
    }
    return [
      "Your GitHub profile is so chaotic even our AI had a kernel panic trying to roast it. That's somehow both an insult and a compliment.",
      "Error 418: I'm a teapot. Just like your approach to version control - not meant for the job, yet somehow still used.",
      "The roaster crashed faster than a JavaScript framework after npm update. We'll take that as a sign your code is uniquely unroastable... or catastrophically roastable.",
      "Even AI has standards — we refused to roast your repo structure. It's either art or a crime scene, and we're not qualified to judge either.",
    ];
  }
}
