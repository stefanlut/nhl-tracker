# NHL Live Games Tracker

A modern Next.js application that displays live NHL game scores and updates. Built with Next.js, TypeScript, and Tailwind CSS, this application provides real-time game information using the NHL's public API.

## Features

- Live game tracking with real-time score updates
- Team logos for all NHL teams
- Game status indicators (Live, Final, or upcoming game times)
- Playoff series information display
- Weekly schedule view with date-based navigation
- Accurate game times with proper timezone handling
- Period and clock information for live games
- Dark mode support
- Responsive design for all screen sizes
- Automatic data refresh every 5 minutes

## Technical Details

- Built with Next.js 14+ and TypeScript
- Uses the NHL public API (api-web.nhle.com)
- Styled with Tailwind CSS
- SVG logo integration from NHL's CDN
- Optimized image loading with next/image
- Server-side rendering for better performance
- Proper timezone handling for game times

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Components

### GameCard Component
The main component that displays individual game information including:
- Team logos and names
- Current score
- Game status (Live/Final/Scheduled)
- Period and clock information for live games
- Playoff series details (round, series status, wins needed)
- Venue information
- Visual indicators for live games

### Weekly Schedule
- Date-based navigation for viewing games across different days
- Organized display of games by date
- Centered layout for better readability
- Consistent styling with the main view

### Main Page
- Responsive layout with centered content
- Automatic data fetching and revalidation
- Error handling for API failures
- Quick navigation to weekly schedule view
