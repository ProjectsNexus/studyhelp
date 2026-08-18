import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Languages,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Button } from "../../common/Button";
import { fileToBase64, formatTime } from "../../../utils/mediaUtils";

export interface TranscribedMediaData {
  detectedLanguage: string;
  languageCode: string;
  originalTranscription: string;
  englishTranscription: string;
  suggestedTopic: string;
  summary: string;
  keywords: string[];
}

interface LiveAudioRecorderProps {
  onTranscribed: (data: TranscribedMediaData) => void;
  context?: {
    universityName?: string;
    courseName?: string;
    semesterName?: string;
  };
}

export const LiveAudioRecorder: React.FC<LiveAudioRecorderProps> = ({
  onTranscribed,
  context,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscribedMediaData | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracks();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [audioUrl]);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / 32 - 2;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const sampleIndex = Math.floor((i / 32) * bufferLength);
        const value = dataArray[sampleIndex] || 0;
        const percent = value / 255;
        const barHeight = Math.max(4, percent * canvas.height * 0.9);

        // Gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "#4f46e5");
        gradient.addColorStop(1, "#818cf8");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();

        x += barWidth + 2;
      }
    };

    render();
  };

  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscriptionResult(null);
    setRecordDuration(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Setup audio visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Setup MediaRecorder
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);
        stopTracks();
        if (timerRef.current) clearInterval(timerRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

      // Start visualizer
      setTimeout(drawVisualizer, 100);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Microphone permission denied. Please allow microphone access in your browser settings to record live speech in any language."
          : "Could not access microphone. Please check your audio input devices."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTranscribeAudio = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(audioBlob);
      const mimeType = audioBlob.type || "audio/webm";

      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaBase64: base64Data,
          mimeType,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to transcribe audio.");
      }

      const resData = await response.json();
      const result: TranscribedMediaData = resData.data;

      setTranscriptionResult(result);
      onTranscribed(result);
    } catch (err: any) {
      console.error("Transcription error:", err);
      setError(err.message || "Failed to transcribe audio recording. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error alert */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Recording Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Recording Workspace */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {/* Header indicator & Language badge */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording
                    ? isPaused
                      ? "bg-amber-400"
                      : "bg-red-500 animate-ping"
                    : audioBlob
                    ? "bg-emerald-400"
                    : "bg-slate-500"
                }`}
              />
              <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                {isRecording
                  ? isPaused
                    ? "Recording Paused"
                    : "Recording Live Speech..."
                  : audioBlob
                  ? "Recording Ready"
                  : "Live Microphone (Any Language)"}
              </span>
            </div>
            <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full border border-slate-700 font-medium flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 text-indigo-400" />
              Multilingual Speech Recognition
            </span>
          </div>

          {/* Time Display */}
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white">
            {formatTime(recordDuration)}
          </div>

          {/* Real-time Frequency Visualizer Canvas */}
          <div className="w-full max-w-sm h-14 bg-slate-950/80 rounded-xl p-1.5 flex items-center justify-center border border-slate-800/80 overflow-hidden">
            {isRecording ? (
              <canvas ref={canvasRef} width={340} height={44} className="w-full h-full" />
            ) : audioBlob ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Audio Captured ({formatTime(recordDuration)})</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Speak in any language (Spanish, Hindi, French, English, etc.)</span>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {!isRecording && !audioBlob && (
              <button
                type="button"
                onClick={startRecording}
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            )}

            {isRecording && (
              <>
                <button
                  type="button"
                  onClick={togglePause}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 animate-pulse cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Finish Recording</span>
                </button>
              </>
            )}

            {!isRecording && audioBlob && (
              <>
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
                  title="Play/Pause Recording"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  <span className="text-xs font-semibold">{isPlaying ? "Pause" : "Play"}</span>
                </button>

                <button
                  type="button"
                  onClick={startRecording}
                  className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="Record again"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record</span>
                </button>

                <button
                  type="button"
                  onClick={handleTranscribeAudio}
                  disabled={isTranscribing}
                  className="px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isTranscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transcribing & Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Transcribe & Convert to English</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Hidden audio player for playback */}
          {audioUrl && (
            <audio
              ref={audioElementRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </div>
      </div>

      {/* Dual Language Transcription Result Card */}
      {transcriptionResult && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Multilingual Speech Transcribed & Translated
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Languages className="w-3 h-3 text-indigo-600" />
              Spoken in: {transcriptionResult.detectedLanguage}
            </span>
          </div>

          {/* Original Language Transcription */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Original Transcription ({transcriptionResult.detectedLanguage}):
              </p>
              <span className="text-[10px] text-slate-400 font-mono uppercase">{transcriptionResult.languageCode}</span>
            </div>
            <p className="text-xs text-slate-800 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
              "{transcriptionResult.originalTranscription}"
            </p>
          </div>

          {/* English Translation & Formulated Topic */}
          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                English Research Query (Used for Pipeline):
              </p>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                Active for Research
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-snug">
              {transcriptionResult.suggestedTopic}
            </p>
            {transcriptionResult.englishTranscription !== transcriptionResult.suggestedTopic && (
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">English Transcript: </span>
                {transcriptionResult.englishTranscription}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
