import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  Search,
  BookOpen,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  Zap,
  Layers,
  CheckCircle2,
  Download,
  Smartphone,
  Mic,
  FileAudio,
  Video,
  Languages,
  BookMarked,
  Scale,
  Clock,
  ExternalLink,
  Laptop,
  Share2,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { AppShortcutModal } from "../components/common/AppShortcutModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginAsDemoStudent, isLoading } = useAuth();
  const [showShortcutModal, setShowShortcutModal] = useState<boolean>(false);
  const [activeInputDemo, setActiveInputDemo] = useState<"text" | "live_mic" | "audio" | "video">("live_mic");

  const handleDemoClick = async () => {
    try {
      await loginAsDemoStudent();
      navigate("/dashboard");
    } catch (err) {
      console.error("Demo login error:", err);
    }
  };

  const inputModes = [
    {
      id: "text",
      title: "Text Prompts",
      badge: "Direct Input",
      icon: Search,
      desc: "Type or paste complex academic questions, problem sets, or research topics with syllabus context.",
      detail: "Direct natural language queries formatted with university & course objectives.",
    },
    {
      id: "live_mic",
      title: "Live Microphone",
      badge: "Speech to Text",
      icon: Mic,
      desc: "Record live lecture questions or study group discussions directly with real-time waveform capture.",
      detail: "Real-time speech transcription with instant translation to academic English.",
    },
    {
      id: "audio",
      title: "Audio Upload",
      badge: ".MP3, .WAV, .M4A",
      icon: FileAudio,
      desc: "Upload recorded lectures, seminars, podcasts, or voice memos in any spoken language.",
      detail: "Automatic speech-to-text transcription with original language preservation & English conversion.",
    },
    {
      id: "video",
      title: "Video-to-Audio",
      badge: ".MP4, .MOV, .WEBM",
      icon: Video,
      desc: "Upload lecture videos or classroom recordings. The engine automatically extracts audio and synthesizes notes.",
      detail: "Seamless audio stream extraction, multilingual transcription, and structured synthesis.",
    },
  ];

  const featureCards = [
    {
      icon: Languages,
      title: "Multilingual Speech & Auto-Translation",
      badge: "Any Language",
      desc: "Speak or upload media in Spanish, French, German, Mandarin, Hindi, Arabic, or any world language. StudyHelper transcribes the native speech and auto-translates it into academic English for literature synthesis.",
    },
    {
      icon: GraduationCap,
      title: "Persistent Institutional Context",
      badge: "One-Time Setup",
      desc: "Configure your university, degree level, and department once. It persists seamlessly as permanent academic context across all subjects, semesters, and research inquiries.",
    },
    {
      icon: Layers,
      title: "Semester & Coursework Manager",
      badge: "Curriculum Aligned",
      desc: "Organize your enrolled courses by term. Every research inquiry aligns directly with specific course codes, learning objectives, and pedagogical requirements.",
    },
    {
      icon: BookMarked,
      title: "Multiple Targeted Output Formats",
      badge: "5+ Formats",
      desc: "Generate tailored outputs: Quick Concept Breakdowns, High-Yield Exam Tips & Pitfalls, Revision Study Notes, Comparative Matrix Models, or Detailed Academic Monographs.",
    },
    {
      icon: ShieldCheck,
      title: "Peer-Ranked Source Grounding",
      badge: "Verified Literature",
      desc: "Multi-tiered web search across official university domains, IEEE/ACM repositories, and scholarly publications with 8-tier domain authority filtering.",
    },
    {
      icon: FileCheck,
      title: "Standardized Citation Formats",
      badge: "APA • IEEE • Harvard",
      desc: "Formatted citations in APA 7th Edition, IEEE, Harvard Referencing, MLA 9th, or Chicago style with copyable inline references and source links.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Navigation Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">StudyHelper</span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200">
                Academic Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcutModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors shadow-2xs"
              title="Add to Home Screen or Desktop"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xs:inline">App Shortcut</span>
            </button>

            {user ? (
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="font-bold shadow-xs"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <Button
                  size="sm"
                  onClick={handleDemoClick}
                  isLoading={isLoading}
                  className="font-bold shadow-xs"
                >
                  Try Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-16 w-full">
        {/* Top Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="university" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Multimodal Academic Study & Research Engine
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            The Universal Study Companion for Higher Education
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            StudyHelper unifies <strong>4 multimodal input modes</strong> (Text, Live Mic, Audio, Video), multilingual speech transcription, university syllabus alignment, and verified peer-ranked citations into one seamless platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto font-bold text-base shadow-md shadow-indigo-200 min-h-[48px]"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Start Studying Free
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleDemoClick}
              isLoading={isLoading}
              className="w-full sm:w-auto font-semibold min-h-[48px] bg-white border-slate-200"
              leftIcon={<Zap className="w-4 h-4 text-amber-600" />}
            >
              Explore Instant Demo
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowShortcutModal(true)}
              className="w-full sm:w-auto font-semibold min-h-[48px] bg-white border-slate-300"
              leftIcon={<Smartphone className="w-4 h-4 text-indigo-600" />}
            >
              PWA App Shortcut
            </Button>
          </div>
        </div>

        {/* 4 Multimodal Input Modes Interactive Showcase */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              4 Multimodal Input Modes
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Study by Text, Voice, Audio, or Video
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Input queries in any format or language. StudyHelper extracts, translates, and synthesizes syllabus-ready knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {inputModes.map((m) => {
              const Icon = m.icon;
              const isSelected = activeInputDemo === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveInputDemo(m.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all space-y-2.5 ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/20"
                      : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {m.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Multimodal Preview Showcase Box */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Multimodal Pipeline Active: {inputModes.find((m) => m.id === activeInputDemo)?.title}
                </span>
              </div>
              <span className="text-xs text-indigo-400 font-mono">Multilingual Speech → English Synthesis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">1. Raw Input & Capture</span>
                <p className="text-slate-200 font-medium">
                  {activeInputDemo === "text" && "Written topic: 'Explain Boyce-Codd Normal Form with decomposition proofs'"}
                  {activeInputDemo === "live_mic" && "Live Audio: '¿Cómo funciona el algoritmo de Dijkstra en grafos dirigidos?' (Spanish)"}
                  {activeInputDemo === "audio" && "Lecture File: seminar_quantum_entanglement.mp3 recorded in German"}
                  {activeInputDemo === "video" && "Video Recording: classroom_macroeconomics_lec4.mp4 with audio extraction"}
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] text-indigo-300 font-bold uppercase">2. Native Speech & English Translation</span>
                <p className="text-slate-200 font-medium">
                  {activeInputDemo === "text" && "Parsed context & aligned against active course learning objectives."}
                  {activeInputDemo === "live_mic" && "Transcribed Spanish audio → Auto-translated to English for literature grounding."}
                  {activeInputDemo === "audio" && "German speech parsed → English academic query formulated with syllabus depth."}
                  {activeInputDemo === "video" && "Audio stream isolated → Multilingual speech transcribed and translated."}
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] text-emerald-300 font-bold uppercase">3. Synthesis & Citations</span>
                <p className="text-slate-200 font-medium">
                  Authoritative academic dossier generated in chosen style (APA / IEEE) with high-yield exam takeaways.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              Core Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Engineered for Academic Rigor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything university students, professors, and researchers need to master complex coursework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCards.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card
                  key={i}
                  className="p-5 border border-slate-200/80 hover:border-indigo-300 transition-all shadow-xs space-y-3 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Output Formats Showcase */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              Tailored Output Formats
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              One Query, Any Study Format
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Toggle between quick concept digests, examination revision guides, or full academic monographs with verified citations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-300" />
                <h3 className="text-sm font-bold text-white">Quick Concept Breakdown</h3>
              </div>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Intuitive definition, primary mechanism, and essential takeaway bullet points in plain English.
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold text-white">High-Yield Exam Prep</h3>
              </div>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Exam pitfalls, assessment traps, scoring criteria, and foundational formulas to memorize.
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-indigo-300" />
                <h3 className="text-sm font-bold text-white">Revision Study Notes</h3>
              </div>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Structured concept cards, deep explanations, and concrete real-world academic examples.
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-300" />
                <h3 className="text-sm font-bold text-white">Comparative Matrix</h3>
              </div>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Multi-dimensional comparative analysis contrasting competing models, frameworks, and trade-offs.
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-300" />
                <h3 className="text-sm font-bold text-white">Detailed Monograph & Citations</h3>
              </div>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Comprehensive academic synthesis with numbered in-text citations (APA, IEEE, Harvard) and verified bibliography links.
              </p>
            </div>
          </div>
        </div>

        {/* PWA & Mobile Install Callout */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                PWA Mobile & Desktop Shortcuts
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Install StudyHelper as an App on Any Device
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Add StudyHelper to your iPhone Home Screen (Safari), Android (Chrome), or PC/Mac desktop for 1-tap instant full-screen access.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setShowShortcutModal(true)}
            leftIcon={<Download className="w-4 h-4" />}
            className="shrink-0 font-bold min-h-[48px]"
          >
            Create App Shortcut
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">StudyHelper Academic Platform</span>
          </div>
          <p>© 2026 StudyHelper. Universal Multimodal Academic Research & Coursework Engine.</p>
        </div>
      </footer>

      {/* App Shortcut Modal */}
      <AppShortcutModal
        isOpen={showShortcutModal}
        onClose={() => setShowShortcutModal(false)}
      />
    </div>
  );
};
