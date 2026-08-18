import { WebSearchProvider } from "./WebSearchProvider.js";
import { GeminiGroundedSearchProvider } from "./GeminiGroundedSearchProvider.js";
import { NormalizedSearchResult } from "./types.js";

export class WebSearchService {
  private provider: WebSearchProvider;

  constructor(customProvider?: WebSearchProvider) {
    this.provider = customProvider || new GeminiGroundedSearchProvider();
  }

  setProvider(provider: WebSearchProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.providerName;
  }

  async executeSearches(queries: { query: string; priority: number }[]): Promise<NormalizedSearchResult[]> {
    if (!queries || queries.length === 0) return [];

    // Sort by priority and take top queries
    const sortedQueries = [...queries].sort((a, b) => a.priority - b.priority).map((q) => q.query);
    const queryStrings = sortedQueries.slice(0, 6);

    const rawResults = await this.provider.searchMany(queryStrings, 4);

    // Additional deduplication and normalization
    const uniqueMap = new Map<string, NormalizedSearchResult>();
    for (const item of rawResults) {
      const cleanUrl = item.url.trim().toLowerCase().replace(/\/$/, "");
      if (!uniqueMap.has(cleanUrl)) {
        uniqueMap.set(cleanUrl, item);
      }
    }

    return Array.from(uniqueMap.values());
  }
}
