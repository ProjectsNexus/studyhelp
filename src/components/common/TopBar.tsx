import React, { useState } from "react";
import { GraduationCap, BookOpen, Layers, CheckCircle2, User, LogOut, Smartphone, Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AppShortcutModal } from "./AppShortcutModal";

export const TopBar: React.FC = () => {
  const { user, universityProfile, activeSemester, logout } = useAuth();
  const [showShortcutModal, setShowShortcutModal] = useState<boolean>(false);
  const navigate = useNavigate();

  // Extract initials (e.g. Stanford University -> SU)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-100 px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Academic Context */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
                {universityProfile ? getInitials(universityProfile.name) : "AI"}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight">
                  Academic Context
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate max-w-[160px] sm:max-w-[220px]">
                  {universityProfile ? universityProfile.name : "StudyHelper Platform"}
                </p>
              </div>
            </div>
          </div>

          {/* Center / Right contextual chips, App Shortcut, and live status */}
          <div className="flex items-center gap-2">
            {/* Create App Shortcut Button */}
            <button
              onClick={() => setShowShortcutModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200/90 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-bold rounded-xl transition-all shadow-2xs group"
              title="Add App Shortcut to Home Screen / Desktop"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">App Shortcut</span>
            </button>

            {/* Active Semester Tag */}
            {activeSemester && (
              <div
                onClick={() => navigate("/profile")}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors"
              >
                <span>Semester {activeSemester.semesterNumber}</span>
              </div>
            )}

            {/* Live System Indicator */}
            <div
              className="w-8 h-8 bg-slate-50 border border-slate-200/80 rounded-full flex items-center justify-center"
              title="Academic Context Live & Active"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>

            {user ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors"
                  title="Your Academic Profile"
                  aria-label="Profile"
                >
                  <User className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={logout}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-indigo-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* App Shortcut Modal */}
      <AppShortcutModal
        isOpen={showShortcutModal}
        onClose={() => setShowShortcutModal(false)}
      />
    </>
  );
};
