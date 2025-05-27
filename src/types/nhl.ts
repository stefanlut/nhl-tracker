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
}

export interface NHLScheduleResponse {
    nextStartDate: string;
    previousStartDate: string;
    gameWeek: {
        date: string;
        games: NHLGame[];
    }[];
}
