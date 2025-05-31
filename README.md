# NHL Tracker

A comprehensive Next.js application for tracking NHL games, teams, players, and draft prospects. Built with Next.js 15, TypeScript, and Tailwind CSS, this application provides real-time NHL data using the official NHL API.

## 🏒 Features

### 🏒 Live Games & Scores
- **Real-time game tracking** with automatic updates every 30 seconds
- **Live game status** indicators (Live, Final, or upcoming game times)
- **Period and clock information** for games in progress
- **Playoff series tracking** with round information and series status
- **Team logos** for all 32 NHL teams from official NHL CDN
- **Venue information** for each game
- **Visual indicators** for live games with dynamic styling

### 📅 Schedule Management
- **Weekly schedule view** with intuitive date-based navigation
- **Game organization by date** with clean, centered layout
- **Quick navigation** between weekly and daily views
- **Timezone-accurate** game times and scheduling

### 🏒 Team Management
- **Complete team roster** viewing for all 32 NHL teams
- **Interactive team selection** with official team logos and branding
- **Dual-view interface** with roster and statistics tabs
- **Player modal details** with comprehensive player information
- **Sortable roster tables** by jersey number, name, position, age, height, weight

### 📊 Advanced Statistics
- **Team statistics** for both regular season and playoffs
- **Player statistics** with detailed performance metrics
- **Visual stat bars** with ranking information and color-coded performance
- **Comprehensive stats coverage**:
  - Goals, assists, points, plus/minus
  - Penalty minutes, shots, shooting percentage
  - Time on ice, power play stats
  - Goalie-specific stats (GAA, save percentage, shutouts)
- **League rankings** for all major statistical categories
- **Season/Playoff toggle** for viewing different game type stats

### 🎓 NHL Draft Rankings
- **Complete draft prospect tracking** for all Central Scouting categories:
  - North American Skaters (225+ prospects)
  - International Skaters (140+ prospects) 
  - North American Goalies (30+ prospects)
  - International Goalies (15+ prospects)
- **Category filtering** with real-time data switching
- **Prospect cards** showing:
  - Final and midterm rankings with change indicators
  - Physical stats (height, weight, shoots/catches)
  - Birthplace and amateur club information
  - League and team details
- **Pagination system** (20 players per page) with smart navigation
- **Ranking change tracking** comparing midterm to final rankings
- **Stats summary** showing total prospects per category

### 🏒 User Experience
- **Dark mode support** with system preference detection
- **Responsive design** optimized for all screen sizes
- **Error boundaries** with graceful error handling
- **Loading states** with animated spinners
- **Interactive modals** for detailed player information
- **Smooth transitions** and hover effects
- **Accessibility features** with proper ARIA labels and keyboard navigation

## 🛠️ Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with dark mode support
- **Data Fetching**: SWR for efficient data management and caching
- **UI Components**: Headless UI for accessible components
- **Icons**: Heroicons for consistent iconography
- **API**: Official NHL API (api-web.nhle.com)
- **Image Optimization**: Next.js Image component with NHL CDN integration
- **State Management**: React hooks with efficient re-rendering
- **Testing**: Jest with React Testing Library

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── draft/rankings/     # Draft rankings endpoint
│   │   ├── games/              # Games data endpoint
│   │   └── teams/[teamCode]/   # Team-specific endpoints
│   │       ├── roster/         # Team roster data
│   │       ├── stats/          # Team statistics
│   │       └── player-stats/   # Player statistics
│   ├── components/             # Reusable UI components
│   │   ├── DraftPlayerCard.tsx # Draft prospect cards
│   │   ├── GameCard.tsx        # Game score cards
│   │   ├── TeamDetails.tsx     # Team roster/stats viewer
│   │   ├── PlayerModal.tsx     # Player detail modal
│   │   └── ErrorBoundary.tsx   # Error handling wrapper
│   ├── draft/                  # Draft rankings page
│   ├── teams/                  # Teams management page
│   └── weekly/                 # Weekly schedule page
├── types/
│   └── nhl.ts                  # TypeScript type definitions
├── constants/
│   ├── teams.ts                # NHL team data and configurations
│   └── index.ts                # App-wide constants
└── utils/
    └── dates.ts                # Date manipulation utilities
```

## 🔄 API Endpoints

### Internal API Routes
- `GET /api/games` - Current NHL games and scores
- `GET /api/draft/rankings?category={category}` - Draft rankings by category
- `GET /api/teams/{teamCode}/roster` - Team roster data
- `GET /api/teams/{teamCode}/stats?playoffs={boolean}` - Team statistics
- `GET /api/teams/{teamCode}/player-stats?playoffs={boolean}` - Player statistics

### External NHL API Integration
- Team rosters and player information
- Live game scores and statistics
- Draft rankings and prospect data
- Season and playoff statistics
- Historical team performance data

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nhl-tracker

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

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
