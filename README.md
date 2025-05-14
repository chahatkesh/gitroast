# GitRoast

"Because sometimes your commit history needs a reality check."

## About

GitRoast is a developer-focused web application that provides humorous, AI-generated "roasts" based on a user's GitHub profile statistics. The application aims to be shareable, light-hearted, and engaging for the developer community.

## Features

- GitHub profile analysis
- AI-powered roast generation
- Customizable roast intensity
- Shareable results
- Dark/light mode toggle
- Responsive design

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- OpenAI API
- GitHub REST API

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GITHUB_TOKEN=your_github_token_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is configured for easy deployment on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fgitroast)
