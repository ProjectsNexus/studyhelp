import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  Copy,
  Check,
  RotateCw,
  ExternalLink,
  Download,
  BookmarkCheck,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  FileText,
  Clock,
  ArrowLeft,
  Filter,
  Zap,
  BookMarked,
  Scale,
  ListOrdered,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { ResearchRequest } from "../../types";
import { useResearch } from "../../context/ResearchContext";
import { useNavigate } from "react-router-dom";

interface ResearchResultViewProps {
  research: ResearchRequest;
  onBack?: () => void;
}

export const ResearchResultView: React.FC<ResearchResultViewProps> = ({ research, onBack }) => {
  const { reRunResearch, isResearching } = useResearch();
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  
  // Format Filter Mode: 'format_only' (shows only the selected format & records) vs 'full_dossier' (all sections)
  const [viewMode, setViewMode] = useState<"format_only" | "full_dossier">("format_only");

  // Determine initial active tab based on research type
  const getInitialTab = (type?: string) => {
    switch (type) {
      case "quick_explanation":
      case "topic_summary":
        return "quick_summary";
      case "exam_preparation":
        return "exam_prep";
      case "study_notes":
        return "study_notes";
      case "compare_concepts":
        return "compare";
      case "detailed_research":
      case "assignment_research":
      default:
        return "analysis";
    }
  };

  const [activeTab, setActiveTab] = useState<
    "quick_summary" | "study_notes" | "exam_prep" | "compare" | "analysis" | "sources"
  >(getInitialTab(research.researchType));

  useEffect(() => {
    setActiveTab(getInitialTab(research.researchType));
  }, [research.id, research.researchType]);

  const navigate = useNavigate();
  const answer = research.answer;

  if (!answer) {
    return (
      <Card className="text-center py-12">
        <p className="text-slate-500 text-sm">No research output available for this query.</p>
      </Card>
    );
  }

  const formatLabels: Record<string, { title: string; desc: string; icon: any }> = {
    quick_explanation: {
      title: "Quick Concept Breakdown",
      desc: "Intuitive executive summary, core definition & essential takeaway bullets only",
      icon: Clock,
    },
    exam_preparation: {
      title: "Exam Preparation & Mastery",
      desc: "High-yield examination tips, assessment pitfalls, formulas & principles only",
      icon: Zap,
    },
    study_notes: {
      title: "Lecture & Revision Study Notes",
      desc: "Structured study notes, key concept cards & concrete examples only",
      icon: BookMarked,
    },
    compare_concepts: {
      title: "Comparative Models & Matrix",
      desc: "Multi-dimensional comparative analysis, contrast matrix & trade-offs only",
      icon: Scale,
    },
    topic_summary: {
      title: "Executive Topic Summary",
      desc: "Concise executive digest and high-level academic findings only",
      icon: FileText,
    },
    assignment_research: {
      title: "Assignment Research & Problem Solving",
      desc: "Applied methodology, pedagogical proofs, and problem solutions",
      icon: Layers,
    },
    detailed_research: {
      title: "Detailed Academic Monograph",
      desc: "Full comprehensive analysis, theoretical mechanisms, and references",
      icon: BookOpen,
    },
  };

  const currentFormatMeta = formatLabels[research.researchType || "detailed_research"] || {
    title: "Academic Research",
    desc: "Academic synthesis and evidence records",
    icon: Sparkles,
  };
  const FormatIcon = currentFormatMeta.icon;

  const handleCopyMarkdown = async () => {
    let md = `# ${research.topic}\n`;
    md += `*University: ${research.universityName || "University"}* | *Subject: ${research.subjectName || "Subject"}* | *Format: ${currentFormatMeta.title}*\n`;
    md += `*Date: ${new Date(research.createdAt).toLocaleDateString()}*\n\n`;

    if (viewMode === "format_only" && research.researchType === "quick_explanation") {
      md += `## Quick Summary\n${answer.executiveSummary}\n\n`;
      md += `## Core Takeaways\n${answer.importantPoints.map((p) => `- ${p}`).join("\n")}\n\n`;
    } else if (viewMode === "format_only" && research.researchType === "exam_preparation") {
      md += `## High-Yield Exam Preparation\n`;
      if (answer.examTips) {
        md += `### Exam Tips & Pitfalls:\n${answer.examTips.map((t) => `- ${t}`).join("\n")}\n\n`;
      }
      md += `### Key Principles:\n${answer.importantPoints.map((p) => `- ${p}`).join("\n")}\n\n`;
    } else if (viewMode === "format_only" && research.researchType === "study_notes") {
      md += `## Study Notes\n`;
      md += answer.keyConcepts
        .map((k) => `### ${k.concept}\n**Definition:** ${k.definition}\n**Explanation:** ${k.explanation}${k.example ? `\n**Example:** ${k.example}` : ""}`)
        .join("\n\n") + "\n\n";
      md += `### Core Takeaways:\n${answer.importantPoints.map((p) => `- ${p}`).join("\n")}\n\n`;
    } else {
      md += `## Executive Summary\n${answer.executiveSummary}\n\n`;
      md += `## Detailed Academic Explanation\n${answer.detailedExplanation}\n\n`;
      md += `## Key Concepts\n${answer.keyConcepts.map((k) => `### ${k.concept}\n**Definition:** ${k.definition}\n**Explanation:** ${k.explanation}${k.example ? `\n**Example:** ${k.example}` : ""}`).join("\n\n")}\n\n`;
      md += `## Critical Takeaways\n${answer.importantPoints.map((p) => `- ${p}`).join("\n")}\n\n`;
      if (answer.examTips) {
        md += `## Exam Focus\n${answer.examTips.map((t) => `- ${t}`).join("\n")}\n\n`;
      }
    }

    md += `## Verified Authoritative Records & Citations\n${answer.citationsList.map((c) => `${c.refId} ${c.citationText}`).join("\n\n")}\n`;

    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCitation = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCitationId(id);
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const authorityTierVariant = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "university":
        return "university" as const;
      case "department":
        return "department" as const;
      case "publication":
        return "publication" as const;
      case "government":
        return "government" as const;
      default:
        return "info" as const;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onBack || (() => navigate("/dashboard"))}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? "Copied Markdown" : "Copy Markdown"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Print / PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => reRunResearch(research.id)}
            isLoading={isResearching}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Research Document Paper Container */}
      <Card className="border border-slate-200/90 shadow-sm p-5 sm:p-8 space-y-6 bg-white">
        {/* Research Metadata Header */}
        <div className="border-b border-slate-100 pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {research.universityName && (
              <Badge variant="university" size="sm" icon={<GraduationCap className="w-3 h-3" />}>
                {research.universityName}
              </Badge>
            )}
            {research.subjectName && (
              <Badge variant="department" size="sm" icon={<BookOpen className="w-3 h-3" />}>
                {research.courseCode ? `[${research.courseCode}] ` : ""}
                {research.subjectName}
              </Badge>
            )}
            {research.semesterName && (
              <Badge variant="default" size="sm" icon={<Layers className="w-3 h-3" />}>
                {research.semesterName}
              </Badge>
            )}
            <Badge variant="outline" size="sm" icon={<Calendar className="w-3 h-3" />}>
              {new Date(research.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Badge>
            {research.cached && (
              <Badge variant="success" size="sm">
                Cached Synthesis
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0"></span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {research.topic}
            </h1>
          </div>

          {/* Active Format Indicator Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 bg-indigo-50/70 border border-indigo-100/90 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FormatIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    Output Format:
                  </span>
                  <span className="text-xs font-black text-indigo-950">
                    {currentFormatMeta.title}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800/80">
                  {currentFormatMeta.desc}
                </p>
              </div>
            </div>

            {/* View Filter Pill Toggle */}
            <div className="flex items-center gap-1 bg-white/90 p-1 rounded-xl border border-indigo-200/70 self-start sm:self-auto shrink-0 shadow-2xs">
              <button
                onClick={() => setViewMode("format_only")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  viewMode === "format_only"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Filtered Format Only
              </button>
              <button
                onClick={() => setViewMode("full_dossier")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  viewMode === "full_dossier"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Full Dossier (All)
              </button>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs (shown when viewing Full Dossier or for fast section switching) */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "quick_summary", label: "Quick Concept", icon: Clock },
            { id: "study_notes", label: "Study Notes", icon: BookMarked },
            { id: "exam_prep", label: "Exam Prep & Tips", icon: Zap },
            { id: "compare", label: "Compare Matrix", icon: Scale },
            { id: "analysis", label: "Full Analysis", icon: FileText },
            { id: "sources", label: `Sources & Records (${answer.citationsList.length})`, icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: FILTERED FORMAT VIEW (renders only selected format + records) */}
        {/* ========================================================================= */}
        {viewMode === "format_only" && (
          <div className="space-y-7">
            {/* 1. Quick Explanation Format */}
            {(research.researchType === "quick_explanation" || activeTab === "quick_summary") && (
              <div className="space-y-5">
                <div className="p-5 sm:p-6 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
                      Quick Concept Breakdown & Executive Summary
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                    {answer.executiveSummary}
                  </p>
                </div>

                {/* Primary Concept Definition */}
                {answer.keyConcepts.length > 0 && (
                  <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">
                        {answer.keyConcepts[0].concept}
                      </h4>
                      {answer.keyConcepts[0].citations && (
                        <div className="flex items-center gap-1">
                          {answer.keyConcepts[0].citations.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {answer.keyConcepts[0].definition}
                    </p>
                    {answer.keyConcepts[0].example && (
                      <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded-lg mt-2">
                        Example: {answer.keyConcepts[0].example}
                      </p>
                    )}
                  </div>
                )}

                {/* Core Takeaways */}
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Core Concept Takeaways
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {answer.importantPoints.slice(0, 4).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 2. Exam Preparation Format */}
            {(research.researchType === "exam_preparation" || activeTab === "exam_prep") && (
              <div className="space-y-5">
                {/* Exam Focus & Pitfalls */}
                {answer.examTips && answer.examTips.length > 0 && (
                  <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-700" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950">
                        High-Yield Examination Tips & Assessment Trap Pitfalls
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {answer.examTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                          <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            ★
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Critical Principles & Invariants */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Essential Principles & Exam Scoring Points
                    </h4>
                  </div>
                  <ul className="space-y-2.5">
                    {answer.importantPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Formulations & Definitions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Key Definitions to Memorize
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {answer.keyConcepts.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold text-slate-900">{item.concept}</span>
                        <p className="text-xs text-slate-700 leading-relaxed">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Study Notes Format */}
            {(research.researchType === "study_notes" || activeTab === "study_notes") && (
              <div className="space-y-5">
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Lecture Review Overview
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {answer.executiveSummary}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Core Study Concepts & Illustrated Examples
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {answer.keyConcepts.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm sm:text-base font-bold text-slate-900">
                            {idx + 1}. {item.concept}
                          </h5>
                          {item.citations && (
                            <div className="flex items-center gap-1">
                              {item.citations.map((c, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 font-medium">{item.definition}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
                        {item.example && (
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-mono text-slate-700">
                            <span className="font-bold text-indigo-700 block mb-0.5">Example:</span>
                            {item.example}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Compare Concepts Format */}
            {(research.researchType === "compare_concepts" || activeTab === "compare") && (
              <div className="space-y-5">
                <div className="p-4 sm:p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                      Comparative Dimensions & Model Contrast
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-900 leading-relaxed">
                    {answer.executiveSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {answer.keyConcepts.map((item, idx) => (
                    <div key={idx} className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-slate-900">{item.concept}</h5>
                        <Badge variant="outline" size="sm">Model {idx + 1}</Badge>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{item.explanation}</p>
                      {item.example && (
                        <div className="p-2 bg-slate-50 rounded-lg text-xs font-mono text-slate-600">
                          {item.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Trade-offs & Distinctions
                  </h4>
                  <ul className="space-y-2">
                    {answer.importantPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 5. Detailed Research / Assignment / Full Analysis Format */}
            {(research.researchType === "detailed_research" ||
              research.researchType === "assignment_research" ||
              activeTab === "analysis") && (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Executive Summary
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                    {answer.executiveSummary}
                  </p>
                </div>

                {/* Detailed Explanation */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detailed Academic Analysis
                  </h3>
                  <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-800 leading-relaxed space-y-4">
                    {answer.detailedExplanation.split("\n\n").map((para, i) => {
                      if (para.startsWith("###")) {
                        return (
                          <h4 key={i} className="text-base sm:text-lg font-bold text-slate-900 pt-2">
                            {para.replace(/^###\s*/, "")}
                          </h4>
                        );
                      }
                      return (
                        <p key={i} className="text-slate-800">
                          {para}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Academic Context / Curriculum Alignment */}
                {answer.academicContext && (
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
                      Curriculum & Degree Context
                    </h4>
                    <p className="text-xs sm:text-sm text-indigo-900 leading-relaxed">
                      {answer.academicContext}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AUTHORITATIVE RESEARCH RECORDS & SOURCES (roecs) - ALWAYS VISIBLE IN FORMAT VIEW */}
            <div className="pt-4 border-t border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Verified Research Records & Sources ({answer.citationsList.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {research.universityProfile?.citationPreference?.toUpperCase() || "APA"} Format
                </span>
              </div>

              <div className="space-y-3">
                {answer.citationsList.map((cit, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 font-mono text-xs font-bold text-indigo-700">
                          {cit.refId}
                        </span>
                        <Badge variant={authorityTierVariant(cit.authorityTier)} size="sm">
                          {cit.authorityTier} Tier
                        </Badge>
                      </div>

                      <button
                        onClick={() => handleCopyCitation(cit.refId, cit.citationText)}
                        className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
                      >
                        {copiedCitationId === cit.refId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Citation</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h5 className="text-sm font-bold text-slate-900">{cit.title}</h5>

                    <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                      {cit.citationText}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Domain: {cit.domain}
                      </span>
                      {cit.url && (
                        <a
                          href={cit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <span>Open Source</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: FULL DOSSIER TABS (Browsing all individual sections) */}
        {/* ========================================================================= */}
        {viewMode === "full_dossier" && (
          <div className="space-y-6">
            {/* TAB: QUICK SUMMARY */}
            {activeTab === "quick_summary" && (
              <div className="space-y-5">
                <div className="p-5 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
                      Executive Summary & Quick Overview
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                    {answer.executiveSummary}
                  </p>
                </div>

                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Core Concept Takeaways
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {answer.importantPoints.slice(0, 4).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: FULL ANALYSIS */}
            {activeTab === "analysis" && (
              <div className="space-y-6">
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Executive Summary
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                    {answer.executiveSummary}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detailed Academic Analysis
                  </h3>
                  <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-800 leading-relaxed space-y-4">
                    {answer.detailedExplanation.split("\n\n").map((para, i) => {
                      if (para.startsWith("###")) {
                        return (
                          <h4 key={i} className="text-base sm:text-lg font-bold text-slate-900 pt-2">
                            {para.replace(/^###\s*/, "")}
                          </h4>
                        );
                      }
                      return (
                        <p key={i} className="text-slate-800">
                          {para}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {answer.academicContext && (
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
                      Curriculum & Degree Context
                    </h4>
                    <p className="text-xs sm:text-sm text-indigo-900 leading-relaxed">
                      {answer.academicContext}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: STUDY NOTES */}
            {activeTab === "study_notes" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {answer.keyConcepts.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-bold text-slate-900">
                          {idx + 1}. {item.concept}
                        </h4>
                        {item.citations && item.citations.length > 0 && (
                          <div className="flex items-center gap-1">
                            {item.citations.map((c, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Definition
                        </p>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                          {item.definition}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          In-Depth Explanation
                        </p>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>

                      {item.example && (
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                            Academic Example / Application
                          </p>
                          <p className="text-xs text-slate-700 font-mono leading-relaxed">
                            {item.example}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: EXAM PREP */}
            {activeTab === "exam_prep" && (
              <div className="space-y-5">
                <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Critical Takeaways & Essential Principles
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {answer.importantPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {answer.examTips && answer.examTips.length > 0 && (
                  <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-700" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950">
                        Examination Tips & Common Assessment Pitfalls
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {answer.examTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-amber-900 leading-relaxed">
                          <span className="font-bold text-amber-700">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB: COMPARE */}
            {activeTab === "compare" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {answer.keyConcepts.map((item, idx) => (
                    <div key={idx} className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
                      <h5 className="text-sm font-bold text-slate-900">{item.concept}</h5>
                      <p className="text-xs text-slate-700 leading-relaxed">{item.explanation}</p>
                      {item.example && (
                        <div className="p-2 bg-slate-50 rounded-lg text-xs font-mono text-slate-600">
                          {item.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SOURCES & RECORDS */}
            {activeTab === "sources" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Authoritative Bibliography & Peer-Ranked Sources
                  </span>
                </div>

                <div className="space-y-3">
                  {answer.citationsList.map((cit, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 font-mono text-xs font-bold text-indigo-700">
                            {cit.refId}
                          </span>
                          <Badge variant={authorityTierVariant(cit.authorityTier)} size="sm">
                            {cit.authorityTier} Tier
                          </Badge>
                        </div>

                        <button
                          onClick={() => handleCopyCitation(cit.refId, cit.citationText)}
                          className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
                        >
                          {copiedCitationId === cit.refId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Citation</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900">{cit.title}</h5>

                      <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        {cit.citationText}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Domain: {cit.domain}
                        </span>
                        {cit.url && (
                          <a
                            href={cit.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            <span>Open Source</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
