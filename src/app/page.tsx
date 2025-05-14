import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GitHubForm } from "@/components/github-form";
import { Github, FileCode, GitBranch } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-gray-100 py-20 dark:from-black dark:to-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">GitRoast</span>
              <span className="block text-blue-600 dark:text-blue-400">
                Your Commit History Needs a Reality Check
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-xl text-gray-600 dark:text-gray-300">
              Get your GitHub profile roasted with AI-powered humor. Because
              every developer deserves a reality check.
            </p>

            <div className="mt-10 flex justify-center">
              <GitHubForm />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Github className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Enter GitHub Username
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Type in your GitHub username or any profile you want to
                  analyze.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                  <FileCode className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  AI Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI analyzes your repositories, commit patterns, and coding
                  habits.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                  <GitBranch className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Get Roasted
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive witty, tech-focused roasts about your GitHub profile
                  you can share.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Sample Roasts
            </h2>
            <div className="mx-auto max-w-3xl space-y-4">
              <blockquote className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <p className="font-mono text-gray-700 dark:text-gray-300">
                  &quot;Your commit history is like my dating history—lots of
                  initial excitement followed by long periods of
                  abandonment.&quot;
                </p>
              </blockquote>

              <blockquote className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <p className="font-mono text-gray-700 dark:text-gray-300">
                  &quot;I see you&apos;ve mastered the art of JavaScript—if by
                  &apos;mastered&apos; we mean &apos;copied 90% from Stack
                  Overflow&apos;. Your 109 repos with identical boilerplate are
                  quite the achievement.&quot;
                </p>
              </blockquote>

              <blockquote className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <p className="font-mono text-gray-700 dark:text-gray-300">
                  &quot;Your follower-to-following ratio is the digital
                  equivalent of laughing at your own jokes. But hey, at least
                  your code has an audience of one!&quot;
                </p>
              </blockquote>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
