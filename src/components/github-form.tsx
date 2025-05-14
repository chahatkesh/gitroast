'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function GitHubForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a GitHub username');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch GitHub data to validate the username
      const response = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch GitHub profile');
      }
      
      // Redirect to the results page
      router.push(`/result?username=${encodeURIComponent(username)}`);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            GitHub Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Github className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="octocoder"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center rounded-md bg-blue-600 py-2 px-4 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Roast My Profile'
          )}
        </button>
      </form>
    </div>
  );
}
