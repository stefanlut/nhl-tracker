// Mock fetch
global.fetch = jest.fn();

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data: unknown, init?: ResponseInit) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      headers: new Map(Object.entries(init?.headers || {}))
    })),
    error: jest.fn(() => ({
      json: () => Promise.resolve({ error: 'Internal Server Error' }),
      status: 500,
      ok: false,
      headers: new Map()
    })),
    redirect: jest.fn((url: string, status = 302) => ({
      status,
      headers: new Map([['Location', url]]),
      ok: false
    }))
  }
}));

// Import the route handler after mocking
import { GET } from '../draft-tracker/route';

describe('/api/draft-tracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns draft data successfully', async () => {
    const mockDraftData = {
      currentDraftDate: "2025-06-27",
      broadcastStartTimeUTC: "2025-06-27T23:00:00Z",
      round: 1,
      state: "liveDay1",
      picks: [
        {
          pickInRound: 1,
          overallPick: 1,
          teamAbbrev: "NYI",
          teamFullName: { default: "New York Islanders" },
          state: "confirmed",
          lastName: { default: "Schaefer" },
          firstName: { default: "Matthew" }
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDraftData)
    });

    const response = await GET();
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      'https://api-web.nhle.com/v1/draft-tracker/picks/now',
      expect.objectContaining({
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NHL-Tracker/1.0)',
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }
      })
    );

    expect(response.status).toBe(200);
    expect(data).toEqual(mockDraftData);
  });

  it('handles NHL API error response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch draft tracker data' });
  });

  it('handles network error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });

  it('uses correct cache settings', async () => {
    const mockDraftData = { picks: [] };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDraftData)
    });

    await GET();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        next: { revalidate: 30 }
      })
    );
  });

  it('includes proper headers', async () => {
    const mockDraftData = { picks: [] };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDraftData)
    });

    await GET();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NHL-Tracker/1.0)',
          'Accept': 'application/json',
        }
      })
    );
  });
});
