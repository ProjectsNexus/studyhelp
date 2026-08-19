import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap,
  Plus,
  HelpCircle,
  Zap,
  BookMarked,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Mic,
  Music,
  Video,
  Type,
  RotateCcw,
  Volume2,
  Check,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Modal } from "../common/Modal";
import { useAuth } from "../../context/AuthContext";
import { useResearch } from "../../context/ResearchContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { LiveAudioRecorder, TranscribedMediaData } from "./inputs/LiveAudioRecorder";
import { AudioUploader } from "./inputs/AudioUploader";
import { VideoUploader } from "./inputs/VideoUploader";

export const ResearchForm: React.FC = () => {
  const {
    universityProfile,
    semesters,
    subjects,
    activeSemester,
    activeSubject,
    addSemester,
    addSubject,
    setActiveSemesterId,
    setActiveSubjectId,
  } = useAuth();

  const { executeResearch, isResearching } = useResearch();
  const toast = useToast();
  const navigate = useNavigate();

  // Input Mode: 'text' | 'audio_file' | 'video_file' | 'live_record'
  const [inputMode, setInputMode] = useState<"text" | "audio_file" | "video_file" | "live_record">("text");
  const [transcribedSource, setTranscribedSource] = useState<{
    mode: "audio_file" | "video_file" | "live_record";
    detectedLanguage: string;
    languageCode: string;
    originalTranscription: string;
    englishTranscription: string;
    suggestedTopic: string;
    summary?: string;
  } | null>(null);

  // Form State
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    activeSemester?.id || (semesters[0]?.id ?? "")
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeSubject?.id || (subjects[0]?.id ?? "")
  );
  const [topic, setTopic] = useState<string>("");
  const [researchType, setResearchType] = useState<
    | "quick_explanation"
    | "detailed_research"
    | "study_notes"
    | "exam_preparation"
    | "assignment_research"
    | "topic_summary"
    | "compare_concepts"
  >("detailed_research");
  const [researchDepth, setResearchDepth] = useState<"basic" | "standard" | "deep">(
    universityProfile?.researchDepth || "standard"
  );
  const [additionalInstructions, setAdditionalInstructions] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Quick modals for adding semester / subject
  const [isAddingSemester, setIsAddingSemester] = useState<boolean>(false);
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
  const [newSemNum, setNewSemNum] = useState<number>(5);
  const [newSemName, setNewSemName] = useState<string>("");
  const [newSubName, setNewSubName] = useState<string>("");
  const [newSubCode, setNewSubCode] = useState<string>("");
  const [newSubDesc, setNewSubDesc] = useState<string>("");

  const filteredSubjects = subjects.filter((s) => !selectedSemesterId || s.semesterId === selectedSemesterId);
  const currentSemester = semesters.find((s) => s.id === selectedSemesterId);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  const contextData = {
    universityName: universityProfile?.name,
    courseName: currentSubject?.name,
    semesterName: currentSemester?.name,
  };

  const handleMediaTranscribed = (
    mode: "audio_file" | "video_file" | "live_record",
    data: TranscribedMediaData
  ) => {
    // English translated topic is placed into the research topic field for downstream processing
    setTopic(data.suggestedTopic || data.englishTranscription);
    setTranscribedSource({
      mode,
      detectedLanguage: data.detectedLanguage,
      languageCode: data.languageCode,
      originalTranscription: data.originalTranscription,
      englishTranscription: data.englishTranscription,
      suggestedTopic: data.suggestedTopic,
      summary: data.summary,
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isResearching) return;

    try {
      await executeResearch({
        topic: topic.trim(),
        semesterId: selectedSemesterId,
        subjectId: selectedSubjectId,
        researchType,
        researchDepth,
        additionalInstructions: additionalInstructions.trim() || undefined,
      });
      navigate("/research");
    } catch (err) {
      console.error("Research trigger error:", err);
      toast.firebaseError(err, "Academic research pipeline encountered an error.");
    }
  };

  const handleCreateSemester = async () => {
    if (!newSemName.trim()) return;
    try {
      const created = await addSemester({
        semesterNumber: newSemNum,
        name: newSemName.trim(),
        program: universityProfile?.program,
      });
      toast.success(`Semester ${newSemNum} (${newSemName.trim()}) created!`);
      setSelectedSemesterId(created.id!);
      setActiveSemesterId(created.id!);
      setIsAddingSemester(false);
      setNewSemName("");
    } catch (err) {
      toast.firebaseError(err, "Failed to create semester.");
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubName.trim()) return;
    try {
      const created = await addSubject({
        semesterId: selectedSemesterId || semesters[0]?.id || "default",
        name: newSubName.trim(),
        courseCode: newSubCode.trim() || undefined,
        description: newSubDesc.trim() || undefined,
      });
      toast.success(`Subject '${newSubName.trim()}' added!`);
      setSelectedSubjectId(created.id!);
      setActiveSubjectId(created.id!);
      setIsAddingSubject(false);
      setNewSubName("");
      setNewSubCode("");
      setNewSubDesc("");
    } catch (err) {
      toast.firebaseError(err, "Failed to create subject.");
    }
  };

  const academicTopicsSuggestions = [
    {
      topic: "Pathophysiology of Diabetic Ketoacidosis (DKA) & Fluid Resuscitation Protocols",
      subject: "MED-401: Clinical Medicine & Pharmacology (KEMU / AKU / AMC)",
      type: "exam_preparation" as const,
      category: "Medical",
    },
    {
      topic: "Beta-Lactam Antibiotics Mechanism & Bacterial Resistance Pathways",
      subject: "PHARM-302: Medical Pharmacology (UHS / King Edward / FJMU)",
      type: "study_notes" as const,
      category: "Medical",
    },
    {
      topic: "First-Line Management of Acute Coronary Syndrome (STEMI vs NSTEMI)",
      subject: "CARD-501: Clinical Cardiology & Emergency Medicine (AKU / PIMS)",
      type: "detailed_research" as const,
      category: "Medical",
    },
    {
      topic: "Cardiac Action Potential Phases in Myocytes vs Pacemaker Cells",
      subject: "PHYS-101: Medical Physiology (Dow / Army Medical College)",
      type: "compare_concepts" as const,
      category: "Medical",
    },
    {
      topic: "Database Normalization (3NF vs BCNF proofs)",
      subject: "CS-214: Database Systems (NUST / FAST)",
      type: "compare_concepts" as const,
      category: "Engineering",
    },
    {
      topic: "Dijkstra vs A* Shortest Path Complexity",
      subject: "CS-211: Design & Analysis of Algorithms (LUMS / UET)",
      type: "exam_preparation" as const,
      category: "Engineering",
    },
    {
      topic: "Deadlock Prevention & Banker's Algorithm",
      subject: "CS-225: Operating Systems (FAST Islamabad / COMSATS)",
      type: "detailed_research" as const,
      category: "Engineering",
    },
    {
      topic: "Pakistan's Monetary Policy Transmission & Inflation",
      subject: "ECON-301: Macroeconomics (QAU / LSE)",
      type: "study_notes" as const,
      category: "Business",
    },
  ];

  const researchTypesList = [
    { id: "quick_explanation", label: "Quick Concept", icon: Clock, desc: "Fast intuitive summary & takeaways" },
    { id: "exam_preparation", label: "Exam Prep", icon: Zap, desc: "Formulas, pitfalls, & scoring tips" },
    { id: "study_notes", label: "Study Notes", icon: BookMarked, desc: "Structured lecture review notes" },
    { id: "compare_concepts", label: "Compare Models", icon: Layers, desc: "Dimensional contrast & matrix" },
    { id: "detailed_research", label: "Detailed Research", icon: FileText, desc: "Full academic monograph & analysis" },
    { id: "topic_summary", label: "Topic Summary", icon: FileText, desc: "Executive summary & key findings" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Persistent Academic Context Header */}
      {universityProfile && (
        <div className="p-3.5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {universityProfile.name}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-indigo-200/80 truncate">
                {universityProfile.degree} in {universityProfile.program} • {universityProfile.citationPreference.toUpperCase()} Citations
              </p>
            </div>
          </div>
          <Badge variant="university" size="sm" className="hidden sm:inline-flex bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
            Active Context
          </Badge>
        </div>
      )}

      {/* Main Research Input Card */}
      <Card className="border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5">
        {/* Semester & Subject Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Semester Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Academic Semester
              </label>
              <button
                type="button"
                onClick={() => setIsAddingSemester(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>
            <select
              value={selectedSemesterId}
              onChange={(e) => {
                setSelectedSemesterId(e.target.value);
                setActiveSemesterId(e.target.value);
              }}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  Semester {s.semesterNumber} - {s.name}
                </option>
              ))}
              {semesters.length === 0 && <option value="">No Semesters (Default Term)</option>}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Course / Subject
              </label>
              <button
                type="button"
                onClick={() => setIsAddingSubject(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setActiveSubjectId(e.target.value);
              }}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            >
              {filteredSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.courseCode ? `[${sub.courseCode}] ` : ""}
                  {sub.name}
                </option>
              ))}
              {filteredSubjects.length === 0 && (
                <option value="">General Coursework</option>
              )}
            </select>
          </div>
        </div>

        {/* 4 Input Modes Segmented Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Input Mode (4 Modalities)
            </label>
            <span className="text-[11px] text-slate-500">
              {inputMode === "text" && "Standard Text / Syllabus Prompts"}
              {inputMode === "audio_file" && "Upload Audio (MP3/WAV/M4A/AAC)"}
              {inputMode === "video_file" && "Upload Video (Extract Audio Track)"}
              {inputMode === "live_record" && "Record Live Voice / Lecture"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            {/* Mode 1: Text */}
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inputMode === "text"
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Type className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Text Prompt</span>
            </button>

            {/* Mode 2: Audio File */}
            <button
              type="button"
              onClick={() => setInputMode("audio_file")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inputMode === "audio_file"
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Music className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Audio File</span>
            </button>

            {/* Mode 3: Video File */}
            <button
              type="button"
              onClick={() => setInputMode("video_file")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inputMode === "video_file"
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Video className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Video File</span>
            </button>

            {/* Mode 4: Live Audio Recording */}
            <button
              type="button"
              onClick={() => setInputMode("live_record")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inputMode === "live_record"
                  ? "bg-white text-red-900 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Mic className="w-4 h-4 text-red-600 shrink-0" />
              <span>Live Record</span>
            </button>
          </div>
        </div>

        {/* Mode Specific Input Canvas */}
        {inputMode === "live_record" && (
          <div className="animate-in fade-in duration-200">
            <LiveAudioRecorder
              context={contextData}
              onTranscribed={(data) => handleMediaTranscribed("live_record", data)}
            />
          </div>
        )}

        {inputMode === "audio_file" && (
          <div className="animate-in fade-in duration-200">
            <AudioUploader
              context={contextData}
              onTranscribed={(data) => handleMediaTranscribed("audio_file", data)}
            />
          </div>
        )}

        {inputMode === "video_file" && (
          <div className="animate-in fade-in duration-200">
            <VideoUploader
              context={contextData}
              onTranscribed={(data) => handleMediaTranscribed("video_file", data)}
            />
          </div>
        )}

        {/* Transcribed Source Banner & Topic Editor */}
        {transcribedSource && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-xs font-bold text-indigo-950">
                  Transcribed from{" "}
                  {transcribedSource.mode === "live_record"
                    ? "Live Microphone"
                    : transcribedSource.mode === "audio_file"
                    ? "Audio File"
                    : "Video Lecture"}
                </span>
                <span className="text-[11px] bg-white border border-indigo-200 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                  Spoken in: {transcribedSource.detectedLanguage}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTranscribedSource(null);
                  setTopic("");
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Media</span>
              </button>
            </div>

            {/* Original Spoken Language Text */}
            <div className="text-xs text-slate-700 bg-white/90 p-2.5 rounded-xl border border-indigo-100/80 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Original Audio Transcript ({transcribedSource.detectedLanguage}):
              </span>
              <p className="italic text-slate-800">
                "{transcribedSource.originalTranscription}"
              </p>
            </div>

            <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Converted to English query below for the academic research pipeline.</span>
            </div>
          </div>
        )}

        {/* Topic Input Field (Active for all modes, auto-populated when audio/video transcribed) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Research Topic or Question (in English)
            </label>
            {transcribedSource && (
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <Check className="w-3 h-3" /> English Query Active
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleSubmit();
                }
              }}
              placeholder={
                inputMode === "text"
                  ? "e.g. Medical: Pathophysiology of DKA & fluid resuscitation protocols | CS: Compare 3NF vs BCNF decomposition proofs | Bio: Mechanism of Action of Beta-Lactam antibiotics..."
                  : "Transcribed research query will appear here automatically in English. You can also refine or edit it before executing..."
              }
              className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none transition-colors break-words"
            />
          </div>
        </div>

        {/* Suggested Prompts Chips (Visible in Text Mode or as inspiration) */}
        {inputMode === "text" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Suggested Academic Prompts (Medical, Engineering & Business)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {academicTopicsSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(item.topic);
                    setResearchType(item.type);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-all text-left cursor-pointer flex items-center gap-1.5 max-w-full break-words"
                >
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    item.category === "Medical"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : item.category === "Engineering"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {item.category}
                  </span>
                  <span className="truncate max-w-[280px] sm:max-w-xs">{item.topic}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Research Type Selection Chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Research Output Format
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {researchTypesList.map((t) => {
              const Icon = t.icon;
              const isSelected = researchType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setResearchType(t.id as any)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600/30"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isSelected ? "text-indigo-600" : "text-slate-400"
                    }`}
                  />
                  <div>
                    <span className="block text-xs font-bold leading-tight">{t.label}</span>
                    <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">
                      {t.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span>{showAdvanced ? "Hide Advanced Calibration" : "Show Advanced Calibration (Depth & Notes)"}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 bg-slate-50 rounded-xl space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Search & Synthesis Depth"
                  value={researchDepth}
                  onChange={(e) => setResearchDepth(e.target.value as any)}
                  options={[
                    { value: "standard", label: "Standard Academic (4-6 Sources)" },
                    { value: "deep", label: "Exhaustive Literature Deep-Dive (8+ Sources)" },
                    { value: "basic", label: "Concise Quick Digest (2-4 Sources)" },
                  ]}
                />

                <Input
                  label="Additional Custom Instructions"
                  placeholder="e.g. Emphasize HEC curriculum guidelines, include C++/Python code snippets, solve past exam problems"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!topic.trim() || isResearching}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          {isResearching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Academic Analysis...</span>
            </>
          ) : (
            <>
              <span>Execute Academic Research</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </Card>

      {/* Modal: Quick Create Semester */}
      <Modal
        isOpen={isAddingSemester}
        onClose={() => setIsAddingSemester(false)}
        title="Add Academic Semester"
        subtitle="Create a semester profile for your degree program"
      >
        <div className="space-y-4">
          <Input
            label="Semester Number"
            type="number"
            min={1}
            max={12}
            value={newSemNum}
            onChange={(e) => setNewSemNum(Number(e.target.value))}
            required
          />
          <Input
            label="Semester Name / Title"
            placeholder="e.g. Spring 2026 (Semester 4) or Fall Semester (Semester 3)"
            value={newSemName}
            onChange={(e) => setNewSemName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setIsAddingSemester(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleCreateSemester} disabled={!newSemName.trim()}>
              Save Semester
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Quick Create Subject */}
      <Modal
        isOpen={isAddingSubject}
        onClose={() => setIsAddingSubject(false)}
        title="Add Course / Subject"
        subtitle="Attach a subject to your active semester"
      >
        <div className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Database Systems, Data Structures & Algorithms, Digital Logic Design"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            required
          />
          <Input
            label="Course Code (Optional)"
            placeholder="e.g. CS-214, CS-201, EE-110, HU-101"
            value={newSubCode}
            onChange={(e) => setNewSubCode(e.target.value)}
          />
          <Input
            label="Course Description / Topics (Optional)"
            placeholder="e.g. Relational models, normal forms, B+ Trees, and SQL optimization aligned with HEC course outline"
            value={newSubDesc}
            onChange={(e) => setNewSubDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setIsAddingSubject(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleCreateSubject} disabled={!newSubName.trim()}>
              Save Subject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
