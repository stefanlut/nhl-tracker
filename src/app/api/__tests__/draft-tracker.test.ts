import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js APIs that aren't available in test environment
(global as any).Response = class MockResponse {
  constructor(public body: any, public init: any = {}) {}
  
  async json() {
    return JSON.parse(this.body);
  }
  
  get status() {
    return this.init.status || 200;
  }
  
  get ok() {
    return this.status >= 200 && this.status < 300;
  }
  
  get headers() {
    return new Map(Object.entries(this.init.headers || {}));
  }
  
  static json(data: any, init?: any) {
    return new MockResponse(JSON.stringify(data), init);
  }
  
  static error() {
    return new MockResponse('', { status: 500 });
  }
  
  static redirect(url: string, status = 302) {
    return new MockResponse('', { status, headers: { Location: url } });
  }
};

(global as any).Request = class MockRequest {
  constructor(public url: string, public options: any = {}) {}
};

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (data: any, init?: any) => new (global as any).Response(JSON.stringify(data), init)
  }
}));

// Import the route handler after mocking
const { GET } = require('../draft-tracker/route');

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
