import React, { useState, useRef } from "react";
import {
  Video,
  FileVideo,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Cpu,
  ArrowRight,
  Layers,
  Languages,
  Globe,
} from "lucide-react";
import { Button } from "../../common/Button";
import {
  extractAudioFromVideo,
  fileToBase64,
  formatFileSize,
  formatTime,
} from "../../../utils/mediaUtils";
import { TranscribedMediaData } from "./LiveAudioRecorder";

interface VideoUploaderProps {
  onTranscribed: (data: TranscribedMediaData) => void;
  context?: {
    universityName?: string;
    courseName?: string;
    semesterName?: string;
  };
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onTranscribed,
  context,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscribedMediaData | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectFile = (selectedFile: File) => {
    setError(null);
    setTranscriptionResult(null);

    if (!selectedFile.type.startsWith("video/") && !selectedFile.name.match(/\.(mp4|mov|webm|mkv|avi)$/i)) {
      setError("Please select a valid video file (MP4, MOV, WebM, or MKV).");
      return;
    }

    if (selectedFile.size > 150 * 1024 * 1024) {
      setError("Video file is larger than 150MB. Please select a shorter video lecture clip.");
      return;
    }

    setFile(selectedFile);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setTranscriptionResult(null);
    setIsProcessing(false);
    setProgressPercent(0);
  };

  const handleConvertAndTranscribe = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgressPercent(10);
    setProgressStep("Reading video audio track...");

    try {
      let audioBase64: string;
      let mimeType = "audio/wav";

      try {
        // Step 1: Extract lightweight audio stream directly in browser
        const extracted = await extractAudioFromVideo(file, (pct, status) => {
          setProgressPercent(Math.min(75, pct));
          setProgressStep(status);
        });
        audioBase64 = extracted.audioBase64;
      } catch (extractErr) {
        console.warn("Client-side audio extraction fallback:", extractErr);
        setProgressStep("Encoding video stream for AI synthesis...");
        audioBase64 = await fileToBase64(file);
        mimeType = file.type || "video/mp4";
      }

      setProgressPercent(80);
      setProgressStep("Transcribing spoken audio & translating to English...");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaBase64: audioBase64,
          mimeType,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to transcribe video lecture.");
      }

      setProgressPercent(100);
      setProgressStep("Transcription & English Translation Complete");

      const resData = await response.json();
      const result: TranscribedMediaData = resData.data;

      setTranscriptionResult(result);
      onTranscribed(result);
    } catch (err: any) {
      console.error("Video processing error:", err);
      setError(err.message || "Failed to process video audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Upload Zone / Active Video Preview */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-600 bg-indigo-50/50 scale-[0.99]"
              : "border-slate-300 hover:border-indigo-500 hover:bg-slate-50/80 bg-white"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.mov,.webm,.mkv"
            onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Video className="w-6 h-6" />
          </div>

          <h4 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <span>Upload Video Lecture in Any Language</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
              Converts to Audio
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Extracts audio track, transcribes in native language, and translates to English
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-semibold text-slate-500">
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">MP4</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">WebM</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">MOV</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">MKV</span>
            <span className="text-slate-400">• Up to 150MB</span>
          </div>
        </div>
      ) : (
        /* Selected Video Preview Card */
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <FileVideo className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {file.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5" />
                    {formatFileSize(file.size)}
                  </span>
                  {duration > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(duration)}
                    </span>
                  )}
                  <span className="text-indigo-600 font-medium flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Any Language
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Remove video file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video Player */}
          {videoUrl && (
            <div className="relative rounded-xl overflow-hidden bg-slate-950 max-h-56 flex items-center justify-center">
              <video
                src={videoUrl}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                controls
                className="max-h-56 w-full object-contain"
              />
            </div>
          )}

          {/* Processing Progress Indicator */}
          {isProcessing && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  {progressStep}
                </span>
                <span className="font-mono font-bold text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              Replace Video
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.webm,.mkv"
              onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
              className="hidden"
            />

            <Button
              variant="primary"
              size="sm"
              onClick={handleConvertAndTranscribe}
              isLoading={isProcessing}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Extract Audio & Translate to English
            </Button>
          </div>
        </div>
      )}

      {/* Dual Language Transcription Preview Card */}
      {transcriptionResult && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Video Audio Extracted & Translated
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
