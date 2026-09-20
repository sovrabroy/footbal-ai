import { Match, League, Team, PredictionResult, PredictionModelWeights, StandingRow, TopScorer } from '@/types/football';
import {
  INITIAL_MATCHES,
  LEAGUES,
  TEAMS,
  HISTORICAL_PREDICTION_RESULTS,
  STANDINGS_DATA,
  TOP_SCORERS,
  getH2H,
  createInitialMatches,
} from '@/data/mockFootballData';
import { calculateMatchPrediction } from '@/services/predictionService';
import { getStoredWeights } from '@/lib/predictionConfig';
import { getTodayDateString, isMatchToday } from '@/lib/dateUtils';

// In-memory / Session state manager
class FootballDataStore {
  private matches: Match[] = [];
  private leagues: League[] = [];
  private teams: Record<string, Team> = {};
  private results: PredictionResult[] = [];
  private initialized = false;

  private init() {
    if (this.initialized) return;

    this.matches = createInitialMatches();
    this.results = [...HISTORICAL_PREDICTION_RESULTS];
    this.leagues = [...LEAGUES];
    Object.values(TEAMS).forEach((t) => {
      this.teams[t.id] = t;
    });

    this.initialized = true;
  }

  public loadStoredData(): { matches?: Match[]; results?: PredictionResult[] } {
    this.init();
    if (typeof window === 'undefined') return {};

    try {
      const localMatches = localStorage.getItem('goalpredict_matches');
      const lastSyncDate = localStorage.getItem('goalpredict_sync_date');
      const todayStr = getTodayDateString();

      let loadedMatches: Match[] | undefined;
      if (localMatches && lastSyncDate === todayStr) {
        const parsed = JSON.parse(localMatches);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((m: Match) => isMatchToday(m.date))) {
          this.matches = parsed;
          loadedMatches = parsed;
        }
      }

      const localResults = localStorage.getItem('goalpredict_results');
      let loadedResults: PredictionResult[] | undefined;
      if (localResults) {
        const parsedResults = JSON.parse(localResults);
        if (Array.isArray(parsedResults) && parsedResults.length > 0) {
          this.results = parsedResults;
          loadedResults = parsedResults;
        }
      }

      return { matches: loadedMatches, results: loadedResults };
    } catch {
      return {};
    }
  }

  public setMatches(matches: Match[]) {
    this.init();
    this.matches = [...matches];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('goalpredict_matches', JSON.stringify(matches));
        localStorage.setItem('goalpredict_sync_date', getTodayDateString());
      } catch (e) {
        console.warn('Could not persist matches to localStorage:', e);
      }
    }
  }

  public async getMatches(): Promise<Match[]> {
    this.init();
    return [...this.matches];
  }

  public getMatchesSync(): Match[] {
    this.init();
    return [...this.matches];
  }

  public async getMatchById(id: string): Promise<Match | undefined> {
    this.init();
    return this.matches.find((m) => m.id === id);
  }

  public async getLeagues(): Promise<League[]> {
    this.init();
    return [...this.leagues];
  }

  public async getTeams(): Promise<Team[]> {
    this.init();
    return Object.values(this.teams);
  }

  public async getStandings(leagueId: string): Promise<StandingRow[]> {
    this.init();
    return STANDINGS_DATA[leagueId] || STANDINGS_DATA['epl'] || [];
  }

  public getStandingsSync(leagueId: string): StandingRow[] {
    this.init();
    return STANDINGS_DATA[leagueId] || STANDINGS_DATA['epl'] || [];
  }

  public async getTopScorers(leagueId: string): Promise<TopScorer[]> {
    this.init();
    return TOP_SCORERS[leagueId] || TOP_SCORERS['epl'] || [];
  }

  public getTopScorersSync(leagueId: string): TopScorer[] {
    this.init();
    return TOP_SCORERS[leagueId] || TOP_SCORERS['epl'] || [];
  }

  public async getHistoricalResults(): Promise<PredictionResult[]> {
    this.init();
    return [...this.results];
  }

  public getHistoricalResultsSync(): PredictionResult[] {
    this.init();
    return [...this.results];
  }

  public async recalculateAllPredictions(customWeights?: PredictionModelWeights): Promise<Match[]> {
    this.init();
    const weights = customWeights || getStoredWeights();
    this.matches = this.matches.map((m) => {
      const recalculated = calculateMatchPrediction(m.id, m.homeTeam, m.awayTeam, undefined, weights);
      return {
        ...m,
        prediction: recalculated,
        isHotPick: recalculated.confidence >= 66 || (m.homeTeam.leaguePosition <= 4 && m.awayTeam.leaguePosition <= 4),
        isFeatured: recalculated.confidence >= 70,
      };
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('goalpredict_matches', JSON.stringify(this.matches));
      } catch (e) {
        console.warn('Failed to update local storage matches:', e);
      }
    }
    return [...this.matches];
  }

  public async addMatch(match: Match): Promise<Match> {
    this.init();
    this.matches.unshift(match);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('goalpredict_matches', JSON.stringify(this.matches));
      } catch (e) {
        console.warn('Failed to save added match to localStorage:', e);
      }
    }
    return match;
  }

  public async updateMatch(match: Match): Promise<Match> {
    this.init();
    this.matches = this.matches.map((m) => (m.id === match.id ? match : m));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('goalpredict_matches', JSON.stringify(this.matches));
      } catch (e) {
        console.warn('Failed to save updated match to localStorage:', e);
      }
    }
    return match;
  }

  public async deleteMatch(id: string): Promise<boolean> {
    this.init();
    this.matches = this.matches.filter((m) => m.id !== id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('goalpredict_matches', JSON.stringify(this.matches));
      } catch (e) {
        console.warn('Failed to save deleted match to localStorage:', e);
      }
    }
    return true;
  }

  public async addResult(result: PredictionResult): Promise<void> {
    this.init();
    this.results.unshift(result);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('goalpredict_results', JSON.stringify(this.results));
      } catch (e) {
        console.warn('Failed to save result to localStorage:', e);
      }
    }
  }

  public async resetData(): Promise<void> {
    this.matches = createInitialMatches();
    this.results = [...HISTORICAL_PREDICTION_RESULTS];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('goalpredict_matches');
        localStorage.removeItem('goalpredict_results');
        localStorage.removeItem('goalpredict_sync_date');
      } catch (e) {
        console.warn('Failed to reset localStorage data:', e);
      }
    }
  }

  public async resetToDefaults(): Promise<void> {
    return this.resetData();
  }
}

