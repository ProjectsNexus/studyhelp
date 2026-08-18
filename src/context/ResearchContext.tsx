import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType, cleanForFirestore } from "../firebase";
import { useAuth } from "./AuthContext";
import { ResearchRequest, ResearchAnswer, FilteredSource, SearchQuery } from "../types";

export interface ResearchExecutionParams {
  topic: string;
  semesterId?: string;
  subjectId?: string;
  researchType?: "quick_explanation" | "detailed_research" | "study_notes" | "exam_preparation" | "assignment_research" | "topic_summary" | "compare_concepts";
  researchDepth?: "basic" | "standard" | "deep";
  additionalInstructions?: string;
  forceFresh?: boolean;
}

export interface ProgressState {
  stage: "queries" | "search" | "filtering" | "synthesis" | "complete" | "error";
  stageIndex: number;
  totalStages: number;
  message: string;
  details?: any;
}

interface ResearchContextType {
  currentResearch: ResearchRequest | null;
  researchHistory: ResearchRequest[];
  isResearching: boolean;
  progressState: ProgressState | null;
  error: string | null;
  executeResearch: (params: ResearchExecutionParams) => Promise<ResearchRequest>;
  reRunResearch: (researchId: string) => Promise<ResearchRequest>;
  deleteResearch: (id: string) => Promise<void>;
  setCurrentResearch: (res: ResearchRequest | null) => void;
  clearError: () => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, universityProfile, semesters, subjects } = useAuth();
  const [currentResearch, setCurrentResearch] = useState<ResearchRequest | null>(null);
  const [researchHistory, setResearchHistory] = useState<ResearchRequest[]>([]);
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync research history from Firestore
  useEffect(() => {
    if (!user) {
      setResearchHistory([]);
      return;
    }

    const q = query(
      collection(db, "researchRequests"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ResearchRequest[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as ResearchRequest), id: d.id });
        });
        // Sort descending by createdAt
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setResearchHistory(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "researchRequests");
      }
    );

    return () => unsubscribe();
  }, [user]);

  const executeResearch = async (params: ResearchExecutionParams): Promise<ResearchRequest> => {
    if (!user) {
      throw new Error("You must be signed in to perform academic research.");
    }

    setIsResearching(true);
    setError(null);
    setProgressState({
      stage: "queries",
      stageIndex: 1,
      totalStages: 6,
      message: "Analyzing permanent university profile & course objectives...",
    });

    const sem = semesters.find((s) => s.id === params.semesterId) || semesters[0];
    const sub = subjects.find((s) => s.id === params.subjectId) || subjects[0];

    const requestId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const requestPayload = {
      requestId,
      userId: user.uid,
      universityProfile: universityProfile
        ? {
            name: universityProfile.name,
            country: universityProfile.country,
            degree: universityProfile.degree,
            program: universityProfile.program,
            department: universityProfile.department,
            academicLevel: universityProfile.academicLevel,
            preferredLanguage: universityProfile.preferredLanguage,
            answerStyle: universityProfile.answerStyle,
            citationPreference: universityProfile.citationPreference,
            academicSystem: universityProfile.academicSystem,
          }
        : undefined,
      semesterProfile: sem
        ? {
            semesterNumber: sem.semesterNumber,
            name: sem.name,
          }
        : undefined,
      subjectProfile: sub
        ? {
            name: sub.name,
            courseCode: sub.courseCode,
            learningObjectives: sub.learningObjectives,
            topics: sub.topics,
          }
        : undefined,
      topic: params.topic.trim(),
      researchType: params.researchType || universityProfile?.answerStyle || "detailed_research",
      researchDepth: params.researchDepth || universityProfile?.researchDepth || "standard",
      additionalInstructions: params.additionalInstructions,
      forceFresh: params.forceFresh ?? false,
    };

    try {
      // Execute research via API with real-time SSE stream
      const response = await fetch("/api/research/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`Research request failed with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResultData: any = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: progress")) {
              const dataMatch = line.match(/data: (.*)/);
              if (dataMatch) {
                try {
                  const progressData = JSON.parse(dataMatch[1]);
                  setProgressState(progressData);
                } catch {}
              }
            } else if (line.startsWith("event: complete")) {
              const dataMatch = line.match(/data: (.*)/);
              if (dataMatch) {
                try {
                  finalResultData = JSON.parse(dataMatch[1]);
                } catch {}
              }
            } else if (line.startsWith("event: error")) {
              const dataMatch = line.match(/data: (.*)/);
              if (dataMatch) {
                try {
                  const errData = JSON.parse(dataMatch[1]);
                  throw new Error(errData.message || "Pipeline execution failed");
                } catch (e) {
                  throw e;
                }
              }
            }
          }
        }
      }

      // If stream didn't produce full complete event, fallback to direct JSON endpoint
      if (!finalResultData) {
        const fallbackRes = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });
        const json = await fallbackRes.json();
        if (!json.success) throw new Error(json.message || "Research failed");
        finalResultData = json.data;
      }

      const fullRequestItem: ResearchRequest = {
        id: requestId,
        userId: user.uid,
        universityId: universityProfile?.id,
        semesterId: sem?.id,
        subjectId: sub?.id,
        topic: params.topic.trim(),
        researchType: (params.researchType as any) || "detailed_research",
        researchDepth: (params.researchDepth as any) || "standard",
        additionalInstructions: params.additionalInstructions,
        status: "completed",
        universityName: universityProfile?.name || "General Academic Context",
        semesterName: sem ? `Semester ${sem.semesterNumber} - ${sem.name}` : undefined,
        subjectName: sub?.name,
        courseCode: sub?.courseCode,
        searchQueries: finalResultData.searchQueries,
        filteredSources: finalResultData.filteredSources,
        answer: finalResultData.answer,
        promptVersion: finalResultData.promptVersions?.research,
        cached: finalResultData.cached,
        expiresAt: finalResultData.expiresAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        createdAt: finalResultData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Persist to Firestore
      try {
        const sanitized = cleanForFirestore(fullRequestItem);
        await setDoc(doc(db, "researchRequests", requestId), sanitized);
      } catch (fErr) {
        handleFirestoreError(fErr, OperationType.CREATE, `researchRequests/${requestId}`);
      }

      setCurrentResearch(fullRequestItem);
      setIsResearching(false);
      setProgressState(null);
      return fullRequestItem;
    } catch (err: any) {
      console.error("[ResearchContext] Execution error:", err);
      const msg = err instanceof Error ? err.message : "Academic research pipeline encountered an error";
      setError(msg);
      setIsResearching(false);
      setProgressState(null);
      throw err;
    }
  };

  const reRunResearch = async (researchId: string): Promise<ResearchRequest> => {
    const existing = researchHistory.find((r) => r.id === researchId);
    if (!existing) throw new Error("Research query not found");

    return executeResearch({
      topic: existing.topic,
      semesterId: existing.semesterId,
      subjectId: existing.subjectId,
      researchType: existing.researchType,
      researchDepth: existing.researchDepth,
      additionalInstructions: existing.additionalInstructions,
      forceFresh: true,
    });
  };

  const deleteResearch = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "researchRequests", id));
      if (currentResearch?.id === id) {
        setCurrentResearch(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `researchRequests/${id}`);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <ResearchContext.Provider
      value={{
        currentResearch,
        researchHistory,
        isResearching,
        progressState,
        error,
        executeResearch,
        reRunResearch,
        deleteResearch,
        setCurrentResearch,
        clearError,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error("useResearch must be used within a ResearchProvider");
  }
  return context;
};
