import { GitHubRepo, GitHubUser, ProfileStats, RoastIntensity } from "../types";
import OpenAI from "openai";

const GITHUB_API_URL = "https://api.github.com";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fetch GitHub user data
export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  // Only add Authorization header if we have a valid token
  // (token that doesn't look like a placeholder)
  const token = process.env.GITHUB_TOKEN;
  if (token && token !== "your_github_token_here" && !token.includes("_")) {
    headers.Authorization = `token ${token}`;
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
  const token = process.env.GITHUB_TOKEN;
  if (token && token !== "your_github_token_here" && !token.includes("_")) {
    headers.Authorization = `token ${token}`;
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
  const { user, repos, topLanguages, totalStars, accountAge, commitPattern } =
    stats;

  // Format language data
  const languages = Object.keys(topLanguages).join(", ");

  // Adjust temperature based on intensity
  const temperatures = {
    mild: 0.7,
    medium: 0.8,
    spicy: 0.9,
  };

  const promptTemplate = `You are GitRoast, an AI specialized in creating funny, witty "roasts" of developers based on their GitHub profile statistics. Your roasts should be developer-focused, technically accurate, and playfully critical without being mean-spirited.

GitHub User Stats:
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

Create 3-4 witty, technical roasts (1-2 sentences each) based on patterns in this data. Focus on:
- Repository quantity vs. quality
- Follower/following ratio
- Language choices and diversity
- Commit patterns and consistency
- Documentation habits
- Common developer stereotypes related to these metrics

Roast intensity: ${intensity.toUpperCase()}. ${
    intensity === "spicy"
      ? "Be more edgy but still professional."
      : intensity === "mild"
      ? "Keep it very gentle and light-hearted."
      : "Standard playful roasting."
  }

Keep it professional, technical, and genuinely funny in a way that developers would appreciate.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are GitRoast, an AI that creates funny, technical roasts about developers' GitHub profiles.",
        },
        { role: "user", content: promptTemplate },
      ],
      temperature: temperatures[intensity],
      max_tokens: 350,
    });

    // Parse the response text into separate roasts
    const roastText = response.choices[0].message.content || "";
    const roasts = roastText
      .split(/\d+\.\s+/) // Split by numbered list format
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());

    return roasts;
  } catch (error) {
    console.error("Error generating roasts:", error);
    return [
      "Sorry, I couldn't roast this profile. Maybe it's just too perfect... or too empty to work with!",
      "Error generating roasts. Maybe your code is breaking AI too?",
      "The roasting service is on a coffee break. Much like your commit history.",
    ];
  }
}
