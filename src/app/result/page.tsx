"use client";

import { useState, useEffect } from "react";
import { ProfileStats, RoastIntensity, RoastResult } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Download, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import Image from "next/image";

export default function ResultPage({
  searchParams,
}: {
  searchParams: { username: string };
}) {
  const router = useRouter();
  const { username } = searchParams;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);
  const [intensity, setIntensity] = useState<RoastIntensity>("medium");
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
        const response = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch GitHub profile");
        }
        
        const stats = await response.json();
        setProfileStats(stats);
        
        // Generate roasts
        await generateRoasts(stats, intensity);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        setError(errorMessage);
        toast.error(errorMessage || "Failed to fetch GitHub data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, router, intensity]);

  // Generate roasts with the selected intensity
  const generateRoasts = async (stats: ProfileStats, intensity: RoastIntensity) => {
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
        throw new Error(data.error || "Failed to generate roasts");
      }
      
      const result = await response.json();
      setRoastResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate roasts";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle intensity change
  const handleIntensityChange = (newIntensity: RoastIntensity) => {
    if (newIntensity !== intensity && profileStats) {
      setIntensity(newIntensity);
      generateRoasts(profileStats, newIntensity);
    }
  };

  // Download as image
  const downloadAsImage = async () => {
    const element = document.getElementById('roast-card');
    if (!element) return;
    
    try {
      const dataUrl = await toPng(element);
      const link = document.createElement('a');
      link.download = `gitroast-${username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (_error) {
      toast.error('Failed to download image');
    }
  };

  // Share on Twitter
  const shareOnTwitter = () => {
    if (!roastResult) return;
    
    const text = `I just got my GitHub profile roasted by GitRoast! "${roastResult.roasts[0]}" Check yours at:`;
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gitroast.vercel.app'}/result?username=${username}`;
    
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-6 text-2xl font-bold text-red-600 dark:text-red-400">
          Error
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading || !profileStats) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Fetching GitHub profile...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User info header */}
      <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-start">
        {/* Use Next.js Image component for better optimization */}
        <div className="mb-4 h-24 w-24 relative sm:mb-0 sm:mr-6">
          <Image
            src={profileStats.user.avatar_url}
            alt={`${username}'s avatar`}
            className="rounded-full"
            fill
            style={{objectFit: "cover"}}
          />
        </div>
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {profileStats.user.name || username}
          </h1>
          <p className="mb-1 text-gray-600 dark:text-gray-400">
            <a 
              href={profileStats.user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
            >
              @{username}
            </a>
          </p>
          {profileStats.user.bio && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {profileStats.user.bio}
            </p>
          )}
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Repositories</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {profileStats.user.public_repos}
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {profileStats.user.followers}
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Stars</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {profileStats.totalStars}
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Account Age</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {Math.floor(profileStats.accountAge / 365)} years
          </p>
        </div>
      </div>
      
      {/* Language chart */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Top Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(profileStats.topLanguages).map(([lang, count]) => (
            <span
              key={lang}
              className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {lang} ({count})
            </span>
          ))}
        </div>
      </div>
      
      {/* Roast section */}
      <div className="mb-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Your GitHub Roast
        </h2>
        
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => handleIntensityChange("mild")}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              intensity === "mild"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            Mild
          </button>
          <button
            onClick={() => handleIntensityChange("medium")}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              intensity === "medium"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => handleIntensityChange("spicy")}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              intensity === "spicy"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            Spicy
          </button>
        </div>
        
        {isGenerating ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p>Generating roasts...</p>
          </div>
        ) : (
          <>
            <div id="roast-card" className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative mr-3 h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={profileStats.user.avatar_url}
                      alt={`${username}'s avatar`}
                      fill
                      style={{objectFit: "cover"}}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profileStats.user.name || username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{username}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-4">
                {roastResult?.roasts.map((roast, index) => (
                  <blockquote key={index} className="border-l-4 border-blue-500 pl-4">
                    <p className="font-mono text-gray-800 dark:text-gray-300">{roast}</p>
                  </blockquote>
                )) || (
                  <p className="text-gray-600 dark:text-gray-400">
                    No roasts generated yet. Try adjusting the intensity.
                  </p>
                )}
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Generated by GitRoast · gitroast.vercel.app
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                onClick={downloadAsImage}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={shareOnTwitter}
                className="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 font-medium text-white shadow-sm hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/')}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Try Another Username
        </button>
      </div>
    </div>
  );
}
