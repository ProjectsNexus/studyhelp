import React, { useState } from "react";
import {
  GraduationCap,
  Building2,
  BookOpen,
  Sliders,
  CheckCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  ShieldCheck,
  X,
  FastForward,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { useAuth } from "../../context/AuthContext";
import { UniversityProfile } from "../../types";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialProfile?: UniversityProfile | null;
}

export const UniversityOnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
}) => {
  const { saveUniversityProfile, setNeedsOnboarding } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: initialProfile?.name || "",
    website: initialProfile?.website || "",
    country: initialProfile?.country || "United States",
    city: initialProfile?.city || "",
    degree: initialProfile?.degree || "Bachelor of Science",
    program: initialProfile?.program || "Computer Science",
    department: initialProfile?.department || "Computer Science & Engineering",
    academicLevel: initialProfile?.academicLevel || "undergraduate",
    currentSemester: 4,
    preferredLanguage: initialProfile?.preferredLanguage || "English",
    answerStyle: initialProfile?.answerStyle || "balanced",
    citationPreference: initialProfile?.citationPreference || "apa",
    researchDepth: initialProfile?.researchDepth || "standard",
  });

  // Verification Extracted Data
  const [verifiedData, setVerifiedData] = useState<{
    universityName: string;
    officialWebsite?: string;
    academicSystem?: string;
    verified: boolean;
    verificationNotes: string;
    officialUrls?: { title: string; url: string; type: string }[];
    departments?: { name: string; description?: string }[];
    academicResources?: { title: string; url: string; description?: string }[];
    researchSources: { title: string; url: string }[];
  } | null>(null);

  if (!isOpen) return null;

  const handleSkip = () => {
    setNeedsOnboarding(false);
    if (onClose) onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVerify = async () => {
    if (!formData.name.trim()) {
      setError("Please enter your university name.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/university/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          website: formData.website,
          country: formData.country,
          city: formData.city,
          degree: formData.degree,
          program: formData.program,
          department: formData.department,
        }),
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.message || "Failed to verify university profile.");
      }

      setVerifiedData(res.data);
      if (res.data.officialWebsite && !formData.website) {
        setFormData((prev) => ({ ...prev, website: res.data.officialWebsite }));
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Verification encountered a problem");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveUniversityProfile({
        name: formData.name,
        website: formData.website,
        country: formData.country,
        city: formData.city,
        degree: formData.degree,
        program: formData.program,
        department: formData.department,
        academicLevel: formData.academicLevel as any,
        academicSystem: verifiedData?.academicSystem || "Semester System",
        preferredLanguage: formData.preferredLanguage,
        answerStyle: formData.answerStyle as any,
        citationPreference: formData.citationPreference as any,
        researchDepth: formData.researchDepth as any,
        officialUrls: verifiedData?.officialUrls || [],
        departments: verifiedData?.departments || [],
        academicResources: verifiedData?.academicResources || [],
        researchSources: verifiedData?.researchSources || [],
        verified: verifiedData ? verifiedData.verified : true,
        verificationNotes: verifiedData?.verificationNotes || "Self-configured university profile.",
      });

      if (onClose) onClose();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to save profile to Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  const universityPresets = [
    { name: "Stanford University", country: "United States", city: "Stanford, CA", site: "https://stanford.edu" },
    { name: "Massachusetts Institute of Technology (MIT)", country: "United States", city: "Cambridge, MA", site: "https://mit.edu" },
    { name: "University of Oxford", country: "United Kingdom", city: "Oxford", site: "https://ox.ac.uk" },
    { name: "National University of Singapore (NUS)", country: "Singapore", city: "Singapore", site: "https://nus.edu.sg" },
    { name: "University of Toronto", country: "Canada", city: "Toronto, ON", site: "https://utoronto.ca" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header with Step indicator & Skip */}
        <div className="bg-slate-900 text-white p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Academic Context Onboarding
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
                title="Skip setup and configure anytime later"
              >
                <span>Skip for now</span>
                <FastForward className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="Close and skip setup"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {step === 1 && "Your University"}
              {step === 2 && "Degree & Academic Program"}
              {step === 3 && "Research & Citation Preferences"}
              {step === 4 && "University Profile Verification"}
            </h2>
            <span className="text-xs font-medium text-slate-400">Step {step} of 4</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {step === 1 && "Set your university once. It becomes the permanent context for all future research."}
            {step === 2 && "Specify your department and degree level to calibrate research rigor."}
            {step === 3 && "Customize citation formats (APA, IEEE, Harvard) and synthesis style."}
            {step === 4 && "AI will verify your institution, course structures, and official academic resources."}
          </p>

          {/* Progress bar */}
          <div className="grid grid-cols-4 gap-1.5 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-indigo-500" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: University */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="University Name"
                placeholder="e.g. Stanford University, MIT, University of Oxford"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                leftIcon={<Building2 className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Country"
                  placeholder="e.g. United States, United Kingdom, Canada"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                />
                <Input
                  label="City / Campus (Optional)"
                  placeholder="e.g. Stanford, Cambridge"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>

              <Input
                label="University Website (Optional)"
                placeholder="e.g. https://stanford.edu"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                helperText="If omitted, AI will discover official institutional domains during verification."
              />

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Popular Institutions (Quick Select)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {universityPresets.map((u) => (
                    <button
                      key={u.name}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          name: u.name,
                          country: u.country,
                          city: u.city,
                          website: u.site,
                        }));
                      }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      {u.name.split(" ")[0]} ({u.country})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Program */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Academic Level"
                  value={formData.academicLevel}
                  onChange={(e) => handleInputChange("academicLevel", e.target.value)}
                  options={[
                    { value: "undergraduate", label: "Undergraduate (Bachelor's)" },
                    { value: "graduate", label: "Graduate (Master's)" },
                    { value: "doctorate", label: "Doctorate (Ph.D.)" },
                    { value: "postgraduate", label: "Postgraduate Diploma" },
                    { value: "diploma", label: "Associate / Diploma" },
                  ]}
                />
                <Input
                  label="Degree Type"
                  placeholder="e.g. Bachelor of Science, B.Tech, Master of Arts"
                  value={formData.degree}
                  onChange={(e) => handleInputChange("degree", e.target.value)}
                  required
                />
              </div>

              <Input
                label="Major / Academic Program"
                placeholder="e.g. Computer Science, Mechanical Engineering, Economics"
                value={formData.program}
                onChange={(e) => handleInputChange("program", e.target.value)}
                leftIcon={<BookOpen className="w-4 h-4" />}
                required
              />

              <Input
                label="Faculty / Academic Department"
                placeholder="e.g. School of Engineering, Department of Computer Science"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
              />

              <Select
                label="Current Semester"
                value={formData.currentSemester}
                onChange={(e) => handleInputChange("currentSemester", Number(e.target.value))}
                options={[
                  { value: 1, label: "Semester 1 (Year 1 - Fall)" },
                  { value: 2, label: "Semester 2 (Year 1 - Spring)" },
                  { value: 3, label: "Semester 3 (Year 2 - Fall)" },
                  { value: 4, label: "Semester 4 (Year 2 - Spring)" },
                  { value: 5, label: "Semester 5 (Year 3 - Fall)" },
                  { value: 6, label: "Semester 6 (Year 3 - Spring)" },
                  { value: 7, label: "Semester 7 (Year 4 - Fall)" },
                  { value: 8, label: "Semester 8 (Year 4 - Spring)" },
                ]}
              />
            </div>
          )}

          {/* STEP 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Citation Style Preference"
                  value={formData.citationPreference}
                  onChange={(e) => handleInputChange("citationPreference", e.target.value)}
                  options={[
                    { value: "apa", label: "APA 7th Edition (Standard Social/Sciences)" },
                    { value: "ieee", label: "IEEE (Engineering & Computer Science)" },
                    { value: "harvard", label: "Harvard Referencing (Author-Date)" },
                    { value: "mla", label: "MLA 9th Edition (Humanities)" },
                    { value: "chicago", label: "Chicago Manual of Style" },
                  ]}
                />
                <Select
                  label="Answer Synthesis Style"
                  value={formData.answerStyle}
                  onChange={(e) => handleInputChange("answerStyle", e.target.value)}
                  options={[
                    { value: "rigorous", label: "Rigorous & Academic (Formal Proofs & Terms)" },
                    { value: "balanced", label: "Balanced Pedagogical (Clear & Detailed)" },
                    { value: "exam_oriented", label: "Exam & Revision Oriented (Key Takeaways)" },
                    { value: "simplified", label: "Intuitive & Concept-First (Plain English)" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Default Research Depth"
                  value={formData.researchDepth}
                  onChange={(e) => handleInputChange("researchDepth", e.target.value)}
                  options={[
                    { value: "standard", label: "Standard Comprehensive (4-6 Sources)" },
                    { value: "deep", label: "Deep Academic Synthesis (6-10 Sources + Literature)" },
                    { value: "basic", label: "Concise Explanation (3-4 Sources)" },
                  ]}
                />
                <Input
                  label="Preferred Language"
                  value={formData.preferredLanguage}
                  onChange={(e) => handleInputChange("preferredLanguage", e.target.value)}
                  placeholder="e.g. English, Spanish, French, German"
                />
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Universal Prompt System
                    </h4>
                    <p className="text-xs text-indigo-900/80 mt-0.5 leading-relaxed">
                      These preferences will automatically configure universal AI research prompts for every subject and semester in your program without needing re-entry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Live Verification & Review */}
          {step === 4 && (
            <div className="space-y-4">
              {!verifiedData && !isVerifying && (
                <div className="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Ready to Verify {formData.name}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    The backend will execute live web research to discover official university domains, verify academic departments, and index research repositories.
                  </p>
                  <Button
                    onClick={handleVerify}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="min-h-[44px]"
                  >
                    Verify University Profile
                  </Button>
                </div>
              )}

              {isVerifying && (
                <div className="text-center py-10 px-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Searching Web & Verifying Institution...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Identifying official institutional repositories, departments, and course guidelines for {formData.name}.
                  </p>
                </div>
              )}

              {verifiedData && !isVerifying && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-900">
                          {verifiedData.universityName} Verified
                        </span>
                        <Badge variant="success" size="sm">
                          Accredited
                        </Badge>
                      </div>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        {verifiedData.verificationNotes}
                      </p>
                    </div>
                  </div>

                  {verifiedData.academicSystem && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Academic System:</span>
                      <span className="text-slate-900 font-semibold">{verifiedData.academicSystem}</span>
                    </div>
                  )}

                  {/* Discovered Academic Resources */}
                  {verifiedData.academicResources && verifiedData.academicResources.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Discovered Academic Portals
                      </p>
                      <div className="space-y-1.5">
                        {verifiedData.academicResources.map((res, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-800">{res.title}</span>
                            {res.url && (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                <span>Visit</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Research Sources */}
                  {verifiedData.researchSources && verifiedData.researchSources.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Verification Sources
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {verifiedData.researchSources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 sm:p-5 bg-slate-50/80 gap-3">
          {step > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep((s) => s - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors py-2 px-1"
            >
              Skip Setup for now
            </button>
          )}

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handleSkip}
                className="hidden sm:inline-block text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1"
              >
                Skip for now
              </button>
            )}

            {step < 4 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (step === 1 && !formData.name.trim()) {
                    setError("Please enter your university name.");
                    return;
                  }
                  setError(null);
                  setStep((s) => s + 1);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleFinalSave}
                isLoading={isSaving}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Confirm & Save Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
