// Configuration utilities

/**
 * Safely get environment variables with validation
 */
export const config = {
  /**
   * OpenAI API key
   */
  openaiApiKey: process.env.OPENAI_API_KEY || "",

  /**
   * Optional GitHub token for increased rate limits
   */
  githubToken: process.env.GITHUB_TOKEN || "",

  /**
   * Application URL for sharing features
   */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://gitroast.chahatkesh.me",

  /**
   * Check if required configurations are set
   */
  isOpenAIConfigured(): boolean {
    return Boolean(
      this.openaiApiKey &&
        this.openaiApiKey.length > 10 &&
        !this.openaiApiKey.includes("your_") &&
        !this.openaiApiKey.includes("sk-demo")
    );
  },

  /**
   * Check if GitHub token is properly configured
   */
  isGitHubTokenConfigured(): boolean {
    return Boolean(
      this.githubToken &&
        this.githubToken.length > 10 &&
        !this.githubToken.includes("your_") &&
        !this.githubToken.includes("_")
    );
  },
};
