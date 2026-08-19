import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  Plus,
  RotateCw,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { useAuth } from "../context/AuthContext";
import { useResearch } from "../context/ResearchContext";
import { ResearchForm } from "../components/research/ResearchForm";
import { UniversityOnboardingModal } from "../components/university/UniversityOnboardingModal";
import { useNavigate } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const {
    user,
    userProfile,
    universityProfile,
    semesters,
    subjects,
    activeSemester,
    activeSubject,
    needsOnboarding,
    setNeedsOnboarding,
  } = useAuth();

  const { researchHistory, setCurrentResearch, isResearching } = useResearch();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(needsOnboarding);
  const navigate = useNavigate();

  useEffect(() => {
    if (needsOnboarding) {
      setShowOnboarding(true);
    }
  }, [needsOnboarding]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setNeedsOnboarding(false);
  };

  const recentResearches = researchHistory.slice(0, 4);

  // Compute live academic statistics from real user data
  const totalCitations = researchHistory.reduce((acc, curr) => {
    return acc + (curr.answer?.citationsList?.length || curr.filteredSources?.length || 0);
  }, 0);

  const studentName = userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Scholar";
  const studentEmail = user?.email || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Context Banner */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0"></span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {studentName}
              </h1>
              {universityProfile?.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  <Check className="w-3 h-3" />
                  <span>Verified Scholar</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {universityProfile ? (
                <>
                  <span className="text-slate-900 font-bold">{universityProfile.name}</span>
                  {universityProfile.city && (
                    <span className="text-slate-500"> • {universityProfile.city}</span>
                  )}
                  {universityProfile.program && (
                    <span className="text-slate-500"> • {universityProfile.degree} ({universityProfile.program})</span>
                  )}
                </>
              ) : (
                "University context not yet calibrated. Set up your institution to customize syllabus rigor and research standards."
              )}
            </p>

            {studentEmail && (
              <p className="text-[11px] text-slate-400 font-mono">
                {studentEmail}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {universityProfile ? (
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 tracking-wide transition-colors cursor-pointer"
              >
                Edit Context
              </button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowOnboarding(true)}
                className="font-bold text-xs"
              >
                Configure University
              </Button>
            )}
          </div>
        </div>

        {/* Real Context Hierarchy & Badges */}
        {universityProfile ? (
          <div className="space-y-4 pt-1 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                {universityProfile.department || universityProfile.program}
              </span>
              {activeSemester && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                  Semester {activeSemester.semesterNumber}: {activeSemester.name}
                </span>
              )}
              {activeSubject && (
                <span className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                  {activeSubject.courseCode ? `${activeSubject.courseCode}: ` : ""}
                  {activeSubject.name}
                </span>
              )}
              {universityProfile.academicSystem && (
                <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200">
                  {universityProfile.academicSystem}
                </span>
              )}
            </div>

            {/* Real Statistics Metric Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xl sm:text-2xl font-black text-indigo-600 mb-0.5">
                  {researchHistory.length}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Reports Generated
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">
                  {totalCitations}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Indexed Citations
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">
                  {subjects.length}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Enrolled Courses
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">
                  {universityProfile.citationPreference ? universityProfile.citationPreference.toUpperCase() : "IEEE"}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Citation Standard
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Academic Context Pending</p>
                <p className="text-slate-500">
                  Configure your university profile to align research queries with your official syllabus, degree requirements, and citation format.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowOnboarding(true)}
              className="shrink-0 font-bold text-xs"
            >
              Set Up Now
            </Button>
          </div>
        )}
      </section>

      {/* Main Research Engine Launcher */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Research Workbench
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Live Web Grounding
          </span>
        </div>

        <ResearchForm />
      </section>

      {/* Filtered Evidence & Recent Reports */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Recent Academic Reports ({recentResearches.length})
            </h2>
          </div>
          {researchHistory.length > 0 && (
            <button
              onClick={() => navigate("/history")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
            >
              View All ({researchHistory.length}) →
            </button>
          )}
        </div>

        {recentResearches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentResearches.map((res) => (
              <Card
                key={res.id}
                hoverable
                onClick={() => {
                  setCurrentResearch(res);
                  navigate("/research");
                }}
                className="p-4 bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl shadow-sm space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded uppercase">
                      {res.subjectName || "Academic Report"}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                    {res.topic}
                  </h3>

                  {res.answer?.executiveSummary && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {res.answer.executiveSummary}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {res.filteredSources?.length || res.answer?.citationsList.length || 0} Sources
                  </span>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    <span>Read Synthesis</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Research Reports Yet</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Input a research query in the workbench to generate your first curriculum-aligned synthesis.
            </p>
          </Card>
        )}
      </section>

      {/* University Onboarding / Context Modal */}
      <UniversityOnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        initialProfile={universityProfile}
      />
    </div>
  );
};
