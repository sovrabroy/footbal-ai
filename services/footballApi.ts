import { Match, League, Team, PredictionResult, PredictionModelWeights, StandingRow, TopScorer } from '@/types/football';
import {
  LEAGUES,
  TEAMS,
  HISTORICAL_PREDICTION_RESULTS,
  STANDINGS_DATA,
  TOP_SCORERS,
  createInitialMatches,
} from '@/data/mockFootballData';
import { calculateMatchPrediction } from '@/services/predictionService';
import { getStoredWeights } from '@/lib/predictionConfig';
import { getTodayDateString } from '@/lib/dateUtils';

// In-memory / Session state manager with durable localStorage persistence
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
      const demoCleared = localStorage.getItem('goalpredict_demo_cleared') === 'true';
      const localMatches = localStorage.getItem('goalpredict_matches');

      let loadedMatches: Match[] | undefined;
      if (localMatches) {
        try {
          const parsed = JSON.parse(localMatches);
          if (Array.isArray(parsed)) {
            this.matches = parsed;
            loadedMatches = parsed;
          }
        } catch {
          // ignore
        }
      } else if (demoCleared) {
        // User explicitly cleared all demo fixtures
        this.matches = [];
        loadedMatches = [];
      }

      const localResults = localStorage.getItem('goalpredict_results');
      let loadedResults: PredictionResult[] | undefined;
      if (localResults) {
        try {
          const parsedResults = JSON.parse(localResults);
          if (Array.isArray(parsedResults) && parsedResults.length > 0) {
            this.results = parsedResults;
            loadedResults = parsedResults;
          }
        } catch {
          // ignore
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
        if (matches.length > 0) {
          localStorage.removeItem('goalpredict_demo_cleared');
        }
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
        localStorage.removeItem('goalpredict_demo_cleared');
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
        if (this.matches.length === 0) {
          localStorage.setItem('goalpredict_demo_cleared', 'true');
        }
      } catch (e) {
        console.warn('Failed to save deleted match to localStorage:', e);
      }
    }
    return true;
  }

  public async clearAllMatches(): Promise<void> {
    this.init();
    this.matches = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('goalpredict_matches', JSON.stringify([]));
        localStorage.setItem('goalpredict_demo_cleared', 'true');
        localStorage.removeItem('goalpredict_sync_date');
      } catch (e) {
        console.warn('Failed to clear matches in localStorage:', e);
      }
    }
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

  public async resetToDefaults(): Promise<Match[]> {
    this.matches = createInitialMatches();
    this.results = [...HISTORICAL_PREDICTION_RESULTS];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('goalpredict_matches');
        localStorage.removeItem('goalpredict_results');
        localStorage.removeItem('goalpredict_sync_date');
        localStorage.removeItem('goalpredict_demo_cleared');
      } catch (e) {
        console.warn('Failed to reset localStorage data:', e);
      }
    }
    return [...this.matches];
  }
}

export const footballDataStore = new FootballDataStore();

class FootballApiService {
  public getStoredCredentials(): { provider: string; apiKey: string; baseUrl: string } {
    if (typeof window === 'undefined') {
      return {
        provider: 'api-football',
        apiKey: '',
        baseUrl: 'https://v3.football.api-sports.io',
      };
    }

    const provider = localStorage.getItem('goalpredict_api_provider') || 'api-football';
    const apiKey = localStorage.getItem('goalpredict_api_key') || '';
    const baseUrl = localStorage.getItem('goalpredict_api_base_url') || 
      (provider === 'football-data' ? 'https://api.football-data.org/v4' : 'https://v3.football.api-sports.io');

    return { provider, apiKey, baseUrl };
  }

  public saveCredentials(provider: string, apiKey: string, baseUrl?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('goalpredict_api_provider', provider);
    localStorage.setItem('goalpredict_api_key', apiKey.trim());
    if (baseUrl) {
      localStorage.setItem('goalpredict_api_base_url', baseUrl.trim());
    }
  }

  public async syncLiveFixtures(options: {
    date?: string;
    apiKey?: string;
    provider?: string;
    mode?: 'live' | 'auto';
  } = {}): Promise<{
    success: boolean;
    matches: Match[];
    source: string;
    total: number;
    error?: string;
    message?: string;
  }> {
    const creds = this.getStoredCredentials();
    const effectiveKey = options.apiKey !== undefined ? options.apiKey : creds.apiKey;
    const effectiveProvider = options.provider || creds.provider || 'api-football';
    const queryDate = options.date || getTodayDateString();
    const mode = options.mode || 'live';

    try {
      const headers: Record<string, string> = {};
      if (effectiveKey) {
        headers['x-football-api-key'] = effectiveKey;
      }
      headers['x-football-provider'] = effectiveProvider;

      const url = `/api/football/fixtures?date=${queryDate}&mode=${mode}&provider=${effectiveProvider}`;
      const res = await fetch(url, { headers });
      const json = await res.json();

      if (json.success && Array.isArray(json.matches)) {
        if (json.matches.length > 0) {
          footballDataStore.setMatches(json.matches);
        }
        return {
          success: true,
          matches: json.matches,
          source: json.source || effectiveProvider,
          total: json.total || json.matches.length,
          message: json.message,
        };
      } else {
        return {
          success: false,
          matches: [],
          source: 'error',
          total: 0,
          error: json.error || 'Failed to fetch live matches from football API',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        matches: [],
        source: 'error',
        total: 0,
        error: err?.message || 'Network error connecting to fixtures API',
      };
    }
  }

  public async fetchMatches(date?: string): Promise<{
    matches: Match[];
    source: 'api-football' | 'football-data' | 'baseline' | 'custom';
    total: number;
  }> {
    if (typeof window !== 'undefined') {
      const demoCleared = localStorage.getItem('goalpredict_demo_cleared') === 'true';
      const creds = this.getStoredCredentials();

      // If user has saved a key, try live sync first
      if (creds.apiKey) {
        const syncResult = await this.syncLiveFixtures({ date, apiKey: creds.apiKey, provider: creds.provider, mode: 'auto' });
        if (syncResult.success && syncResult.matches.length > 0) {
          return {
            matches: syncResult.matches,
            source: syncResult.source as any,
            total: syncResult.total,
          };
        }
      }

      // If demo was explicitly cleared, return what is in store (may be empty or user added)
      if (demoCleared) {
        const currentMatches = await footballDataStore.getMatches();
        return { matches: currentMatches, source: 'custom', total: currentMatches.length };
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
    const creds = this.getStoredCredentials();
    return {
      provider: creds.provider,
      hasApiKey: !!creds.apiKey,
      baseUrl: creds.baseUrl,
    };
  }
}

export const footballApiService = new FootballApiService();
