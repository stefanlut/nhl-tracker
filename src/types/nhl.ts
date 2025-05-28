export interface NHLGame {
    id: number;
    season: number;
    gameType: number;
    gameDate: string;
    venue: {
        default: string;
    };
    startTimeUTC: string;
    awayTeam: {
        id: number;
        placeName: {
            default: string;
        };
        score: number;
    };
    homeTeam: {
        id: number;
        placeName: {
            default: string;
        };
        score: number;
    };
    gameState: string;
    gameScheduleState: string;
    periodDescriptor?: {
        number: number;
        periodType: 'REG' | 'OT' | 'SO';
    };
    clock?: {
        timeRemaining: string;
        running: boolean;
    };
}

export interface NHLScheduleResponse {
    nextStartDate: string;
    previousStartDate: string;
    gameWeek: {
        date: string;
        games: NHLGame[];
    }[];
}
