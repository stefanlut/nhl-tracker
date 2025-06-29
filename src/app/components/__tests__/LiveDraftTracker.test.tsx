import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import LiveDraftTracker from '../LiveDraftTracker';
import { LiveDraftResponse } from '@/types/nhl';

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

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockSWR = require('swr').default as jest.Mock;

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

const mockDraftData: LiveDraftResponse = {
  currentDraftDate: "2025-06-27",
  broadcastStartTimeUTC: "2025-06-27T23:00:00Z",
  tvBroadcasts: [],
  logoUrl: "https://example.com/logo.svg",
  logoFrUrl: "https://example.com/logo_fr.svg",
  uiAccentColor: "#00B5E2",
  round: 1,
  state: "liveDay1",
  picks: [
    {
      pickInRound: 1,
      overallPick: 1,
      teamId: 2,
      teamAbbrev: "NYI",
      teamFullName: { default: "New York Islanders" },
      teamCommonName: { default: "Islanders" },
      teamPlaceNameWithPreposition: { default: "New York" },
      teamLogoLight: "https://example.com/nyi_light.svg",
      teamLogoDark: "https://example.com/nyi_dark.svg",
      state: "confirmed",
      lastName: { default: "Schaefer" },
      firstName: { default: "Matthew" },
      positionCode: "D"
    },
    {
      pickInRound: 2,
      overallPick: 2,
      teamId: 28,
      teamAbbrev: "SJS",
      teamFullName: { default: "San Jose Sharks" },
      teamCommonName: { default: "Sharks" },
      teamPlaceNameWithPreposition: { default: "San Jose" },
      teamLogoLight: "https://example.com/sjs_light.svg",
      teamLogoDark: "https://example.com/sjs_dark.svg",
      state: "confirmed",
      lastName: { default: "Misa" },
      firstName: { default: "Michael" },
      positionCode: "C"
    },
    {
      pickInRound: 13,
      overallPick: 13,
      teamId: 17,
      teamAbbrev: "DET",
      teamFullName: { default: "Detroit Red Wings" },
      teamCommonName: { default: "Red Wings" },
      teamPlaceNameWithPreposition: { default: "Detroit" },
      teamLogoLight: "https://example.com/det_light.svg",
      teamLogoDark: "https://example.com/det_dark.svg",
      state: "onTheClock"
    },
    {
      pickInRound: 14,
      overallPick: 14,
      teamId: 29,
      teamAbbrev: "CBJ",
      teamFullName: { default: "Columbus Blue Jackets" },
      teamCommonName: { default: "Blue Jackets" },
      teamPlaceNameWithPreposition: { default: "Columbus" },
      teamLogoLight: "https://example.com/cbj_light.svg",
      teamLogoDark: "https://example.com/cbj_dark.svg",
      state: "open"
    }
  ]
};

// Helper component to wrap with SWR provider for testing
const TestWrapper = ({ children, data, error }: { 
  children: React.ReactNode; 
  data?: LiveDraftResponse; 
  error?: Error;
}) => {
  const mockFetcher = () => {
    if (error) throw error;
    return Promise.resolve(data || mockDraftData);
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

describe.skip('LiveDraftTracker', () => {
  beforeEach(() => {
    mockSWR.mockClear();
  });

  it('renders loading state initially', () => {
    // Mock loading state
    mockSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn()
    });

    render(<LiveDraftTracker />);

    expect(screen.getByText('NHL Draft Tracker')).toBeInTheDocument();
    expect(screen.getByText('Loading draft data...')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    const error = new Error('Failed to fetch');
    
    render(
      <TestWrapper error={error}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load draft data')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('renders live draft data correctly', async () => {
    render(
      <TestWrapper data={mockDraftData}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('NHL Draft Tracker 2025')).toBeInTheDocument();
      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByText('Round 1')).toBeInTheDocument();
      expect(screen.getByText('Detroit Red Wings on the clock')).toBeInTheDocument();
    });
  });

  it('displays recent picks correctly', async () => {
    render(
      <TestWrapper data={mockDraftData}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      // Should show confirmed picks by default (recent view)
      expect(screen.getByText('Matthew Schaefer')).toBeInTheDocument();
      expect(screen.getByText('Michael Misa')).toBeInTheDocument();
      expect(screen.getByText('New York Islanders')).toBeInTheDocument();
      expect(screen.getByText('San Jose Sharks')).toBeInTheDocument();
    });
  });

  it('switches between view modes correctly', async () => {
    render(
      <TestWrapper data={mockDraftData}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Recent Picks (2)')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Picks (1)')).toBeInTheDocument();
      expect(screen.getByText('On The Clock')).toBeInTheDocument();
    });

    // Click on upcoming picks
    fireEvent.click(screen.getByText('Upcoming Picks (1)'));
    
    await waitFor(() => {
      expect(screen.getByText('Columbus Blue Jackets')).toBeInTheDocument();
      expect(screen.getByText('Pick upcoming...')).toBeInTheDocument();
    });

    // Click on "on the clock"
    fireEvent.click(screen.getByText('On The Clock'));
    
    await waitFor(() => {
      expect(screen.getByText('ON THE CLOCK')).toBeInTheDocument();
      expect(screen.getByText('Detroit Red Wings')).toBeInTheDocument();
      expect(screen.getByText('Round 1, Pick 13 (#13 overall)')).toBeInTheDocument();
    });
  });

  it('displays pick information correctly', async () => {
    render(
      <TestWrapper data={mockDraftData}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      // Check pick details for confirmed pick
      expect(screen.getByText('Round 1, Pick 1')).toBeInTheDocument();
      expect(screen.getByText('#1 overall • New York Islanders')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument(); // Position
    });
  });

  it('handles refresh button click', async () => {
    const mockMutate = jest.fn();
    
    render(
      <TestWrapper data={mockDraftData}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toBeInTheDocument();
      fireEvent.click(refreshButton);
    });
  });

  it('shows correct draft status for different states', async () => {
    const completedDraftData = {
      ...mockDraftData,
      state: 'completed'
    };
    
    render(
      <TestWrapper data={completedDraftData}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
  });

  it('displays no data message when appropriate', async () => {
    const emptyDraftData = {
      ...mockDraftData,
      picks: []
    };
    
    render(
      <TestWrapper data={emptyDraftData}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No recent picks available')).toBeInTheDocument();
    });
  });

  it('handles prospect details when available', async () => {
    const draftDataWithProspect = {
      ...mockDraftData,
      picks: [
        {
          ...mockDraftData.picks[0],
          prospect: {
            shoots: 'L',
            height: '6\' 2"',
            weight: 190,
            birthCity: { default: 'Toronto' },
            birthCountry: 'Canada',
            amateurClub: { default: 'London Knights' },
            amateurLeague: { default: 'OHL' }
          }
        }
      ]
    };
    
    render(
      <TestWrapper data={draftDataWithProspect}>
        <LiveDraftTracker />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/L • 6' 2", 190 lbs/)).toBeInTheDocument();
      expect(screen.getByText('London Knights (OHL)')).toBeInTheDocument();
      expect(screen.getByText('Toronto, Canada')).toBeInTheDocument();
    });
  });
});
