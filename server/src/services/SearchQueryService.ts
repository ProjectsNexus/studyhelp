import { getAIProviderManager } from "../ai/AIProviderManager.js";
import { searchQuerySystemPrompt, SEARCH_PROMPT_VERSION } from "../ai/prompts/searchQueryPrompt.js";
import { ContextManager } from "../ai/contextManager.js";
import { SearchQueryOutput, SearchQueryOutputSchema } from "./types.js";

export interface SearchQueryInput {
  universityProfile?: {
    name: string;
    country: string;
    degree: string;
    program: string;
    department: string;
    academicLevel: string;
  };
  semesterProfile?: {
    semesterNumber: number;
    name: string;
  };
  subjectProfile?: {
    name: string;
    courseCode?: string;
    description?: string;
    learningObjectives?: string[];
    topics?: string[];
  };
  topic: string;
  researchType: string;
  researchDepth: string;
  additionalInstructions?: string;
}

export class SearchQueryService {
  readonly version = SEARCH_PROMPT_VERSION;
  private aiManager = getAIProviderManager();

  async generateQueries(input: SearchQueryInput): Promise<SearchQueryOutput> {
    const formattedContext = ContextManager.formatAcademicContext({
      universityProfile: input.universityProfile,
      semesterProfile: input.semesterProfile,
      subjectProfile: input.subjectProfile,
      topic: input.topic,
      researchType: input.researchType,
      researchDepth: input.researchDepth,
      additionalInstructions: input.additionalInstructions,
    });

    const userPrompt = `Formulate targeted, high-precision academic search queries for the following academic context:\n\n${formattedContext}\n\nStrict requirement: Generate 4 to 6 distinct academic search queries formatted as JSON matching the schema with queries array containing { query, purpose, category, priority }.`;

    try {
      const { data } = await this.aiManager.generateJSON<SearchQueryOutput>(userPrompt, {
        systemInstruction: searchQuerySystemPrompt,
        schema: SearchQueryOutputSchema,
        taskName: "SearchQueryGeneration",
        temperature: 0.3,
      });

      if (data && data.queries && data.queries.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn(
        `[SearchQueryService] AI query generation fallback engaged: ${(err as Error)?.message?.substring(0, 60)}`
      );
    }

    // High-yield deterministic query baseline
    const subject = input.subjectProfile?.name || "";
    const courseCode = input.subjectProfile?.courseCode || "";
    const topic = input.topic.trim();

    return {
      queries: [
        {
          query: `${topic} ${subject} ${courseCode} syllabus lecture notes site:edu`.trim(),
          purpose: "Retrieve university curriculum lecture slides, courseware, and syllabus frameworks",
          category: "university_specific",
          priority: 1,
        },
        {
          query: `${topic} ${subject} foundational theory mechanisms formal proofs`.trim(),
          purpose: "Subject-aligned theoretical mechanisms, formal definitions, and core principles",
          category: "subject_specific",
          priority: 1,
        },
        {
          query: `${topic} academic paper survey literature review IEEE ACM Springer PubMed`.trim(),
          purpose: "Peer-reviewed academic research papers, journals, and authoritative survey literature",
          category: "authoritative_sources",
          priority: 2,
        },
        {
          query: `${topic} comprehensive analysis applications examples`.trim(),
          purpose: "Topic breakdown, illustrative examples, and practical academic applications",
          category: "topic_specific",
          priority: 2,
        },
      ],
    };
  }
}

