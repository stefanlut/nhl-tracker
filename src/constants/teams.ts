// Team codes match the NHL API's expected 3-letter codes
export interface NHLTeam {
  id: number;
  name: string;
  code: string; // 3-letter code used in API calls
  location: string;
  fullName: string; // "{location} {name}"
}

// Teams sorted alphabetically by full name
export const NHL_TEAMS: NHLTeam[] = [
  { id: 24, name: 'Ducks', code: 'ANA', location: 'Anaheim', fullName: 'Anaheim Ducks' },
  { id: 6, name: 'Bruins', code: 'BOS', location: 'Boston', fullName: 'Boston Bruins' },
  { id: 7, name: 'Sabres', code: 'BUF', location: 'Buffalo', fullName: 'Buffalo Sabres' },
  { id: 20, name: 'Flames', code: 'CGY', location: 'Calgary', fullName: 'Calgary Flames' },
  { id: 12, name: 'Hurricanes', code: 'CAR', location: 'Carolina', fullName: 'Carolina Hurricanes' },
  { id: 16, name: 'Blackhawks', code: 'CHI', location: 'Chicago', fullName: 'Chicago Blackhawks' },
  { id: 21, name: 'Avalanche', code: 'COL', location: 'Colorado', fullName: 'Colorado Avalanche' },
  { id: 29, name: 'Blue Jackets', code: 'CBJ', location: 'Columbus', fullName: 'Columbus Blue Jackets' },
  { id: 25, name: 'Stars', code: 'DAL', location: 'Dallas', fullName: 'Dallas Stars' },
  { id: 17, name: 'Red Wings', code: 'DET', location: 'Detroit', fullName: 'Detroit Red Wings' },
  { id: 22, name: 'Oilers', code: 'EDM', location: 'Edmonton', fullName: 'Edmonton Oilers' },
  { id: 13, name: 'Panthers', code: 'FLA', location: 'Florida', fullName: 'Florida Panthers' },
  { id: 26, name: 'Kings', code: 'LAK', location: 'Los Angeles', fullName: 'Los Angeles Kings' },
  { id: 30, name: 'Wild', code: 'MIN', location: 'Minnesota', fullName: 'Minnesota Wild' },
  { id: 8, name: 'Canadiens', code: 'MTL', location: 'Montréal', fullName: 'Montréal Canadiens' },
  { id: 18, name: 'Predators', code: 'NSH', location: 'Nashville', fullName: 'Nashville Predators' },
  { id: 1, name: 'Devils', code: 'NJD', location: 'New Jersey', fullName: 'New Jersey Devils' },
  { id: 2, name: 'Islanders', code: 'NYI', location: 'New York', fullName: 'New York Islanders' },
  { id: 3, name: 'Rangers', code: 'NYR', location: 'New York', fullName: 'New York Rangers' },
  { id: 9, name: 'Senators', code: 'OTT', location: 'Ottawa', fullName: 'Ottawa Senators' },
  { id: 4, name: 'Flyers', code: 'PHI', location: 'Philadelphia', fullName: 'Philadelphia Flyers' },
  { id: 5, name: 'Penguins', code: 'PIT', location: 'Pittsburgh', fullName: 'Pittsburgh Penguins' },
  { id: 28, name: 'Sharks', code: 'SJS', location: 'San Jose', fullName: 'San Jose Sharks' },
  { id: 55, name: 'Kraken', code: 'SEA', location: 'Seattle', fullName: 'Seattle Kraken' },
  { id: 19, name: 'Blues', code: 'STL', location: 'St. Louis', fullName: 'St. Louis Blues' },
  { id: 14, name: 'Lightning', code: 'TBL', location: 'Tampa Bay', fullName: 'Tampa Bay Lightning' },
  { id: 10, name: 'Maple Leafs', code: 'TOR', location: 'Toronto', fullName: 'Toronto Maple Leafs' },
  { id: 53, name: 'Mammoth', code: 'UTA', location: 'Utah', fullName: 'Utah Mammoth' },
  { id: 23, name: 'Canucks', code: 'VAN', location: 'Vancouver', fullName: 'Vancouver Canucks' },
  { id: 54, name: 'Golden Knights', code: 'VGK', location: 'Vegas', fullName: 'Vegas Golden Knights' },
  { id: 15, name: 'Capitals', code: 'WSH', location: 'Washington', fullName: 'Washington Capitals' },
  { id: 52, name: 'Jets', code: 'WPG', location: 'Winnipeg', fullName: 'Winnipeg Jets' }
];

// Helper function to get team info by code
export function getTeamByCode(code: string): NHLTeam | undefined {
  return NHL_TEAMS.find(team => team.code === code);
}

// Helper function to get team info by ID
export function getTeamById(id: number): NHLTeam | undefined {
  return NHL_TEAMS.find(team => team.id === id);
}
