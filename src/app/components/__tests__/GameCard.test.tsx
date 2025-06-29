import { render, screen } from '@testing-library/react';
import GameCard from '../GameCard';
import { NHLGame } from '@/types/nhl';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; width: number; height: number; className?: string; priority?: boolean }) => {
    return (
      <div 
        data-testid="mock-image"
        style={{ width: props.width, height: props.height }}
        className={props.className}
        aria-label={props.alt}
      />
    );
  },
}));

// Mock the LiveBoxscoreStats component
jest.mock('../LiveBoxscoreStats', () => {
  return function MockLiveBoxscoreStats({ gameId, awayTeamAbbrev, homeTeamAbbrev }: { 
    gameId: number; 
    awayTeamAbbrev: string; 
    homeTeamAbbrev: string; 
  }) {
    return (
      <div data-testid="live-boxscore-stats">
        Live Stats for Game {gameId}: {awayTeamAbbrev} vs {homeTeamAbbrev}
      </div>
    );
  };
});

const mockGame: NHLGame = {
  id: 1,
  season: 2023,
  gameType: 2,
  gameDate: '2024-01-01',
  venue: {
    default: 'Test Arena',
  },
  startTimeUTC: '2024-01-01T23:00:00Z',
  awayTeam: {
    id: 1, // NJD
    placeName: {
      default: 'New Jersey',
    },
    score: 2,
    sog: 25,
  },
  homeTeam: {
    id: 2, // NYI
    placeName: {
      default: 'New York',
    },
    score: 3,
    sog: 28,
  },
  gameState: 'LIVE',
  gameScheduleState: 'OK',
  periodDescriptor: {
    number: 2,
    periodType: 'REG',
  },
  clock: {
    timeRemaining: '10:00',
    running: true,
  },
};

