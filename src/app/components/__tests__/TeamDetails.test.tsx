import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import TeamDetails from '../TeamDetails';

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

const mockTeamStats = {
  gamesPlayed: 20,
  wins: 12,
  losses: 6,
  otLosses: 2,
  points: 26,
  pointPctg: 0.650,
  goalsFor: 65,
  goalsAgainst: 58,
  goalDifferential: 7
};

const mockRoster = [
  {
    id: 1,
    headshot: 'https://example.com/player1.jpg',
    firstName: { default: 'Connor' },
    lastName: { default: 'McDavid' },
    sweaterNumber: 97,
    positionCode: 'C',
    shootsCatches: 'L',
    heightInInches: 73,
    weightInPounds: 193
  },
  {
    id: 2,
    headshot: 'https://example.com/player2.jpg',
    firstName: { default: 'Leon' },
    lastName: { default: 'Draisaitl' },
    sweaterNumber: 29,
    positionCode: 'C',
    shootsCatches: 'L',
    heightInInches: 74,
    weightInPounds: 208
  }
];

const mockPlayerStats = [
  {
    playerId: 1,
    skaterFullName: 'Connor McDavid',
    gamesPlayed: 20,
    goals: 15,
    assists: 25,
    points: 40,
    plusMinus: 8,
    penaltyMinutes: 10,
    powerPlayGoals: 5,
    shorthandedGoals: 1,
    gameWinningGoals: 3,
    shots: 80,
    shootingPctg: 18.75,
    avgTimeOnIce: '21:30'
  }
];

// Helper component to wrap with SWR provider for testing
const TestWrapper = ({ children, teamCode = 'EDM' }: { 
  children: React.ReactNode; 
  teamCode?: string;
}) => {
  const mockFetcher = (url: string) => {
    if (url.includes('/stats')) {
      return Promise.resolve(mockTeamStats);
    } else if (url.includes('/roster')) {
      return Promise.resolve(mockRoster);
    } else if (url.includes('/player-stats')) {
      return Promise.resolve(mockPlayerStats);
    }
    return Promise.resolve({});
  };

  return (
    <SWRConfig value={{ 
      fetcher: mockFetcher,
      dedupingInterval: 0,
      provider: () => new Map()
    }}>
      {children}
    </SWRConfig>
  );
};

describe.skip('TeamDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders team information correctly', async () => {
    render(
      <TestWrapper>
        <TeamDetails teamCode="EDM" view="roster" />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Edmonton Oilers')).toBeInTheDocument();
    });
  });

  it('displays team stats correctly', async () => {
    render(
      <TestWrapper>
        <TeamDetails teamCode="EDM" view="roster" />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument(); // Games played
      expect(screen.getByText('12-6-2')).toBeInTheDocument(); // Record
      expect(screen.getByText('26')).toBeInTheDocument(); // Points
      expect(screen.getByText('65.0%')).toBeInTheDocument(); // Point percentage
      expect(screen.getByText('65')).toBeInTheDocument(); // Goals for
      expect(screen.getByText('58')).toBeInTheDocument(); // Goals against
      expect(screen.getByText('+7')).toBeInTheDocument(); // Goal differential
    });
  });

  it('switches between roster and stats views', async () => {
    render(
      <TestWrapper>
        <TeamDetails teamCode="EDM" view="roster" />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Roster')).toBeInTheDocument();
      expect(screen.getByText('Player Stats')).toBeInTheDocument();
    });

    // Should show roster by default
    await waitFor(() => {
      expect(screen.getByText('Connor McDavid')).toBeInTheDocument();
      expect(screen.getByText('Leon Draisaitl')).toBeInTheDocument();
    });

    // Click on Player Stats tab
    fireEvent.click(screen.getByText('Player Stats'));
    
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // Goals
      expect(screen.getByText('25')).toBeInTheDocument(); // Assists
      expect(screen.getByText('40')).toBeInTheDocument(); // Points
    });
  });

  it('displays roster information correctly', async () => {
    render(
      <TestWrapper>
        <TeamDetails teamCode="EDM" view="roster" />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('#97')).toBeInTheDocument();
      expect(screen.getByText('#29')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument(); // Position
      expect(screen.getByText('6\'1"')).toBeInTheDocument(); // Height
      expect(screen.getByText('193 lbs')).toBeInTheDocument(); // Weight
    });
  });

  it('displays player stats correctly', async () => {
    render(
      <TestWrapper>
        <TeamDetails teamCode="EDM" view="stats" />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Connor McDavid')).toBeInTheDocument();
      expect(screen.getByText('18.8%')).toBeInTheDocument(); // Shooting percentage
      expect(screen.getByText('21:30')).toBeInTheDocument(); // Time on ice
      expect(screen.getByText('+8')).toBeInTheDocument(); // Plus minus
    });
  });

  it('handles loading states', () => {
    render(
      <TestWrapper>
        <TeamDetails teamCode="EDM" view="roster" />
      </TestWrapper>
    );
    
    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles error states', async () => {
    const ErrorWrapper = ({ children }: { children: React.ReactNode }) => {
      const errorFetcher = () => Promise.reject(new Error('Failed to fetch'));

      return (
        <SWRConfig value={{ 
          fetcher: errorFetcher,
          dedupingInterval: 0,
          provider: () => new Map()
        }}>
          {children}
        </SWRConfig>
      );
    };

    render(
      <ErrorWrapper>
        <TeamDetails teamCode="EDM" view="roster" />
      </ErrorWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error loading team data')).toBeInTheDocument();
    });
  });

  it('sorts players correctly', async () => {
    const mockRosterWithMultiplePositions = [
      ...mockRoster,
      {
        id: 3,
        headshot: 'https://example.com/player3.jpg',
        firstName: { default: 'Darnell' },
        lastName: { default: 'Nurse' },
        sweaterNumber: 25,
        positionCode: 'D',
        shootsCatches: 'L',
        heightInInches: 76,
        weightInPounds: 221
      },
      {
        id: 4,
        headshot: 'https://example.com/player4.jpg',
        firstName: { default: 'Stuart' },
        lastName: { default: 'Skinner' },
        sweaterNumber: 74,
        positionCode: 'G',
        shootsCatches: 'L',
        heightInInches: 76,
        weightInPounds: 206
      }
    ];

    const CustomWrapper = ({ children }: { children: React.ReactNode }) => {
      const mockFetcher = (url: string) => {
        if (url.includes('/roster')) {
          return Promise.resolve(mockRosterWithMultiplePositions);
        }
        return Promise.resolve(mockTeamStats);
      };

      return (
        <SWRConfig value={{ 
          fetcher: mockFetcher,
          dedupingInterval: 0,
          provider: () => new Map()
        }}>
          {children}
        </SWRConfig>
      );
    };

    render(
      <CustomWrapper>
        <TeamDetails teamCode="EDM" view="roster" />
      </CustomWrapper>
    );
    
    await waitFor(() => {
      // Should show players grouped by position
      expect(screen.getByText('Centers')).toBeInTheDocument();
      expect(screen.getByText('Defense')).toBeInTheDocument();
      expect(screen.getByText('Goalies')).toBeInTheDocument();
    });
  });
});
