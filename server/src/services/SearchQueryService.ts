import { SEARCH_PROMPT_VERSION } from "../ai/prompts/searchQueryPrompt.js";
import { SearchQueryOutput } from "./types.js";

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

  async generateQueries(input: SearchQueryInput): Promise<SearchQueryOutput> {
    const subject = input.subjectProfile?.name || "";
    const courseCode = input.subjectProfile?.courseCode || "";
    const uni = input.universityProfile?.name || "";
    const topic = input.topic.trim();

    return {
      queries: [
        {
          query: `${topic} ${subject} ${courseCode} syllabus lecture notes site:edu`.trim(),
          purpose: `Retrieve university curriculum lecture slides, courseware, and syllabus frameworks`,
          category: "university_specific",
          priority: 1,
        },
        {
          query: `${topic} ${subject} foundational theory mechanisms formal proofs`.trim(),
          purpose: `Subject-aligned theoretical mechanisms, formal definitions, and core principles`,
          category: "subject_specific",
          priority: 1,
        },
        {
          query: `${topic} academic paper survey literature review IEEE ACM Springer`.trim(),
          purpose: `Peer-reviewed academic research papers, journals, and authoritative survey literature`,
          category: "authoritative_sources",
          priority: 2,
        },
        {
          query: `${topic} comprehensive analysis applications examples`.trim(),
          purpose: `Topic breakdown, illustrative examples, and practical academic applications`,
          category: "topic_specific",
          priority: 2,
        },
      ],
    };
  }
}
