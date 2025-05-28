# NHL Live Games Tracker

A modern Next.js application that displays live NHL game scores and updates. Built with Next.js, TypeScript, and Tailwind CSS, this application provides real-time game information using the NHL's public API.

## Features

- Live game tracking with real-time score updates
- Team logos for all NHL teams
- Game status indicators (Live, Final, or upcoming game times)
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


### GameCard Component
The main component that displays individual game information including:
- Team logos and names
- Current score
- Game status (Live/Final/Scheduled)
- Venue information
- Visual indicators for live games

### Main Page
- Responsive layout with centered content
- Automatic data fetching and revalidation
- Error handling for API failures
- Loading states and empty states

## API Integration

The application integrates with the NHL API:
```typescript
GET https://api-web.nhle.com/v1/schedule/now
```

Data is refreshed every 5 minutes to ensure up-to-date game information while maintaining reasonable API usage. Information about NHL APIs can be found [here](https://github.com/Zmalski/NHL-API-Reference?tab=readme-ov-file#nhl-web-api-documentation).

## Styling

- Custom dark mode implementation
- Responsive design using Tailwind CSS
- Animated indicators for live games
- Optimized team logo display
- Consistent spacing and typography

## Future Improvements

Potential enhancements could include:
- Detailed game statistics
- Player information
- Historical game data
- Live play-by-play updates
- Team standings
- Push notifications for game updates
