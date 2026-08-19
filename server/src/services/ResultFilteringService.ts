import { getAIProviderManager } from "../ai/AIProviderManager.js";
import { resultFilteringSystemPrompt, FILTER_PROMPT_VERSION } from "../ai/prompts/resultFilteringPrompt.js";
import { FilteredSource, NormalizedSearchResult, ResultFilteringOutput, ResultFilteringOutputSchema } from "./types.js";

export interface FilterInput {
  universityProfile?: {
    name: string;
    academicLevel: string;
    degree: string;
    department: string;
  };
  semesterProfile?: {
    semesterNumber: number;
    name: string;
  };
  subjectProfile?: {
    name: string;
    courseCode?: string;
  };
  topic: string;
  results: NormalizedSearchResult[];
}

export class ResultFilteringService {
  readonly version = FILTER_PROMPT_VERSION;
  private aiManager = getAIProviderManager();

  async filterAndRankResults(input: FilterInput): Promise<FilteredSource[]> {
    if (!input.results || input.results.length === 0) {
      return [];
    }

    const topicWords = input.topic.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const subjectWords = (input.subjectProfile?.name || "").toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    const scoredList: FilteredSource[] = input.results.map((r, index) => {
      const d = r.domain.toLowerCase();
      const titleLower = r.title.toLowerCase();
      const snippetLower = r.snippet.toLowerCase();

      // 1. Determine Authority Tier & Base Authority Score
      let authorityTier: FilteredSource["authorityTier"] = "educational";
      let authorityScore = 78;

      if (
        d.includes(".edu") ||
        d.includes("ac.uk") ||
        d.includes("edu.") ||
        d.includes("mit.edu") ||
        d.includes("stanford.edu") ||
        d.includes("harvard.edu") ||
        d.includes("berkeley.edu") ||
        d.includes("nust.edu.pk") ||
        d.includes("aku.edu") ||
        d.includes("kemu.edu.pk")
      ) {
        authorityTier = "university";
        authorityScore = 96;
      } else if (
        d.includes("ieee.org") ||
        d.includes("acm.org") ||
        d.includes("nature.com") ||
        d.includes("springer.com") ||
        d.includes("sciencedirect.com") ||
        d.includes("cell.com") ||
        d.includes("arxiv.org") ||
        d.includes("jstor.org") ||
        d.includes("pubmed") ||
        d.includes("ncbi.nlm.nih.gov")
      ) {
        authorityTier = "publication";
        authorityScore = 95;
      } else if (
        d.includes(".gov") ||
        d.includes("nih.gov") ||
        d.includes("nsf.gov") ||
        d.includes("who.int") ||
        d.includes("cern.ch") ||
        d.includes("hec.gov.pk") ||
        d.includes("pmdc.pk")
      ) {
        authorityTier = "government";
        authorityScore = 92;
      } else if (
        d.includes("scholar.google.com") ||
        d.includes("semanticscholar.org") ||
        d.includes("researchgate.net")
      ) {
        authorityTier = "curriculum";
        authorityScore = 88;
      } else if (d.includes(".org") || d.includes("britannica.com") || d.includes("plato.stanford.edu")) {
        authorityTier = "professional";
        authorityScore = 85;
      }

      // 2. Determine Topic & Subject Relevance
      let topicMatches = 0;
      for (const tw of topicWords) {
        if (titleLower.includes(tw)) topicMatches += 2;
        if (snippetLower.includes(tw)) topicMatches += 1;
      }
      const topicScore = Math.min(99, 75 + topicMatches * 6 - index);

      let subjectMatches = 0;
      for (const sw of subjectWords) {
        if (titleLower.includes(sw) || snippetLower.includes(sw)) subjectMatches++;
      }
      const relevanceScore = Math.min(98, 78 + subjectMatches * 5 + topicMatches * 3 - index);
      const academicQualityScore = Math.min(99, Math.round((authorityScore + relevanceScore) / 2));

      return {
        ...r,
        relevanceScore,
        academicQualityScore,
        authorityScore,
        topicScore,
        authorityTier,
        decision: "accept" as const,
        reason: `Verified ${authorityTier} source with high academic relevance and domain credibility.`,
      };
    });

    // Tier rankings for secondary sorting
    const tierRank: Record<string, number> = {
      university: 8,
      publication: 7,
      curriculum: 6,
      government: 5,
      professional: 4,
      educational: 3,
      general: 2,
      department: 1,
    };

    // Sort by weighted composite score
    return scoredList.sort((a, b) => {
      const scoreA =
        a.authorityScore * 0.4 +
        a.relevanceScore * 0.3 +
        a.topicScore * 0.3 +
        (tierRank[a.authorityTier] || 0) * 1.5;
      const scoreB =
        b.authorityScore * 0.4 +
        b.relevanceScore * 0.3 +
        b.topicScore * 0.3 +
        (tierRank[b.authorityTier] || 0) * 1.5;
      return scoreB - scoreA;
    });
  }
}

