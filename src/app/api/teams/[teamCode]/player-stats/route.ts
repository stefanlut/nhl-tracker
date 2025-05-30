import { NextRequest, NextResponse } from 'next/server';

// Define the route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SkaterStats {
  playerId: number;
  headshot: string;
  firstName: { default: string };
  lastName: { default: string };
  positionCode: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
  powerPlayGoals: number;
  shorthandedGoals: number;
  gameWinningGoals: number;
  overtimeGoals: number;
  shots: number;
  shootingPctg: number;
  avgTimeOnIcePerGame: number;
  avgShiftsPerGame: number;
  faceoffWinPctg: number;
}

interface GoalieStats {
  playerId: number;
  headshot: string;
  firstName: { default: string };
  lastName: { default: string };
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  goalsAgainstAverage: number;
  savePercentage: number;
  shotsAgainst: number;
  saves: number;
  goalsAgainst: number;
  shutouts: number;
  timeOnIce: number;
}

interface PlayerStatsResponse {
  season: string;
  gameType: number;
  skaters: SkaterStats[];
  goalies: GoalieStats[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamCode: string }> }
) {
  const { teamCode } = await params;
  const season = "20242025"; // Current season
  const searchParams = new URL(request.url).searchParams;
  const isPlayoffs = searchParams.get('playoffs') === 'true';
  const gameType = isPlayoffs ? "3" : "2"; // 2 for regular season, 3 for playoffs
  const baseURL = "https://api-web.nhle.com";
  
  if (!teamCode || typeof teamCode !== 'string' || teamCode.length !== 3) {
    return NextResponse.json(
      { error: 'Invalid team code. Must be a 3-letter code.' },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(`${baseURL}/v1/club-stats/${teamCode}/${season}/${gameType}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ playerStats: [] }, {
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
      }
      
      throw new Error(`Failed to fetch player stats for team ${teamCode} with status: ${response.status}`);
    }

    const data = await response.json() as PlayerStatsResponse;
    
    interface PlayerSeasonStats {
      playerId: number;
      skaterData?: {
        position: string;
        gamesPlayed: number;
        goals: number;
        assists: number;
        points: number;
        plusMinus: number;
        penaltyMinutes: number;
        ppGoals: number;
        shGoals: number;
        gameWinningGoals: number;
        shots: number;
        shootingPctg: number;
        timeOnIcePerGame: string;
      };
      goalieData?: {
        gamesPlayed: number;
        gamesStarted: number;
        wins: number;
        losses: number;
        otLosses: number;
        shotsAgainst: number;
        goalsAgainst: number;
        goalsAgainstAverage: number;
        savePctg: number;
        shutouts: number;
        timeOnIce: string;
      };
    }

    // Transform the data into the format expected by the frontend
    const playerBySeasonId: { [key: string]: PlayerSeasonStats } = {};
    
    // Process skaters
    for (const skater of data.skaters) {
      playerBySeasonId[skater.playerId] = {
        playerId: skater.playerId,
        skaterData: {
          position: skater.positionCode,
          gamesPlayed: skater.gamesPlayed,
          goals: skater.goals,
          assists: skater.assists,
          points: skater.points,
          plusMinus: skater.plusMinus,
          penaltyMinutes: skater.penaltyMinutes,
          ppGoals: skater.powerPlayGoals,
          shGoals: skater.shorthandedGoals,
          gameWinningGoals: skater.gameWinningGoals,
          shots: skater.shots,
          shootingPctg: skater.shootingPctg,
          timeOnIcePerGame: Math.floor(skater.avgTimeOnIcePerGame / 60).toString().padStart(2, '0') + ':' + 
                          (skater.avgTimeOnIcePerGame % 60).toString().padStart(2, '0')
        }
      };
    }
    
    // Process goalies
    for (const goalie of data.goalies) {
      playerBySeasonId[goalie.playerId] = {
        playerId: goalie.playerId,
        goalieData: {
          gamesPlayed: goalie.gamesPlayed,
          gamesStarted: goalie.gamesStarted,
          wins: goalie.wins,
          losses: goalie.losses,
          otLosses: goalie.overtimeLosses,
          shotsAgainst: goalie.shotsAgainst,
          goalsAgainst: goalie.goalsAgainst,
          goalsAgainstAverage: goalie.goalsAgainstAverage,
          savePctg: goalie.savePercentage,
          shutouts: goalie.shutouts,
          timeOnIce: Math.floor(goalie.timeOnIce / 60).toString().padStart(2, '0') + ':' + 
                    (goalie.timeOnIce % 60).toString().padStart(2, '0')
        }
      };
    }

    return NextResponse.json({ 
      playerStats: { playerBySeasonId } 
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error(`Error fetching player stats for team ${teamCode}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch player stats for team ${teamCode}`, playerStats: [] },
      { status: 500 }
    );
  }
}
