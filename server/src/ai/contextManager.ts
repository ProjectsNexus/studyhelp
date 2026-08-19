export interface AcademicContextPayload {
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
  researchType?: string;
  researchDepth?: string;
  additionalInstructions?: string;
  sources?: any[];
}

export class ContextManager {
  /**
   * Formats unified academic context text that works identically across all AI providers
   */
  static formatAcademicContext(payload: AcademicContextPayload): string {
    const uni = payload.universityProfile;
    const sem = payload.semesterProfile;
    const sub = payload.subjectProfile;

    const sections: string[] = [];

    // 1. Institutional Context
    if (uni) {
      sections.push(`[INSTITUTIONAL PROFILE]
- Institution: ${uni.name} (${uni.country})
- Academic Level: ${uni.academicLevel}
- Degree: ${uni.degree} in ${uni.program}
- Department: ${uni.department}
- System: ${uni.academicSystem || "Semester System"}
- Preferred Language: ${uni.preferredLanguage || "English"}
- Answer Style: ${uni.answerStyle || "balanced"}
- Citation Preference: ${uni.citationPreference || "ieee"}`);
    }

    // 2. Curriculum & Term Context
    if (sem || sub) {
      sections.push(`[CURRICULUM CONTEXT]
- Term: ${sem ? `Semester ${sem.semesterNumber} (${sem.name})` : "Current Term"}
- Subject / Course: ${sub?.name || "General Course"} ${sub?.courseCode ? `[${sub.courseCode}]` : ""}
- Learning Objectives: ${sub?.learningObjectives?.length ? sub.learningObjectives.join("; ") : "Course core competencies"}`);
    }

    // 3. Research Goal
    sections.push(`[RESEARCH SPECIFICATIONS]
- Target Topic: ${payload.topic}
- Research Type: ${payload.researchType || "Detailed Academic Research"}
- Research Depth: ${payload.researchDepth || "Standard (Authoritative synthesis)"}
- Student Instructions: ${payload.additionalInstructions?.trim() || "None specified"}`);

    // 4. Evidence Sources if provided
    if (payload.sources && payload.sources.length > 0) {
      sections.push(`[FILTERED AUTHORITATIVE EVIDENCE (${payload.sources.length} sources)]
${JSON.stringify(payload.sources, null, 2)}`);
    }

    return sections.join("\n\n");
  }
}
