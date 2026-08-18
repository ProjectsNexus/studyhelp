import { SearchQueryService, SearchQueryInput } from "./SearchQueryService.js";
import { WebSearchService } from "./WebSearchService.js";
import { ResultFilteringService, FilterInput } from "./ResultFilteringService.js";
import { AnswerGenerationService, AnswerGenerationInput } from "./AnswerGenerationService.js";
import { FilteredSource, NormalizedSearchResult, ResearchAnswerOutput, SearchQueryOutput } from "./types.js";

export interface ResearchPipelineInput {
  requestId?: string;
  userId: string;
  universityProfile?: {
    name: string;
    country: string;
    degree: string;
    program: string;
    department: string;
    academicLevel: string;
    preferredLanguage?: string;
    answerStyle?: string;
    citationPreference?: string;
    academicSystem?: string;
  };
  semesterProfile?: {
    semesterNumber: number;
    name: string;
  };
  subjectProfile?: {
    name: string;
    courseCode?: string;
    learningObjectives?: string[];
    topics?: string[];
  };
  topic: string;
  researchType: string;
  researchDepth: string;
  additionalInstructions?: string;
  forceFresh?: boolean;
}

export interface ResearchProgressUpdate {
  stage: "queries" | "search" | "filtering" | "synthesis" | "complete" | "error";
  stageIndex: number;
  totalStages: number;
  message: string;
  details?: any;
}

export interface ResearchPipelineResult {
  id: string;
  userId: string;
  topic: string;
  researchType: string;
  researchDepth: string;
  additionalInstructions?: string;
  status: "completed" | "failed";
  universityProfile?: any;
  semesterProfile?: any;
  subjectProfile?: any;
  searchQueries: SearchQueryOutput["queries"];
  filteredSources: FilteredSource[];
  answer: ResearchAnswerOutput;
  promptVersions: {
    search: string;
    filter: string;
    research: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  cached?: boolean;
}

// In-memory research cache for instant repeat query speed and quota preservation
const researchCache = new Map<string, { result: ResearchPipelineResult; expiresAtTimestamp: number }>();

export class ResearchService {
  private searchQueryService: SearchQueryService;
  private webSearchService: WebSearchService;
  private resultFilteringService: ResultFilteringService;
  private answerGenerationService: AnswerGenerationService;

  constructor() {
    this.searchQueryService = new SearchQueryService();
    this.webSearchService = new WebSearchService();
    this.resultFilteringService = new ResultFilteringService();
    this.answerGenerationService = new AnswerGenerationService();
  }

  private generateCacheKey(input: ResearchPipelineInput): string {
    const uni = input.universityProfile?.name || "none";
    const sem = input.semesterProfile?.semesterNumber || "0";
    const sub = input.subjectProfile?.name || "none";
    const top = input.topic.trim().toLowerCase();
    const type = input.researchType.toLowerCase();
    const depth = input.researchDepth.toLowerCase();
    return `${input.userId}_${uni}_${sem}_${sub}_${top}_${type}_${depth}`;
  }

