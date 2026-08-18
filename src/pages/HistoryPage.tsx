import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  Trash2,
  RotateCw,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { useResearch } from "../context/ResearchContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const HistoryPage: React.FC = () => {
  const { researchHistory, setCurrentResearch, reRunResearch, deleteResearch, isResearching } =
    useResearch();
  const { semesters, subjects } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const navigate = useNavigate();

  const filteredHistory = researchHistory.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subjectName && item.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.courseCode && item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      filterSubject === "all" || item.subjectId === filterSubject || item.subjectName === filterSubject;

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Research History
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Saved evidence-backed syntheses, peer-ranked references, and formatted citations.
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 border border-slate-200 bg-white space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search past research topics or course names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* History Items List */}
      <div className="space-y-3">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <Card
              key={item.id}
              className="p-4 sm:p-5 border border-slate-200/90 hover:border-indigo-300 bg-white space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {item.subjectName && (
                    <Badge variant="department" size="sm" icon={<BookOpen className="w-3 h-3" />}>
                      {item.courseCode ? `[${item.courseCode}] ` : ""}
                      {item.subjectName}
                    </Badge>
                  )}
                  {item.semesterName && (
                    <Badge variant="default" size="sm" icon={<Layers className="w-3 h-3" />}>
                      {item.semesterName}
                    </Badge>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => reRunResearch(item.id)}
                    disabled={isResearching}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Refresh research with fresh literature"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteResearch(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete research entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                onClick={() => {
                  setCurrentResearch(item);
                  navigate("/research");
                }}
                className="cursor-pointer space-y-1.5 group"
              >
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.topic}
                </h3>
                {item.answer?.executiveSummary && (
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {item.answer.executiveSummary}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-mono">
                  {item.filteredSources?.length || item.answer?.citationsList.length || 0} peer sources
                </span>

                <button
                  onClick={() => {
                    setCurrentResearch(item);
                    navigate("/research");
                  }}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Open Full Synthesis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-10 text-center border-dashed border-2 border-slate-200 rounded-3xl space-y-2">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Research Reports Found</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {searchQuery ? "No matches found for your search query." : "Perform academic research to start building your library."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
