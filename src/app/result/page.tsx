"use client";

import { useState, useEffect, Suspense } from "react";
import { ProfileStats, RoastIntensity, RoastResult } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Download,
  Calendar,
  Code,
  Users,
  Star,
  Github,
} from "lucide-react";
import { toPng } from "html-to-image";
import Image from "next/image";

// Component that uses search params
function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);
  const [intensity] = useState<RoastIntensity>("spicy"); // Default to spicy roast
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch GitHub data and generate roasts
  useEffect(() => {
    if (!username) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch GitHub profile data
        const response = await fetch(
          `/api/github?username=${encodeURIComponent(username)}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch GitHub profile");
        }

        const stats = await response.json();
        setProfileStats(stats);

        // Generate roasts
        await generateRoasts(stats, intensity);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Something went wrong";
        setError(errorMessage);
        toast.error(errorMessage || "Failed to fetch GitHub data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, router, intensity]);

  // Generate roasts with the selected intensity
  const generateRoasts = async (
    stats: ProfileStats,
    intensity: RoastIntensity
  ) => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stats, intensity }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Handle specific error status codes
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        } else if (response.status === 500 && data.error.includes("API")) {
          throw new Error("API configuration issue. Please try again later.");
        } else {
          throw new Error(data.error || "Failed to generate roasts");
        }
      }

      const result = await response.json();
      setRoastResult(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate roasts";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download as image
  const downloadAsImage = async () => {
    const element = document.getElementById("roast-card");
    if (!element) return;

    try {
      const dataUrl = await toPng(element);
      const link = document.createElement("a");
      link.download = `gitroast-${username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      // Log error silently but show user-friendly message
      console.error(error);
      toast.error("Failed to download image");
    }
  };

  // Share on Twitter
  const shareOnTwitter = () => {
    if (!roastResult) return;

    // Get a random roast from the results for more variety in shares
    const randomRoastIndex = Math.floor(
      Math.random() * roastResult.roasts.length
    );
    const selectedRoast = roastResult.roasts[randomRoastIndex];

    // Add trending developer hashtags to increase visibility
    const hashtags = "GitRoast,DevMemes,CodeLife";

    // Create more viral tweet text with emojis and engaging language
    const text = `🔥 My GitHub profile just got DESTROYED by GitRoast 💀\n\n"${selectedRoast}"\n\nSavage AI roasts for devs:`;
    const url = `https://gitroast.vercel.app\n\n`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`,
      "_blank"
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-16">
        <h2 className="mb-6 text-2xl font-bold text-red-500">Error</h2>
        <p className="mb-6 text-zinc-400">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-2.5 font-medium text-white shadow-lg hover:from-orange-700 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-200">
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading || !profileStats) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-16">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-orange-500" />
        <p className="text-lg font-medium text-zinc-300">
          Fetching GitHub profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-16">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/10"></div>
        <div className="absolute inset-0 bg-grid-pattern-overlay"></div>
      </div>

      {/* Main content container with max height */}
      <div className="container relative mx-auto px-4 py-8 flex flex-col">
        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - User profile & expanded stats */}
          <div className="lg:col-span-5 flex flex-col pb-4 space-y-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative h-16 w-16 mr-4">
                  <div className="absolute -inset-1 opacity-70"></div>
                  <Image
                    src={profileStats.user.avatar_url}
                    alt={`${username}'s avatar`}
                    className="rounded-lg relative border-2 border-zinc-800"
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    {profileStats.user.name || username}
                  </h1>
                  <p className="text-zinc-400">
                    <a
                      href={profileStats.user.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-orange-400 transition-colors">
                      @{username}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            {/* User bio with styled border */}
            {profileStats.user.bio && (
              <div className="p-4 text-zinc-300 text-sm bg-zinc-900/40 border-l-2 border-orange-500 rounded-r-lg">
                <h3 className="text-sm uppercase tracking-wider text-orange-400 mb-2">
                  Bio
                </h3>
                {profileStats.user.bio}
              </div>
            )}
            {/* Primary Stats with Icons */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                <Code className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-lg font-bold text-white">
                    {profileStats.user.public_repos}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase">
                    Repositories
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                <Users className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-lg font-bold text-white">
                    {profileStats.user.followers}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase">Followers</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                <Star className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-lg font-bold text-white">
                    {profileStats.totalStars}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase">Total Stars</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-lg font-bold text-white">
                    {Math.floor(profileStats.accountAge / 365)}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase">
                    Years Active
                  </p>
                </div>
              </div>
            </div>
            {/* Language section with improved visualization */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
              <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center">
                <Code className="h-4 w-4 mr-2 text-orange-500" />
                Top Languages
              </h3>
              <div className="space-y-2">
                {Object.entries(profileStats.topLanguages)
                  .slice(0, 5)
                  .map(([lang, count]) => {
                    // Calculate percentage for bar width
                    const maxCount = Math.max(
                      ...Object.values(profileStats.topLanguages)
                    );
                    const percentage = (count / maxCount) * 100;

                    return (
                      <div key={lang} className="relative">
                        <div className="flex justify-between mb-1 text-xs">
                          <span className="text-zinc-300">{lang}</span>
                          <span className="text-zinc-500">{count} repos</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Enhanced Action buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/70 px-4 py-2.5 font-medium text-zinc-300 shadow-md hover:bg-zinc-700/70 hover:text-white transition-all duration-200">
                  <Github className="h-4 w-4" />
                  Try Another Username
                </button>
              </div>

              {/* Twitter Share button */}
              <button
                onClick={shareOnTwitter}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 px-4 py-3 text-[#1DA1F2] font-medium border border-[#1DA1F2]/20 hover:border-[#1DA1F2]/30 transform hover:-translate-y-1 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current">
                  <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.38 4.482A13.978 13.978 0 011.67 3.15a4.93 4.93 0 001.52 6.574 4.903 4.903 0 01-2.23-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 14-7.497 14-13.986 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59v-.033z" />
                </svg>
                Share on Twitter
              </button>
            </div>
          </div>

          {/* Right column - Roast card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="mb-4 flex items-center px-4 lg:px-8">
              <h2 className="text-2xl font-bold text-left bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                Your GitHub Roast
              </h2>
              <div className="ml-4 inline-flex items-center bg-gradient-to-r from-red-600/20 to-red-600/30 rounded-full px-4 py-1">
                <p className="text-[11px] text-red-400 font-medium">
                  🔥 Spicy!
                </p>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 my-4 mx-4 lg:mx-12 border border-zinc-700/50 rounded-xl bg-zinc-900">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-orange-500" />
                <p className="text-zinc-300">Generating roasts...</p>
              </div>
            ) : (
              <div className="px-4 lg:px-12">
                <div
                  id="roast-card"
                  className="rounded-xl border-2 border-zinc-700/80 bg-zinc-900 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-2xl relative overflow-hidden">
                  {/* Enhanced decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/30 to-red-500/40 blur-xl rounded-full transform -translate-x-5 -translate-y-5"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-orange-500/20 to-red-500/30 blur-xl rounded-full transform translate-x-5 translate-y-5"></div>
                  <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-xl rounded-full"></div>

                  {/* Meme-style watermark */}
                  <div className="absolute top-5 right-8 rotate-12 opacity-10 pointer-events-none">
                    <p className="text-5xl font-extrabold text-white">
                      SPICY AF 🔥
                    </p>
                  </div>

                  <div className="relative">
                    {/* Enhanced header with GitHub user info */}
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative mr-4 h-14 w-14 overflow-hidden rounded-full border-3 border-orange-500/70 shadow-lg shadow-orange-500/20">
                          <Image
                            src={profileStats.user.avatar_url}
                            alt={`${username}'s avatar`}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
                            {profileStats.user.name || username}
                          </p>
                          <p className="text-sm font-medium text-zinc-400">
                            @{username}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced meme-style roast content */}
                    <div className="space-y-5 mb-6">
                      {roastResult?.roasts.map((roast, index) => (
                        <div
                          key={index}
                          className="transform hover:scale-[1.01] transition-all">
                          <div className="relative">
                            {/* Emojis based on index */}
                            <span className="absolute -left-2 -top-2 z-10 text-lg">
                              {
                                [
                                  "💀", // skull
                                  "🔥", // fire
                                  "💣", // bomb
                                  "☠️", // skull and crossbones
                                ][index % 4]
                              }
                            </span>

                            <blockquote
                              className={`
                              border-l-4 border-orange-500 pl-4 py-3 
                              ${
                                index % 2 === 0
                                  ? "bg-gradient-to-r from-zinc-800/50 to-zinc-800/30"
                                  : "bg-gradient-to-r from-zinc-800/40 to-zinc-800/20"
                              } 
                              rounded-r-lg shadow-md relative overflow-hidden group
                            `}>
                              {/* Background pattern for visual interest */}
                              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#fff_0.5px,_transparent_1px)] bg-[length:10px_10px]"></div>

                              <p className="font-mono text-zinc-200 font-medium relative z-10">
                                {roast}
                              </p>

                              {/* Subtle icon indicator */}
                              <div className="absolute right-2 bottom-1 opacity-20 text-xs">
                                #roast{index + 1}
                              </div>
                            </blockquote>
                          </div>
                        </div>
                      )) || (
                        <p className="text-zinc-400">
                          No roasts generated yet. Please wait a moment...
                        </p>
                      )}
                    </div>

                    {/* Stats summary - small version for the card */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      <div className="bg-zinc-800/50 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-zinc-400">Repos: </span>
                        <span className="text-sm text-white font-medium">
                          {profileStats.user.public_repos}
                        </span>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-zinc-400">
                          Followers:{" "}
                        </span>
                        <span className="text-sm text-white font-medium">
                          {profileStats.user.followers}
                        </span>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-zinc-400">Stars: </span>
                        <span className="text-sm text-white font-medium">
                          {profileStats.totalStars}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced meme-style footer */}
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-zinc-800/70 flex flex-col">
                      <div className="flex items-center justify-center mb-3">
                        <p className="text-center font-bold tracking-tight text-zinc-400 italic text-sm px-8 py-1 bg-zinc-800/30 rounded-full transform -rotate-1">
                          &ldquo;Tragic code, epic roasts.&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                          <div className="flex items-center  p-1 rounded-md shadow-inner">
                            <span className="text-orange-500 font-extrabold text-lg mr-0.5">
                              Git
                            </span>
                            <span className="text-red-500 font-extrabold text-lg">
                              Roast
                            </span>
                            <span className="text-orange-500 ml-0.5">🔥</span>
                          </div>
                        </div>

                        {/* QR code placeholder and date */}
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-zinc-400 font-mono">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Download button positioned at bottom of right column */}
            <div className="mt-4 px-4 lg:px-12">
              <button
                onClick={downloadAsImage}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-medium text-white shadow-lg hover:from-orange-700 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-600/0 via-white/30 to-orange-600/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <Download className="h-5 w-5" />
                <span className="relative z-10">
                  Download Meme-worthy Roast
                </span>
              </button>
              <p className="text-center text-zinc-500 text-xs mt-2">
                Perfect for sharing on Slack, Discord & dev forums
              </p>
            </div>

            <style jsx>{`
              @keyframes shimmer {
                100% {
                  transform: translateX(100%);
                }
              }
            `}</style>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center pb-6">
          <div className="text-xs text-zinc-500">
            <a
              href="https://github.com/chahatkesh/gitroast"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition-colors">
              GitHub
            </a>
            <span className="mx-2">•</span>
            <span>© {new Date().getFullYear()} GitRoast</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense boundary
export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-16">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-orange-500" />
          <p className="text-lg font-medium text-zinc-300">Loading...</p>
        </div>
      }>
      <ResultContent />
    </Suspense>
  );
}
