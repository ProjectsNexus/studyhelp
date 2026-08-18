import React from "react";
import { useResearch } from "../context/ResearchContext";
import { ResearchForm } from "../components/research/ResearchForm";
import { ResearchResultView } from "../components/research/ResearchResultView";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "../components/common/Button";

export const ResearchPage: React.FC = () => {
  const { currentResearch, setCurrentResearch } = useResearch();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {currentResearch ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Research Synthesis
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentResearch(null)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Research Query
            </Button>
          </div>
          <ResearchResultView
            research={currentResearch}
            onBack={() => setCurrentResearch(null)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Academic Research Engine
            </h1>
          </div>
          <ResearchForm />
        </div>
      )}
    </div>
  );
};
