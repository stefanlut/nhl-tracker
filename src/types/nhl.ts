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

// NHL Draft Rankings Types
export interface DraftCategory {
    id: number;
    name: string;
    consumerKey: string;
}

export interface DraftRanking {
    lastName: string;
    firstName: string;
    positionCode: string;
    shootsCatches: string;
    heightInInches: number;
    weightInPounds: number;
    lastAmateurClub: string;
    lastAmateurLeague: string;
    birthDate: string;
    birthCity: string;
    birthStateProvince?: string;
    birthCountry: string;
    midtermRank?: number;
    finalRank: number;
}

export interface DraftRankingsResponse {
    draftYear: number;
    categoryId: number;
    categoryKey: string;
    draftYears: number[];
    categories: DraftCategory[];
    rankings: DraftRanking[];
}

// Player Game Log Types
export interface PlayerGameLogSkaterStats {
    assists: number;
    goals: number;
    points: number;
    plusMinus: number;
    powerPlayGoals: number;
    powerPlayPoints: number;
    shifts: number;
    shorthandedGoals: number;
    shots: number;
    timeOnIce: string;
}

export interface PlayerGameLogGoalieStats {
    decision: string; // "W", "L", "O", or empty
    gamesStarted: number;
    goalsAgainst: number;
    savePctg: number;
    shotsAgainst: number;
    timeOnIce: string;
}

export interface PlayerGameLogGame {
    gameId: number;
    gameDate: string;
    gameTypeId: number;
    homeRoadFlag: "H" | "R";
    opponentAbbrev: string;
    teamAbbrev: string;
    skaterStats?: PlayerGameLogSkaterStats;
    goalieStats?: PlayerGameLogGoalieStats;
}

export interface PlayerGameLogResponse {
    gameLog: PlayerGameLogGame[];
}

// Enhanced game type to include potential roster info
export interface EnhancedNHLGame extends NHLGame {
    awayTeamRoster?: number[]; // Player IDs for away team
    homeTeamRoster?: number[]; // Player IDs for home team
}

// Boxscore Types
export interface BoxscorePlayerStats {
    playerId: number;
    sweaterNumber: number;
    name: {
        default: string;
    };
    position: string;
    goals: number;
    assists: number;
    points: number;
    plusMinus: number;
    pim: number; // penalty minutes
    sog: number; // shots on goal (for skaters, this is 'sog')
    hits: number;
    blockedShots: number;
    powerPlayGoals: number;
    shifts: number;
    faceoffWinningPctg?: number;
    toi: string; // Time on ice formatted as "MM:SS"
    giveaways: number;
    takeaways: number;
    // Goalie specific stats
    decision?: string;
    starter?: boolean;
    goalsAgainst?: number;
    savePctg?: number;
    shotsAgainst?: number;
    saves?: number;
    evenStrengthShotsAgainst?: string;
    powerPlayShotsAgainst?: string;
    shorthandedShotsAgainst?: string;
    evenStrengthGoalsAgainst?: number;
    powerPlayGoalsAgainst?: number;
    shorthandedGoalsAgainst?: number;
}

export interface BoxscoreTeamStats {
    forwards: BoxscorePlayerStats[];
    defense: BoxscorePlayerStats[];
    goalies: BoxscorePlayerStats[];
}

export interface BoxscoreTeam {
    id: number;
    commonName: {
        default: string;
    };
    abbrev: string;
    score: number;
    sog: number; // Shots on goal
    logo: string;
    darkLogo: string;
    placeName: {
        default: string;
    };
    placeNameWithPreposition: {
        default: string;
        fr?: string;
    };
}

export interface BoxscoreResponse {
    id: number;
    season: number;
    gameType: number;
    limitedScoring: boolean;
    gameDate: string;
    venue: {
        default: string;
    };
    venueLocation: {
        default: string;
    };
    startTimeUTC: string;
    easternUTCOffset: string;
    venueUTCOffset: string;
    gameState: string;
    gameScheduleState: string;
    periodDescriptor: {
        number: number;
        periodType: string;
        maxRegulationPeriods: number;
    };
    regPeriods: number;
    awayTeam: BoxscoreTeam;
    homeTeam: BoxscoreTeam;
    clock: {
        timeRemaining: string;
        secondsRemaining: number;
        running: boolean;
        inIntermission: boolean;
    };
    playerByGameStats: {
        awayTeam: BoxscoreTeamStats;
        homeTeam: BoxscoreTeamStats;
    };
    gameOutcome?: {
        lastPeriodType: string;
    };
    summary?: Record<string, unknown>;
}
