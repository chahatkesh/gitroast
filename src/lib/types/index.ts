export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  topics: string[];
}

export interface ProfileStats {
  user: GitHubUser;
  repos: GitHubRepo[];
  topLanguages: { [key: string]: number };
  totalStars: number;
  accountAge: number; // in days
  commitPattern?: string;
}

export interface RoastResult {
  username: string;
  profileStats: ProfileStats;
  roasts: string[];
  intensity: "mild" | "medium" | "spicy";
  timestamp: number;
}

export type RoastIntensity = "mild" | "medium" | "spicy";