  async runResearchPipeline(
    input: ResearchPipelineInput,
    onProgress?: (update: ResearchProgressUpdate) => void
  ): Promise<ResearchPipelineResult> {
    const cacheKey = this.generateCacheKey(input);

    // Check valid cache unless forceFresh is requested
    if (!input.forceFresh && researchCache.has(cacheKey)) {
      const cached = researchCache.get(cacheKey)!;
      if (Date.now() < cached.expiresAtTimestamp) {
        onProgress?.({
          stage: "complete",
          stageIndex: 6,
          totalStages: 6,
          message: "Loaded validated research synthesis from cache",
          details: { cached: true },
        });
        return {
          ...cached.result,
          cached: true,
          updatedAt: new Date().toISOString(),
        };
      } else {
        researchCache.delete(cacheKey);
      }
    }

    const now = new Date();
    // Default expiration: 7 days
    const expiresAtDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      // Stage 1: Contextualize and generate academic search queries
      onProgress?.({
        stage: "queries",
        stageIndex: 1,
        totalStages: 6,
        message: "Formulating multi-tiered academic search queries...",
      });

      const queryInput: SearchQueryInput = {
        universityProfile: input.universityProfile,
        semesterProfile: input.semesterProfile,
        subjectProfile: input.subjectProfile,
        topic: input.topic,
        researchType: input.researchType,
        researchDepth: input.researchDepth,
        additionalInstructions: input.additionalInstructions,
      };

      const searchQueriesResult = await this.searchQueryService.generateQueries(queryInput);

      onProgress?.({
        stage: "search",
        stageIndex: 2,
        totalStages: 6,
        message: `Generated ${searchQueriesResult.queries.length} targeted search queries across university and academic domains`,
        details: { queries: searchQueriesResult.queries },
      });

      // Stage 2: Web Search Dispatches
      onProgress?.({
        stage: "search",
        stageIndex: 3,
        totalStages: 6,
        message: "Executing authoritative web search and harvesting course resources...",
      });

      const searchQueriesToRun = searchQueriesResult.queries.map((q) => ({
        query: q.query,
        priority: q.priority,
      }));

      const rawSearchResults = await this.webSearchService.executeSearches(searchQueriesToRun);

      onProgress?.({
        stage: "filtering",
        stageIndex: 4,
        totalStages: 6,
        message: `Discovered ${rawSearchResults.length} candidate academic sources. Evaluating authority & peer ranking...`,
      });

      // Stage 3: Source Filtering and Ranking
      const filterInput: FilterInput = {
        universityProfile: input.universityProfile,
        semesterProfile: input.semesterProfile,
        subjectProfile: input.subjectProfile,
        topic: input.topic,
        results: rawSearchResults,
      };

      const filteredSources = await this.resultFilteringService.filterAndRankResults(filterInput);

      onProgress?.({
        stage: "synthesis",
        stageIndex: 5,
        totalStages: 6,
        message: `Filtered and accepted ${filteredSources.length} peer-ranked authoritative references. Synthesizing academic report...`,
        details: { sourceCount: filteredSources.length },
      });

      // Stage 4: Answer Generation & Citations
      const answerInput: AnswerGenerationInput = {
        universityProfile: input.universityProfile,
        semesterProfile: input.semesterProfile,
        subjectProfile: input.subjectProfile,
        topic: input.topic,
        researchType: input.researchType,
        researchDepth: input.researchDepth,
        additionalInstructions: input.additionalInstructions,
        filteredSources,
      };

      const answer = await this.answerGenerationService.generateAnswer(answerInput);

      const researchId = input.requestId || `res-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const finalResult: ResearchPipelineResult = {
        id: researchId,
        userId: input.userId,
        topic: input.topic,
        researchType: input.researchType,
        researchDepth: input.researchDepth,
        additionalInstructions: input.additionalInstructions,
        status: "completed",
        universityProfile: input.universityProfile,
        semesterProfile: input.semesterProfile,
        subjectProfile: input.subjectProfile,
        searchQueries: searchQueriesResult.queries,
        filteredSources,
        answer,
        promptVersions: {
          search: this.searchQueryService.version,
          filter: this.resultFilteringService.version,
          research: this.answerGenerationService.version,
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAtDate.toISOString(),
        cached: false,
      };

      // Store in memory cache
      researchCache.set(cacheKey, {
        result: finalResult,
        expiresAtTimestamp: expiresAtDate.getTime(),
      });

      onProgress?.({
        stage: "complete",
        stageIndex: 6,
        totalStages: 6,
        message: "Academic research synthesis complete!",
        details: { resultId: researchId },
      });

      return finalResult;
    } catch (error) {
      console.error("[ResearchService] Pipeline error:", error);
      onProgress?.({
        stage: "error",
        stageIndex: 0,
        totalStages: 6,
        message: `Research pipeline failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
      throw error;
    }
  }
}
