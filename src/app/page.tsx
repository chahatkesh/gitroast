"use client";

import { Github, Loader2, AlertCircle, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    // Clear error when username changes
    if (error && username.trim()) {
      setError("");
    }
  }, [username, error]);

  useEffect(() => {
    // Fetch visitor count when component mounts
    const fetchVisitorCount = async () => {
      try {
        const response = await fetch("/api/visitors");
        if (response.ok) {
          const data = await response.json();
          setVisitorCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch visitor count:", error);
      }
    };

    fetchVisitorCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter a GitHub username");
      toast.error("Please enter a GitHub username");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Fetch GitHub data to validate the username
      const response = await fetch(
        `/api/github?username=${encodeURIComponent(username.trim())}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch GitHub profile");
      }

      // Add a slight delay for better UX
      setTimeout(() => {
        // Redirect to the results page
        router.push(`/result?username=${encodeURIComponent(username.trim())}`);
      }, 300);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 justify-center items-center bg-zinc-950">
        <section className="relative py-16 md:py-24 overflow-hidden bg-grid-pattern min-h-screen flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,109,0,0.1)_0,transparent_50%)]"></div>
          </div>
          <div className="absolute inset-0 bg-grid-pattern-overlay"></div>

          {/* Animated decorative elements */}
          <motion.div
            className="absolute hidden md:block top-24 left-16 w-32 h-32 rounded-full bg-orange-500/5"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute hidden md:block bottom-32 right-24 w-48 h-48 rounded-full bg-red-500/5"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* GitHub link */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-6 md:top-8 right-6 md:right-8 z-10">
            <a
              href="https://github.com/chahatkesh/gitroast"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-xl bg-transparent px-3 py-2 md:px-4 md:py-2.5 text-sm font-medium text-orange-400/50 hover:text-orange-400 transition-all duration-300"
              aria-label="GitHub Repository">
              <Github className="h-4 w-4 transition-transform duration-300" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </motion.div>

          <div className="container relative mx-auto px-4 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}>
              <h1 className="mb-4 md:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
                <motion.span
                  className="block bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500"
                  animate={{
                    backgroundPosition: [
                      "0% center",
                      "100% center",
                      "0% center",
                    ],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ backgroundSize: "200%" }}>
                  GitRoast
                </motion.span>
                <span className="block text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-zinc-200">
                  Your Commit History Needs a Reality Check
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto mt-4 max-w-xl text-lg md:text-xl text-zinc-400 px-4">
              Get your GitHub profile roasted with AI-powered humor. Because
              every developer deserves a reality check.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 md:mt-12 flex justify-center">
              <div className="w-full max-w-md px-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="relative group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Github className="h-5 w-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-200" />
                      </div>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your github username"
                        className="block w-full rounded-xl border-2 border-zinc-800 bg-zinc-900/70 py-3 pl-12 pr-4 text-base md:text-lg placeholder-zinc-500 shadow-md focus:border-orange-500/70 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-white"
                        disabled={isLoading}
                        aria-label="GitHub Username"
                        aria-describedby={error ? "username-error" : undefined}
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 text-red-400 text-sm mt-1 ml-1"
                        id="username-error">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 py-3 px-6 font-semibold text-white text-base md:text-lg shadow-lg shadow-orange-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-70">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing Profile...
                      </>
                    ) : (
                      <motion.span
                        initial={{ opacity: 1 }}
                        whileHover={{
                          opacity: [1, 0.8, 1],
                          transition: { duration: 1, repeat: Infinity },
                        }}>
                        Roast This Profile
                      </motion.span>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Visitor counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-12 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-zinc-300">
                  {visitorCount !== null ? (
                    <>
                      <span className="text-orange-400 font-bold">
                        {visitorCount.toLocaleString()}
                      </span>{" "}
                      visitors roasted
                    </>
                  ) : (
                    <span className="text-zinc-500">Loading visitors...</span>
                  )}
                </span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
