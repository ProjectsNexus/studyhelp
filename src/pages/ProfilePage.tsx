import React, { useState } from "react";
import {
  GraduationCap,
  Building2,
  BookOpen,
  Sliders,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Edit2,
  LogOut,
  Sparkles,
  Smartphone,
  Download,
  Laptop,
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Select } from "../components/common/Select";
import { useAuth } from "../context/AuthContext";
import { SemesterSubjectManager } from "../components/academic/SemesterSubjectManager";
import { UniversityOnboardingModal } from "../components/university/UniversityOnboardingModal";
import { AppShortcutModal } from "../components/common/AppShortcutModal";

export const ProfilePage: React.FC = () => {
  const { user, universityProfile, saveUniversityProfile, logout } = useAuth();
  const [showEditOnboarding, setShowEditOnboarding] = useState(false);
  const [showShortcutModal, setShowShortcutModal] = useState(false);
  const [citationPref, setCitationPref] = useState(universityProfile?.citationPreference || "apa");
  const [answerStyle, setAnswerStyle] = useState(universityProfile?.answerStyle || "balanced");
  const [researchDepth, setResearchDepth] = useState(universityProfile?.researchDepth || "standard");
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdatePreferences = async () => {
    if (!universityProfile) return;
    setIsSavingPrefs(true);
    try {
      await saveUniversityProfile({
        ...universityProfile,
        citationPreference: citationPref as any,
        answerStyle: answerStyle as any,
        researchDepth: researchDepth as any,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update preferences:", err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Context & Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Institutional credentials and universal prompt calibration
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign Out
        </Button>
      </div>

      {/* University Context Profile Card */}
      {universityProfile ? (
        <Card className="p-5 sm:p-7 border border-slate-200/90 bg-white space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{universityProfile.name}</h2>
                  {universityProfile.verified && (
                    <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {universityProfile.city ? `${universityProfile.city}, ` : ""}
                  {universityProfile.country}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditOnboarding(true)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Reconfigure
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Degree</span>
              <span className="font-semibold text-slate-900">{universityProfile.degree}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Program</span>
              <span className="font-semibold text-slate-900">{universityProfile.program}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty / Department</span>
              <span className="font-semibold text-slate-900">{universityProfile.department}</span>
            </div>
          </div>

          {universityProfile.verificationNotes && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p>{universityProfile.verificationNotes}</p>
            </div>
          )}

          {/* Official URLs & Library Resources */}
          {universityProfile.officialUrls && universityProfile.officialUrls.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Institutional Portals
              </span>
              <div className="flex flex-wrap gap-2">
                {universityProfile.officialUrls.map((u, i) => (
                  <a
                    key={i}
                    href={u.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-medium transition-colors"
                  >
                    <span>{u.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6 text-center space-y-3">
          <p className="text-sm text-slate-600">No university profile configured yet.</p>
          <Button size="md" onClick={() => setShowEditOnboarding(true)}>
            Configure University Context
          </Button>
        </Card>
      )}

      {/* Academic Calibration & Citation Preference */}
      <Card className="p-5 sm:p-7 border border-slate-200/90 bg-white space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Research & Citation Calibration</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Citation Standard"
            value={citationPref}
            onChange={(e) => setCitationPref(e.target.value as any)}
            options={[
              { value: "apa", label: "APA 7th Edition" },
              { value: "ieee", label: "IEEE Style (Engineering)" },
              { value: "harvard", label: "Harvard Referencing" },
              { value: "mla", label: "MLA 9th Edition" },
              { value: "chicago", label: "Chicago Style" },
            ]}
          />

          <Select
            label="Synthesis Rigor"
            value={answerStyle}
            onChange={(e) => setAnswerStyle(e.target.value as any)}
            options={[
              { value: "balanced", label: "Balanced Pedagogical" },
              { value: "rigorous", label: "Rigorous & Formal" },
              { value: "exam_oriented", label: "Exam-Oriented" },
              { value: "simplified", label: "Concept-First Intuitive" },
            ]}
          />

          <Select
            label="Default Depth"
            value={researchDepth}
            onChange={(e) => setResearchDepth(e.target.value as any)}
            options={[
              { value: "standard", label: "Standard (4-6 Sources)" },
              { value: "deep", label: "Deep-Dive (8+ Sources)" },
              { value: "basic", label: "Concise Digest" },
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-600">Preferences updated!</span>
          ) : (
            <span className="text-xs text-slate-400">Applies to all subsequent research queries</span>
          )}
          <Button
            size="sm"
            onClick={handleUpdatePreferences}
            isLoading={isSavingPrefs}
          >
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* Course & Semester Catalogue Manager */}
      <SemesterSubjectManager />

      {/* App Shortcut & Installation Section */}
      <Card className="p-5 sm:p-7 border border-slate-200/90 bg-white space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mobile & Web App Shortcut (PWA)
              </h3>
              <p className="text-xs text-slate-500">
                Install Academia AI as a standalone app on your iPhone, Android, or PC/Mac
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShortcutModal(true)}
            leftIcon={<Smartphone className="w-4 h-4 text-indigo-600" />}
          >
            Create Shortcut
          </Button>
        </div>
      </Card>

      {/* University Edit Onboarding Modal */}
      <UniversityOnboardingModal
        isOpen={showEditOnboarding}
        onClose={() => setShowEditOnboarding(false)}
        initialProfile={universityProfile}
      />

      {/* App Shortcut Modal */}
      <AppShortcutModal
        isOpen={showShortcutModal}
        onClose={() => setShowShortcutModal(false)}
      />
    </div>
  );
};
