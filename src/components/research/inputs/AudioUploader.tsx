import React, { useState, useRef } from "react";
import {
  Upload,
  Music,
  FileAudio,
  Play,
  Pause,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Languages,
  Globe,
} from "lucide-react";
import { Button } from "../../common/Button";
import { fileToBase64, formatFileSize, formatTime } from "../../../utils/mediaUtils";
import { TranscribedMediaData } from "./LiveAudioRecorder";

interface AudioUploaderProps {
  onTranscribed: (data: TranscribedMediaData) => void;
  context?: {
    universityName?: string;
    courseName?: string;
    semesterName?: string;
  };
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onTranscribed,
  context,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscribedMediaData | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSelectFile = (selectedFile: File) => {
    setError(null);
    setTranscriptionResult(null);

    if (!selectedFile.type.startsWith("audio/") && !selectedFile.name.match(/\.(mp3|wav|m4a|aac|ogg|webm|flac)$/i)) {
      setError("Please select a valid audio file (MP3, WAV, M4A, AAC, OGG, or WebM).");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("Audio file is too large. Please select a file under 50MB.");
      return;
    }

    setFile(selectedFile);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
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
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscriptionResult(null);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setIsTranscribing(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type || "audio/mp3";

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
        throw new Error(errorData.message || "Failed to transcribe audio file.");
      }

      const resData = await response.json();
      const result: TranscribedMediaData = resData.data;

      setTranscriptionResult(result);
      onTranscribed(result);
    } catch (err: any) {
      console.error("Audio transcription error:", err);
      setError(err.message || "Failed to transcribe audio file. Please try again.");
    } finally {
      setIsTranscribing(false);
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

      {/* Upload Zone / Active Audio Player */}
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
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
            onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Music className="w-6 h-6" />
          </div>

          <h4 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <span>Upload Audio in Any Language</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
              Auto-Translates to English
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Drag and drop foreign or native language lectures, seminars, or voice notes
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-semibold text-slate-500">
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">MP3</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">WAV</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">M4A</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">AAC</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md">OGG / WebM</span>
            <span className="text-slate-400">• Up to 50MB</span>
          </div>
        </div>
      ) : (
        /* Selected Audio Preview Card */
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <FileAudio className="w-5 h-5" />
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Remove audio file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                  onEnded={() => setIsPlaying(false)}
                  controls
                  className="w-full h-8"
                />
              </div>
            </div>
          )}

          {/* Action to transcribe */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
              onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
              className="hidden"
            />

            <Button
              variant="primary"
              size="sm"
              onClick={handleTranscribe}
              isLoading={isTranscribing}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Transcribe & Translate to English
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
              Audio Transcribed & Translated
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
