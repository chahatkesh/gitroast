'use client';

import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-black">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 md:flex-row md:justify-between">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} GitRoast. All rights reserved.
        </p>
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
          <span>and Next.js</span>
        </div>
      </div>
    </footer>
  );
}