export const footballDataStore = new FootballDataStore();

class FootballApiService {
  public async fetchMatches(date?: string): Promise<{
    matches: Match[];
    source: 'api-football' | 'baseline';
    total: number;
  }> {
    if (typeof window !== 'undefined') {
      try {
        const queryDate = date || getTodayDateString();
        // Call our server-side API route (which talks to API-Football securely)
        const res = await fetch(`/api/football/fixtures?date=${queryDate}`).catch(() =>
          fetch(`/api/fixtures?date=${queryDate}`)
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.matches) && json.matches.length > 0) {
            footballDataStore.setMatches(json.matches);
            return {
              matches: json.matches,
              source: json.source || 'baseline',
              total: json.total || json.matches.length,
            };
          }
        }
      } catch (err) {
        console.warn('Failed to fetch from server-side fixtures API, falling back to local store:', err);
      }
    }
    const fallback = await footballDataStore.getMatches();
    return { matches: fallback, source: 'baseline', total: fallback.length };
  }

  public async fetchMatchById(id: string): Promise<Match | undefined> {
    return footballDataStore.getMatchById(id);
  }

  public async fetchLeagues(): Promise<League[]> {
    return footballDataStore.getLeagues();
  }

  public async fetchTeams(): Promise<Team[]> {
    return footballDataStore.getTeams();
  }

  public async fetchHistoricalResults(): Promise<PredictionResult[]> {
    return footballDataStore.getHistoricalResults();
  }

  public async getMatches(date?: string): Promise<Match[]> {
    const result = await this.fetchMatches(date);
    return result.matches;
  }

  public async getPredictionResults(): Promise<PredictionResult[]> {
    return this.fetchHistoricalResults();
  }

  public getProviderInfo(): { provider: string; hasApiKey: boolean; baseUrl: string } {
    return {
      provider: 'api-football',
      hasApiKey: false,
      baseUrl: 'https://v3.football.api-sports.io',
    };
  }
}

export const footballApiService = new FootballApiService();
