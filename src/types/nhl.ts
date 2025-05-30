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
        sog?: number;  // Shots on goal
    };
    homeTeam: {
        id: number;
        placeName: {
            default: string;
        };
        score: number;
        sog?: number;  // Shots on goal
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
    seriesStatus?: {
        round: number;
        seriesAbbrev: string;
        seriesTitle: string;
        seriesLetter: string;
        neededToWin: number;
        topSeedTeamAbbrev: string;
        topSeedWins: number;
        bottomSeedTeamAbbrev: string;
        bottomSeedWins: number;
        gameNumberOfSeries: number;
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

// Team Roster Types
export interface NHLPlayer {
    id: number;
    headshot: string;
    firstName: {
        default: string;
    };
    lastName: {
        default: string;
    };
    sweaterNumber: number;
    positionCode: string;
    shootsCatches: string;
    heightInInches: number;
    weightInPounds: number;
    birthDate: string;
    birthCity: {
        default: string;
    };
    birthCountry: string;
    birthStateProvince?: {
        default: string;
    };
    age: number;
}

export interface NHLRoster {
    forwards: NHLPlayer[];
    defensemen: NHLPlayer[];
    goalies: NHLPlayer[];
}

// Team Stats Types
export interface NHLTeamStats {
    gamesPlayed: number;
    wins: number;
    losses: number;
    otLosses: number;
    points: number;
    pointPct: number;
    goalsFor: number;
    goalsAgainst: number;
    goalsForPerGame: number;
    goalsAgainstPerGame: number;
    ppPct: number;
    pkPct: number;
    shotsForPerGame: number;
    shotsAgainstPerGame: number;
    faceoffWinPct: number;
    pointsRank: number;
    goalsForRank: number;
    goalsAgainstRank: number;
    ppPctRank: number;
    pkPctRank: number;
    shotsPerGame: number;
    faceoffWinPctRank: number;
    powerPlayPct: number;
    penaltyKillPct: number;
}

// Player Stats Types
export interface SkaterStats {
    position: string;
    gamesPlayed: number;
    goals: number;
    assists: number;
    points: number;
    plusMinus: number;
    penaltyMinutes: number;
    ppGoals: number;
    ppPoints: number;
    shGoals: number;
    gameWinningGoals: number;
    shots: number;
    shootingPctg: number;
    timeOnIcePerGame: string;
}

export interface GoalieStats {
    gamesPlayed: number;
    gamesStarted: number;
    wins: number;
    losses: number;
    ties: number;
    otLosses: number;
    shotsAgainst: number;
    goalsAgainst: number;
    goalsAgainstAverage: number;
    savePctg: number;
    shutouts: number;
    timeOnIce: string;
}

export interface NHLPlayerStats {
    playerId: number;
    skaterData?: SkaterStats;
    goalieData?: GoalieStats;
}