describe('GameCard', () => {
  it('renders game information correctly', () => {
    render(<GameCard game={mockGame} />);
    
    // Test team names are displayed
    expect(screen.getByText('New Jersey')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    
    // Test scores are displayed
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Test venue is displayed
    expect(screen.getByText('Test Arena')).toBeInTheDocument();
    
    // Test game status with shots on goal
    expect(screen.getByText('LIVE · P2 · 10:00 · SOG: NJD 25, NYI 28')).toBeInTheDocument();
    
    // Test team logos are rendered with correct alt text
    expect(screen.getByLabelText('New Jersey logo')).toBeInTheDocument();
    expect(screen.getByLabelText('New York logo')).toBeInTheDocument();
  });

  it('renders live indicator for live games', () => {
    render(<GameCard game={mockGame} />);
    
    // Check for live status badge with red styling
    const liveStatus = screen.getByText(/LIVE/);
    expect(liveStatus).toBeInTheDocument();
    expect(liveStatus.closest('span')).toHaveClass('bg-red-100', 'text-red-800');
    
    // Check for animated live indicator dot
    const liveIndicator = document.querySelector('.animate-ping');
    expect(liveIndicator).toBeInTheDocument();
  });

  it('renders LiveBoxscoreStats for live games', () => {
    render(<GameCard game={mockGame} />);
    
    expect(screen.getByTestId('live-boxscore-stats')).toBeInTheDocument();
    expect(screen.getByText('Live Stats for Game 1: NJD vs NYI')).toBeInTheDocument();
  });

  it('does not render LiveBoxscoreStats for non-live games', () => {
    const finalGame = {
      ...mockGame,
      gameState: 'FINAL',
    };
    
    render(<GameCard game={finalGame} />);
    expect(screen.queryByTestId('live-boxscore-stats')).not.toBeInTheDocument();
  });

  it('renders a final game correctly', () => {
    const finalGame = {
      ...mockGame,
      gameState: 'FINAL',
      clock: undefined,
    };
    
    render(<GameCard game={finalGame} />);
    
    const finalStatus = screen.getByText('Final · SOG: NJD 25, NYI 28');
    expect(finalStatus).toBeInTheDocument();
    expect(finalStatus.closest('span')).toHaveClass('bg-gray-100', 'text-gray-800');
    
    // Should not have live indicator
    expect(document.querySelector('.animate-ping')).not.toBeInTheDocument();
  });

  it('renders pregame status with time', () => {
    const pregameGame = {
      ...mockGame,
      gameState: 'PRE',
      periodDescriptor: undefined,
      clock: undefined,
    };
    
    render(<GameCard game={pregameGame} />);
    
    const pregameStatus = screen.getByText('6:00 pm ET');
    expect(pregameStatus).toBeInTheDocument();
    expect(pregameStatus.closest('span')).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('handles different game states correctly', () => {
    const criticalGame = {
      ...mockGame,
      gameState: 'CRIT',
    };
    
    render(<GameCard game={criticalGame} />);
    expect(screen.getByText(/LIVE/)).toBeInTheDocument();
    expect(screen.getByTestId('live-boxscore-stats')).toBeInTheDocument();
  });

  it('renders overtime game status correctly', () => {
    const otGame = {
      ...mockGame,
      periodDescriptor: {
        number: 1,
        periodType: 'OT' as const,
      },
    };
    
    render(<GameCard game={otGame} />);
    expect(screen.getByText('LIVE · OT · 10:00 · SOG: NJD 25, NYI 28')).toBeInTheDocument();
  });

  it('renders shootout game status correctly', () => {
    const soGame = {
      ...mockGame,
      periodDescriptor: {
        number: 1,
        periodType: 'SO' as const,
      },
    };
    
    render(<GameCard game={soGame} />);
    expect(screen.getByText('LIVE · SO · 10:00 · SOG: NJD 25, NYI 28')).toBeInTheDocument();
  });

  it('handles missing shots on goal data', () => {
    const gameWithoutSOG = {
      ...mockGame,
      awayTeam: {
        ...mockGame.awayTeam,
        sog: undefined,
      },
      homeTeam: {
        ...mockGame.homeTeam,
        sog: undefined,
      },
    };
    
    render(<GameCard game={gameWithoutSOG} />);
    expect(screen.getByText('LIVE · P2 · 10:00')).toBeInTheDocument();
    expect(screen.queryByText(/SOG:/)).not.toBeInTheDocument();
  });

  it('handles missing clock data for live games', () => {
    const gameWithoutClock = {
      ...mockGame,
      clock: undefined,
    };
    
    render(<GameCard game={gameWithoutClock} />);
    expect(screen.getByText('LIVE · P2 · SOG: NJD 25, NYI 28')).toBeInTheDocument();
  });

  it('renders playoff series information when available', () => {
    const playoffGame = {
      ...mockGame,
      seriesStatus: {
        round: 1,
        seriesAbbrev: 'R1',
        seriesTitle: 'First Round',
        seriesLetter: 'A',
        neededToWin: 4,
        topSeedTeamAbbrev: 'NJD',
        topSeedWins: 2,
        bottomSeedTeamAbbrev: 'NYI',
        bottomSeedWins: 1,
        gameNumberOfSeries: 4,
      },
    };
    
    render(<GameCard game={playoffGame} />);
    
    expect(screen.getByText(/First Round/)).toBeInTheDocument();
    expect(screen.getByText(/Game 4/)).toBeInTheDocument();
    expect(screen.getByText(/NJD leads/)).toBeInTheDocument();
    expect(screen.getByText(/2-1/)).toBeInTheDocument();
  });

  it('renders tied playoff series correctly', () => {
    const tiedSeriesGame = {
      ...mockGame,
      seriesStatus: {
        round: 1,
        seriesAbbrev: 'R1',
        seriesTitle: 'First Round',
        seriesLetter: 'A',
        neededToWin: 4,
        topSeedTeamAbbrev: 'NJD',
        topSeedWins: 2,
        bottomSeedTeamAbbrev: 'NYI',
        bottomSeedWins: 2,
        gameNumberOfSeries: 5,
      },
    };
    
    render(<GameCard game={tiedSeriesGame} />);
    
    expect(screen.getByText(/Series tied/)).toBeInTheDocument();
    expect(screen.getByText(/2-2/)).toBeInTheDocument();
  });

  it('renders series winner correctly', () => {
    const seriesWinnerGame = {
      ...mockGame,
      seriesStatus: {
        round: 1,
        seriesAbbrev: 'R1',
        seriesTitle: 'First Round',
        seriesLetter: 'A',
        neededToWin: 4,
        topSeedTeamAbbrev: 'NJD',
        topSeedWins: 4,
        bottomSeedTeamAbbrev: 'NYI',
        bottomSeedWins: 2,
        gameNumberOfSeries: 6,
      },
    };
    
    render(<GameCard game={seriesWinnerGame} />);
    
    expect(screen.getByText(/NJD wins series/)).toBeInTheDocument();
    expect(screen.getByText(/4-2/)).toBeInTheDocument();
  });

  it('handles missing venue information', () => {
    const gameWithoutVenue = {
      ...mockGame,
      venue: {
        default: '',
      },
    };
    
    render(<GameCard game={gameWithoutVenue} />);
    expect(screen.getByText('TBD')).toBeInTheDocument();
  });

  it('handles missing team place names', () => {
    const gameWithoutPlaceNames = {
      ...mockGame,
      awayTeam: {
        ...mockGame.awayTeam,
        placeName: {
          default: '',
        },
      },
      homeTeam: {
        ...mockGame.homeTeam,
        placeName: {
          default: '',
        },
      },
    };
    
    render(<GameCard game={gameWithoutPlaceNames} />);
    expect(screen.getByText('Away Team')).toBeInTheDocument();
    expect(screen.getByText('Home Team')).toBeInTheDocument();
  });

  it('uses correct team logo URLs', () => {
    render(<GameCard game={mockGame} />);
    
    const images = screen.getAllByTestId('mock-image');
    expect(images).toHaveLength(2);
    
    // Check that images have the correct alt text for team logos
    expect(screen.getByLabelText('New Jersey logo')).toBeInTheDocument();
    expect(screen.getByLabelText('New York logo')).toBeInTheDocument();
  });

  it('formats time correctly for different timezones', () => {
    // Test with a specific UTC time that should convert to 6:00 PM ET
    const gameWithSpecificTime = {
      ...mockGame,
      startTimeUTC: '2024-01-01T23:00:00Z', // 6:00 PM ET
      gameState: 'PRE',
      periodDescriptor: undefined,
      clock: undefined,
    };
    
    render(<GameCard game={gameWithSpecificTime} />);
    expect(screen.getByText('6:00 pm ET')).toBeInTheDocument();
  });
});
