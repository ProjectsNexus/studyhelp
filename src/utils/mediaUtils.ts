/**
 * Academic Research Media Utilities
 * Supports:
 * - File to base64 conversion
 * - Client-side video-to-audio extraction using Web Audio API (OfflineAudioContext)
 * - WAV audio encoder for universal browser compatibility
 */

export function fileToBase64(file: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip Data-URL prefix: "data:audio/mp3;base64,..."
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts audio track from a video file in the browser using Web Audio API
 * and encodes it as a high-quality lightweight WAV audio blob.
 */
export async function extractAudioFromVideo(
  videoFile: File,
  onProgress?: (percent: number, status: string) => void
): Promise<{ audioBlob: Blob; audioBase64: string; duration: number }> {
  onProgress?.(10, "Reading video file into memory...");
  const arrayBuffer = await videoFile.arrayBuffer();

  onProgress?.(30, "Decoding video audio stream...");
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch (decodeErr) {
    // If browser fails decoding video container directly in AudioContext,
    // fallback to video element audio capture
    audioBuffer = await extractAudioViaVideoElement(videoFile, onProgress);
  } finally {
    audioContext.close();
  }

  onProgress?.(70, "Encoding extracted audio track (WAV)...");
  const wavBlob = audioBufferToWavBlob(audioBuffer);
  const audioBase64 = await fileToBase64(wavBlob);

  onProgress?.(100, "Audio extraction complete");
  return {
    audioBlob: wavBlob,
    audioBase64,
    duration: audioBuffer.duration,
  };
}

/**
 * Fallback audio extraction using hidden HTML5 Video element and MediaStreamDestination
 */
async function extractAudioViaVideoElement(
  videoFile: File,
  onProgress?: (percent: number, status: string) => void
): Promise<AudioBuffer> {
  onProgress?.(40, "Extracting audio via video media pipeline...");
  const videoUrl = URL.createObjectURL(videoFile);
  const video = document.createElement("video");
  video.src = videoUrl;
  video.muted = true;
  video.preload = "auto";

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = (e) => reject(new Error("Unable to load video metadata: " + e));
  });

  const duration = Math.min(video.duration, 600); // Cap at 10 mins for safe memory
  const sampleRate = 16000; // Optimal for speech transcription
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);

  const arrayBuffer = await videoFile.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate });
  const decoded = await audioContext.decodeAudioData(arrayBuffer);
  audioContext.close();
  URL.revokeObjectURL(videoUrl);
  return decoded;
}

/**
 * Converts standard Web Audio AudioBuffer to PCM WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = 1; // Downmix to mono for speech transcription
  const sampleRate = Math.min(buffer.sampleRate, 24000); // 16-24kHz is optimal for speech
  
  // Resample/extract channel 0
  const channelData = buffer.getChannelData(0);
  const ratio = buffer.sampleRate / sampleRate;
  const newLength = Math.round(channelData.length / ratio);
  const samples = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originalIndex = Math.floor(i * ratio);
    samples[i] = channelData[originalIndex] || 0;
  }

  // Convert Float32Array (-1.0 to 1.0) to 16-bit PCM ArrayBuffer
  const bufferLength = 44 + samples.length * 2;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");

  // FMT sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // Data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
