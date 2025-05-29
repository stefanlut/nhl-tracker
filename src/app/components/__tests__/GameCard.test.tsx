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
  });

  it('renders a final game correctly', () => {
    const finalGame = {
      ...mockGame,
      gameState: 'FINAL',
      clock: undefined,
    };
    
    render(<GameCard game={finalGame} />);
    expect(screen.getByText('Final · SOG: NJD 25, NYI 28')).toBeInTheDocument();
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
});
