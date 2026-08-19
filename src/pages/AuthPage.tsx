import React, { useState } from "react";
import { GraduationCap, Mail, Lock, User, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Card } from "../components/common/Card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { parseFirebaseError } from "../utils/firebaseErrors";
import { useNavigate } from "react-router-dom";

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  const { login, register, loginAsDemoStudent } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingLocal(true);

    try {
      if (mode === "register") {
        if (!name.trim()) throw new Error("Please enter your name.");
        await register(name.trim(), email.trim(), password);
        toast.success("Account created! Let's set up your university profile.");
      } else {
        await login(email.trim(), password);
        toast.success("Welcome back to StudyHelper!");
      }
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Auth error:", err);
      const parsed = parseFirebaseError(err, "Authentication failed. Please verify your credentials.");
      toast.firebaseError(err, "Authentication failed. Please verify your credentials.");
      setError(parsed.message);
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsLoadingLocal(true);
    try {
      await loginAsDemoStudent();
      toast.success("Signed in as Muhammad Hamza (NUST Scholar)");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Demo login error:", err);
      const parsed = parseFirebaseError(err, "Failed to launch student demo session.");
      toast.firebaseError(err, "Failed to launch student demo session.");
      setError(parsed.message);
    } finally {
      setIsLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Logo */}
      <div className="text-center mb-6 space-y-1">
        <div
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2.5 cursor-pointer mb-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">StudyHelper</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
          Universal Academic Study, Research & Multimodal Learning Platform
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md border border-slate-200/90 shadow-xl p-5 sm:p-7 bg-white rounded-3xl space-y-5">
        {/* Toggle Modes */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <Input
              label="Full Name"
              placeholder="e.g. Muhammad Hamza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
          )}

          <Input
            label="Academic / University Email"
            type="email"
            placeholder="student@nust.edu.pk or student@lums.edu.pk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            isLoading={isLoadingLocal}
            size="lg"
            className="w-full min-h-[48px] font-bold text-sm shadow-md shadow-indigo-200"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {mode === "login" ? "Sign In to Research" : "Create Academic Profile"}
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
            Or quick demo
          </span>
        </div>

        {/* Quick Demo Student Button */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleDemoLogin}
          isLoading={isLoadingLocal}
          className="w-full min-h-[48px] font-semibold text-xs sm:text-sm border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900"
          leftIcon={<Zap className="w-4 h-4 text-indigo-600" />}
        >
          Instant Student Demo (Pre-loaded Profile)
        </Button>
      </Card>
    </div>
  );
};
