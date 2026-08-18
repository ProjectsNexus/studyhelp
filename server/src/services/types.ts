import { z } from "zod";

export interface NormalizedSearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  domain: string;
  publishedDate?: string;
  content?: string;
}

export interface FilteredSource extends NormalizedSearchResult {
  relevanceScore: number;
  academicQualityScore: number;
  authorityScore: number;
  topicScore: number;
  authorityTier: "university" | "department" | "curriculum" | "government" | "publication" | "professional" | "educational" | "general";
  decision: "accept" | "reject";
  reason: string;
}

export const SearchQueryOutputSchema = z.object({
  queries: z.array(
    z.object({
      query: z.string().min(1),
      purpose: z.string(),
      category: z.enum([
        "university_specific",
        "subject_specific",
        "topic_specific",
        "academic_general",
        "authoritative_sources"
      ]),
      priority: z.number().int().min(1).max(5),
    })
  ).min(1),
});

export type SearchQueryOutput = z.infer<typeof SearchQueryOutputSchema>;

export const ResultFilteringOutputSchema = z.object({
  evaluations: z.array(
    z.object({
      url: z.string(),
      relevanceScore: z.number().min(0).max(100),
      academicQualityScore: z.number().min(0).max(100),
      authorityScore: z.number().min(0).max(100),
      topicScore: z.number().min(0).max(100),
      authorityTier: z.enum([
        "university",
        "department",
        "curriculum",
        "government",
        "publication",
        "professional",
        "educational",
        "general"
      ]),
      decision: z.enum(["accept", "reject"]),
      reason: z.string(),
    })
  ),
});

export type ResultFilteringOutput = z.infer<typeof ResultFilteringOutputSchema>;

export const KeyConceptSchema = z.object({
  concept: z.string(),
  definition: z.string(),
  explanation: z.string(),
  example: z.string().optional(),
  citations: z.array(z.string()).optional(),
});

export const CitationItemSchema = z.object({
  refId: z.string(),
  sourceId: z.string(),
  title: z.string(),
  url: z.string(),
  domain: z.string(),
  citationText: z.string(),
  authorityTier: z.string(),
});

export const ResearchAnswerOutputSchema = z.object({
  executiveSummary: z.string(),
  detailedExplanation: z.string(),
  keyConcepts: z.array(KeyConceptSchema),
  importantPoints: z.array(z.string()),
  academicContext: z.string().optional(),
  compareTable: z.array(
    z.object({
      dimension: z.string(),
      items: z.record(z.string(), z.string()),
    })
  ).optional(),
  examTips: z.array(z.string()).optional(),
  citationsList: z.array(CitationItemSchema),
});

export type ResearchAnswerOutput = z.infer<typeof ResearchAnswerOutputSchema>;

export const UniversityVerificationOutputSchema = z.object({
  universityName: z.string(),
  officialWebsite: z.string().optional(),
  country: z.string(),
  city: z.string().optional(),
  verified: z.boolean(),
  academicSystem: z.string().optional(),
  officialUrls: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      type: z.string(),
    })
  ).optional(),
  departments: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
  academicResources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
  verificationNotes: z.string(),
  researchSources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    })
  ),
});

export type UniversityVerificationOutput = z.infer<typeof UniversityVerificationOutputSchema>;
