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

  const handleDemoClick = async () => {
    try {
      await loginAsDemoStudent();
      navigate("/dashboard");
    } catch (err) {
      console.error("Demo login error:", err);
    }
  };

  const featureCards = [
    {
      icon: GraduationCap,
      title: "One-Time University Context",
      desc: "Configure your university, degree level, and department once. It persists seamlessly as permanent academic context for every future research inquiry.",
    },
    {
      icon: Search,
      title: "Live Web Search Grounding",
      desc: "Executes real-time multi-tiered queries across official university repositories, IEEE/ACM databases, and institutional course portals.",
    },
    {
      icon: ShieldCheck,
      title: "Authority Tier Filtering",
      desc: "AI evaluates and peer-ranks candidate sources, discarding low-quality articles and prioritizing verified curriculum content.",
    },
    {
      icon: FileCheck,
      title: "Structured Citations & Exam Prep",
      desc: "Synthesizes comprehensive academic reports with numbered in-text citations (APA, IEEE, Harvard), key concepts, and exam focus tips.",
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
              <span className="text-base font-extrabold text-slate-900 tracking-tight">Academia AI</span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200">
                Research Platform
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
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-16 space-y-12 w-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="university" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
            AI Academic Research Platform
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Academic Research Engineered for Your University
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Create your university profile once. Get authoritative, syllabus-aligned web research, peer-ranked literature synthesis, and IEEE/APA citations for any subject.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto font-bold text-base shadow-md shadow-indigo-200 min-h-[48px]"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Get Started Free
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleDemoClick}
              isLoading={isLoading}
              className="w-full sm:w-auto font-semibold min-h-[48px] bg-white"
              leftIcon={<Zap className="w-4 h-4 text-amber-600" />}
            >
              Explore Live Demo
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowShortcutModal(true)}
              className="w-full sm:w-auto font-semibold min-h-[48px] bg-white border-slate-300"
              leftIcon={<Smartphone className="w-4 h-4 text-indigo-600" />}
            >
              App Shortcut (Mobile & Web)
            </Button>
          </div>
        </div>

        {/* Interactive Preview Mock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Phone Shell Preview */}
          <div className="lg:col-span-7 bg-white rounded-[32px] border-[6px] border-slate-900 shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  SU
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight">
                    University Context
                  </p>
                  <p className="text-xs font-bold text-slate-800">Stanford University</p>
                </div>
              </div>
              <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase">
                Semester 4
              </span>
              <span className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded uppercase truncate">
                CS145: Database Systems
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                <h3 className="text-base font-extrabold text-slate-900">Database Normalization</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Advanced research into 3NF and BCNF requirements for academic projects.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Research Status
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span>Validating Stanford curriculum context</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span>Filtering 14 peer-ranked official sources</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                  <span>Generating academic synthesis & APA citations...</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                  98% Match
                </span>
                <span className="text-[10px] text-slate-400">IEEE/ACM Grounded</span>
              </div>
              <p className="text-xs font-bold text-slate-800">CS145 Course Notes: Normal Forms & Schema</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                Decomposition algorithms preserving lossless join and dependency requirements.
              </p>
            </div>
          </div>

          {/* Side Metrics Callout */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Academic Context Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              A professional research platform where your University, Semester, and Course profiles drive every AI insight. No generic answers, only curriculum-aligned truth.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-2xl font-black text-indigo-600 mb-0.5">99%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Source Accuracy
                </p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-2xl font-black text-slate-900 mb-0.5">1.2s</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Synthesis Speed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featureCards.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-5 border border-slate-200/80 hover:border-slate-300 transition-all shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">Academia AI Platform</span>
          </div>
          <p>© 2026 Academic Research Platform. Built with universal AI prompting.</p>
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
