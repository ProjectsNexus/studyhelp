export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  activeUniversityId?: string;
  activeSemesterId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UniversityProfile {
  id?: string;
  userId: string;
  name: string;
  website?: string;
  country: string;
  city?: string;
  degree: string;
  program: string;
  department: string;
  academicLevel: "undergraduate" | "graduate" | "postgraduate" | "doctorate" | "diploma";
  academicSystem?: string;
  preferredLanguage: string;
  answerStyle: "rigorous" | "balanced" | "simplified" | "exam_oriented";
  citationPreference: "apa" | "ieee" | "mla" | "chicago" | "harvard";
  researchDepth: "basic" | "standard" | "deep";
  officialUrls?: { title: string; url: string; type: string }[];
  departments?: { name: string; description?: string }[];
  academicResources?: { title: string; url: string; description?: string }[];
  researchSources?: { title: string; url: string }[];
  verified: boolean;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SemesterProfile {
  id?: string;
  userId: string;
  universityId?: string;
  semesterNumber: number;
  name: string;
  academicYear?: string;
  program?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectProfile {
  id?: string;
  userId: string;
  semesterId: string;
  universityId?: string;
  name: string;
  courseCode?: string;
  description?: string;
  learningObjectives?: string[];
  topics?: string[];
  resources?: { title: string; url?: string; type: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface KeyConcept {
  concept: string;
  definition: string;
  explanation: string;
  example?: string;
  citations?: string[];
}

export interface CitationItem {
  refId: string;
  sourceId: string;
  title: string;
  url: string;
  domain: string;
  citationText: string;
  authorityTier: string;
}

export interface ResearchAnswer {
  executiveSummary: string;
  detailedExplanation: string;
  keyConcepts: KeyConcept[];
  importantPoints: string[];
  academicContext?: string;
  compareTable?: { dimension: string; items: Record<string, string> }[];
  examTips?: string[];
  citationsList: CitationItem[];
}

export interface FilteredSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  domain: string;
  relevanceScore: number;
  academicQualityScore: number;
  authorityScore: number;
  topicScore: number;
  authorityTier: "university" | "department" | "curriculum" | "government" | "publication" | "professional" | "educational" | "general";
  decision: "accept" | "reject";
  reason: string;
}

export interface SearchQuery {
  query: string;
  purpose: string;
  category: "university_specific" | "subject_specific" | "topic_specific" | "academic_general" | "authoritative_sources";
  priority: number;
}

export interface ResearchRequest {
  id: string;
  userId: string;
  universityId?: string;
  semesterId?: string;
  subjectId?: string;
  topic: string;
  researchType: "quick_explanation" | "detailed_research" | "study_notes" | "exam_preparation" | "assignment_research" | "topic_summary" | "compare_concepts";
  researchDepth: "basic" | "standard" | "deep";
  additionalInstructions?: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  universityName?: string;
  semesterName?: string;
  subjectName?: string;
  courseCode?: string;
  searchQueries?: SearchQuery[];
  filteredSources?: FilteredSource[];
  answer?: ResearchAnswer;
  promptVersion?: string;
  cached?: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
