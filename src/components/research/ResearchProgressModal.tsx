import React from "react";
import { Check, Loader2, Sparkles, GraduationCap, X } from "lucide-react";
import { useResearch } from "../../context/ResearchContext";
import { Card } from "../common/Card";

export const ResearchProgressModal: React.FC = () => {
  const { isResearching, currentStage, currentQuery, cancelResearch } = useResearch();

  if (!isResearching && !currentStage) return null;

  const stages = [
    { id: "context", label: "Validating university & course context" },
    { id: "queries", label: "Formulating multi-perspective search queries" },
    { id: "search", label: "Executing live web grounding search" },
    { id: "filtering", label: "Peer-ranking & filtering authoritative sources" },
    { id: "synthesis", label: "Generating structured academic synthesis" },
    { id: "citations", label: "Formatting citations & examination takeaways" },
  ];

  const getStageIndex = (stageKey?: string) => {
    switch (stageKey) {
      case "context_understanding":
        return 0;
      case "query_generation":
        return 1;
      case "web_search":
        return 2;
      case "source_filtering":
        return 3;
      case "synthesis":
        return 4;
      case "citation_formatting":
        return 5;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(currentStage?.stage);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-indigo-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Universal Academic Engine
              </p>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Synthesizing Research
              </h3>
            </div>
          </div>

          <button
            onClick={cancelResearch}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Query Focus */}
        {currentQuery && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              Active Topic Inquiry
            </span>
            <p className="text-xs font-bold text-indigo-950 line-clamp-1">
              {currentQuery}
            </p>
          </div>
        )}

        {/* Geometric Research Status Block */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Research Status
          </h4>

          <div className="space-y-3">
            {stages.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;

              return (
                <div key={stage.id} className="flex items-center gap-3">
                  {isPast ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-200/70 shrink-0" />
                  )}

                  <span
                    className={`text-xs ${
                      isCurrent
                        ? "font-bold text-indigo-700"
                        : isPast
                        ? "font-medium text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Correlating findings against verified university curriculum and peer literature...
        </p>
      </div>
    </div>
  );
};
