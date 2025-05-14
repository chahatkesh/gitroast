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

  const promptTemplate = `You are GitRoast, an AI comedy roast master specializing in BRUTAL but hilarious developer humor. You analyze GitHub profiles and deliver savage, technically-accurate roasts that would make both senior engineers and Stack Overflow lurkers snort their coffee.

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

Create 3-4 absolutely HILARIOUS tech roasts (1-3 sentences each) using contemporary developer slang, memes, and references. Mix technical observations with creative exaggeration for maximum comedy. 

ROASTING ANGLES:
- Ridiculous comparisons between their code output and famous tech disasters
- Repo quantity vs quality ("404 quality not found")
- Over/under engineering stereotypes based on their languages
- "Works on my machine" syndrome for inconsistent committers
- Follower ratio compared to their code quality
- Language choices as personality flaws ("Of course you code in X, that explains everything")
- Excessive commits as compensation for something else
- Sparse commits as "proof" they're outsourcing to StackOverflow
- Documentation habits (or the lack thereof)

ROAST INTENSITY: ${intensity.toUpperCase()}. ${
    intensity === "spicy"
      ? "Be absolutely savage but clever - channel a mix of tech conference heckler and disappointed senior dev. Make the audience GASP then laugh."
      : intensity === "mild"
      ? "Light teasing with a supportive undertone - like a friend gently mocking your coding style while still respecting you."
      : "Standard roasting - balance between savage burns and good-natured teasing. Make them laugh at themselves."
  }

Ensure each roast contains:
1. Specific references to their actual GitHub data
2. Creative exaggeration for humor
3. At least one programming joke or tech culture reference
4. A dash of absurdity that still feels technically relevant

Make these roasts so funny and on-point that the developer would WANT to share them with colleagues. Keep it JUST professional enough to share at work, but edgy enough to make people laugh out loud.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are GitRoast, a legendary AI comedy roast master who specializes in hilarious, technically-accurate burns about developers' GitHub profiles. You're known for your savage wit, perfect timing, and ability to find the humor in any coding style or GitHub habit. Your roasts are so good that developers share them proudly.",
        },
        { role: "user", content: promptTemplate },
      ],
      temperature: temperatures[intensity],
      max_tokens: 450,
    });

    // Parse the response text into separate roasts
    const roastText = response.choices[0].message.content || "";
    const roasts = roastText
      .split(/\d+\.\s+/) // Split by numbered list format
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());

    return roasts.length > 0
      ? roasts
      : ["Your GitHub profile is so unique it left our AI speechless!"];
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
