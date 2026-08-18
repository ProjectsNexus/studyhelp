import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Laptop,
  Share2,
  PlusSquare,
  Compass,
  Check,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  Download,
  Bookmark,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

interface AppShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppShortcutModal: React.FC<AppShortcutModalProps> = ({ isOpen, onClose }) => {
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop");
  const [activeTab, setActiveTab] = useState<"mobile" | "desktop" | "share">("mobile");
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Detect User Agent
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setDeviceType("ios");
      setActiveTab("mobile");
    } else if (/android/i.test(ua)) {
      setDeviceType("android");
      setActiveTab("mobile");
    } else {
      setDeviceType("desktop");
      setActiveTab("desktop");
    }

    // Listen for PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleCopyLink = async () => {
    const currentUrl = window.location.origin;
    await navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Create App Shortcut
                </h3>
                <Badge variant="university" size="sm" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                  PWA Ready
                </Badge>
              </div>
              <p className="text-xs text-indigo-200/80">
                Launch Academia AI directly from your Home Screen or Desktop with 1 tap
              </p>
            </div>
          </div>

          {/* Quick Platform Switcher Tabs */}
          <div className="flex items-center gap-1.5 pt-3 border-t border-indigo-800/40 mt-3">
            <button
              onClick={() => setActiveTab("mobile")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "mobile"
                  ? "bg-white text-indigo-950 shadow-xs"
                  : "text-indigo-200 hover:text-white hover:bg-white/10"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (iOS & Android)</span>
            </button>

            <button
              onClick={() => setActiveTab("desktop")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "desktop"
                  ? "bg-white text-indigo-950 shadow-xs"
                  : "text-indigo-200 hover:text-white hover:bg-white/10"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Web & Desktop</span>
            </button>

            <button
              onClick={() => setActiveTab("share")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "share"
                  ? "bg-white text-indigo-950 shadow-xs"
                  : "text-indigo-200 hover:text-white hover:bg-white/10"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App Link</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Native Instant Install Prompt (if supported) */}
          {isInstallable && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Native Installation Supported
                </h4>
                <p className="text-xs text-indigo-900 mt-0.5">
                  Click below to add the official standalone shortcut to your device.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleInstallClick}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Install App
              </Button>
            </div>
          )}

          {installSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold">
                App shortcut successfully installed! You can now launch Academia AI from your home screen.
              </span>
            </div>
          )}

          {/* TAB 1: MOBILE INSTRUCTIONS */}
          {activeTab === "mobile" && (
            <div className="space-y-4">
              {/* iPhone / iOS Guide */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    <h4 className="text-sm font-bold text-slate-900">Apple iPhone & iPad (Safari)</h4>
                  </div>
                  <Badge variant="outline" size="sm">iOS</Badge>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <p className="pt-0.5 leading-relaxed">
                      Tap the <strong className="text-slate-900">Share</strong> button (the box with an upward arrow <span className="font-mono text-indigo-700">⎋</span>) in Safari's bottom toolbar.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <p className="pt-0.5 leading-relaxed">
                      Scroll down the share sheet menu and tap <strong className="text-slate-900">"Add to Home Screen"</strong> with the <PlusSquare className="inline w-3.5 h-3.5 text-slate-900 align-text-bottom" /> plus icon.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <p className="pt-0.5 leading-relaxed">
                      Tap <strong className="text-slate-900">"Add"</strong> in the top right. The Academia AI app icon will now appear on your home screen for full-screen access!
                    </p>
                  </div>
                </div>
              </div>

              {/* Android Guide */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h4 className="text-sm font-bold text-slate-900">Android (Chrome / Samsung Internet)</h4>
                  </div>
                  <Badge variant="outline" size="sm">Android</Badge>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <p className="pt-0.5 leading-relaxed">
                      Tap the <strong className="text-slate-900">Three Dots menu (⋮)</strong> in the top right corner of Chrome.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <p className="pt-0.5 leading-relaxed">
                      Select <strong className="text-slate-900">"Install app"</strong> or <strong className="text-slate-900">"Add to Home screen"</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <p className="pt-0.5 leading-relaxed">
                      Confirm installation to create the instant app launcher on your Android device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESKTOP & WEB INSTRUCTIONS */}
          {activeTab === "desktop" && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Google Chrome & Microsoft Edge Desktop</h4>
                  <Badge variant="outline" size="sm">Desktop</Badge>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <p className="pt-0.5 leading-relaxed">
                      Look at the right side of your browser's address bar (URL bar) for the <strong className="text-slate-900">Install icon</strong> (computer monitor with downward arrow) or click the three dots menu <strong className="text-slate-900">(⋮) → "Save and share" → "Install page as app"</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <p className="pt-0.5 leading-relaxed">
                      Click <strong className="text-slate-900">"Install"</strong> to launch Academia AI in its own standalone window without browser tabs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bookmark Quick Action */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-indigo-600" />
                  <h5 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Quick Keyboard Bookmark
                  </h5>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-[11px] font-bold border border-indigo-300 text-indigo-800">Ctrl + D</kbd> (Windows) or <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-[11px] font-bold border border-indigo-300 text-indigo-800">⌘ + D</kbd> (Mac) to pin this app to your browser bookmarks bar.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SHARE / COPY LINK */}
          {activeTab === "share" && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Copy Direct Web Application Link
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Send this link to your phone via message, email, or Slack to open and install the shortcut directly on your mobile device.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={window.location.origin}
                    className="flex-1 px-3 py-2 text-xs font-mono text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCopyLink}
                    leftIcon={copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copiedUrl ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Standalone PWA Experience</span>
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
