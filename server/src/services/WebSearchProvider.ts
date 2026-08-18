import { NormalizedSearchResult } from "./types.js";

export interface WebSearchProvider {
  readonly providerName: string;
  search(query: string, limit?: number): Promise<NormalizedSearchResult[]>;
  searchMany(queries: string[], limitPerQuery?: number): Promise<NormalizedSearchResult[]>;
}
