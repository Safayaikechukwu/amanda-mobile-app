import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

const WAVE_BARS = 32;

type Status = 'idle' | 'recording' | 'paused' | 'transcribing';

export type VoiceSendResult = {
  text: string;
  audioUri?: string;
  durationMs?: number;
};

type WebSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function createWebRecognition(): WebSpeechRecognition | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => WebSpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => WebSpeechRecognition })
      .webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

/**
 * Voice session: mic metering, pause/resume, saved audio URI + optional transcript.
 */
export function useVoiceSession() {
  const [status, setStatus] = useState<Status>('idle');
  const [levels, setLevels] = useState(() => Array.from({ length: WAVE_BARS }, () => 0.12));
  const [transcript, setTranscript] = useState('');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const finalTextRef = useRef('');
  const webStreamRef = useRef<MediaStream | null>(null);
  const webCtxRef = useRef<AudioContext | null>(null);
  const webRafRef = useRef<number | null>(null);
  const webRecorderRef = useRef<MediaRecorder | null>(null);
  const webChunksRef = useRef<BlobPart[]>([]);
  const webAudioUriRef = useRef<string | null>(null);
  const webStartedAtRef = useRef<number | null>(null);
  const durationMsRef = useRef(0);
  const meteringTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (meteringTimer.current) {
      clearInterval(meteringTimer.current);
      meteringTimer.current = null;
    }
    if (webRafRef.current != null) {
      cancelAnimationFrame(webRafRef.current);
      webRafRef.current = null;
    }
  };

  const revokeWebAudioUri = () => {
    if (webAudioUriRef.current) {
      URL.revokeObjectURL(webAudioUriRef.current);
      webAudioUriRef.current = null;
    }
  };

  const pushLevel = useCallback((normalized: number) => {
    const v = Math.max(0.08, Math.min(1, normalized));
    setLevels((prev) => [...prev.slice(1), v]);
  }, []);

  const stopWebAudio = () => {
    clearTimers();
    webRecorderRef.current = null;
    webStreamRef.current?.getTracks().forEach((t) => t.stop());
    webStreamRef.current = null;
    void webCtxRef.current?.close();
    webCtxRef.current = null;
  };

  const stopRecognition = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
  };

  const teardownNative = async () => {
    clearTimers();
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
      } catch {
        /* ignore */
      }
    }
  };

  const reset = useCallback(async () => {
    stopRecognition();
    stopWebAudio();
    revokeWebAudioUri();
    webChunksRef.current = [];
    webStartedAtRef.current = null;
    durationMsRef.current = 0;
    await teardownNative();
    setStatus('idle');
    setTranscript('');
    finalTextRef.current = '';
    setLevels(Array.from({ length: WAVE_BARS }, () => 0.12));
  }, []);

  useEffect(() => {
    return () => {
      void reset();
    };
  }, [reset]);

  const startWebMetering = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    webStreamRef.current = stream;
    webStartedAtRef.current = Date.now();
    webChunksRef.current = [];

    if (typeof MediaRecorder !== 'undefined') {
      const recorder = new MediaRecorder(stream);
      webRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) webChunksRef.current.push(event.data);
      };
      recorder.start(250);
    }

    const ctx = new AudioContext();
    webCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const n = (data[i] - 128) / 128;
        sum += n * n;
      }
      const rms = Math.sqrt(sum / data.length);
      pushLevel(rms * 4);
      webRafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const startNativeMetering = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Microphone access needed',
        'Enable the microphone in Settings so you can Speak to Udara.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => void Linking.openSettings() },
        ],
      );
      throw new Error('mic-denied');
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    });
    recording.setOnRecordingStatusUpdate((s) => {
      if (!s.isRecording || s.metering == null) return;
      const db = s.metering;
      const norm = Math.max(0, Math.min(1, (db + 50) / 50));
      pushLevel(norm);
      if (s.durationMillis != null) durationMsRef.current = s.durationMillis;
    });
    recording.setProgressUpdateInterval(80);
    await recording.startAsync();
    recordingRef.current = recording;
  };

  const startSpeech = () => {
    const rec = createWebRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-NG';
    rec.onresult = (ev) => {
      let interim = '';
      let final = finalTextRef.current;
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) final += r[0].transcript + ' ';
        else interim += r[0].transcript;
      }
      finalTextRef.current = final;
      setTranscript((final + interim).trim());
    };
    rec.onerror = () => {
      /* keep recording even if STT fails */
    };
    try {
      rec.start();
    } catch {
      /* ignore */
    }
  };

  const start = async () => {
    try {
      setTranscript('');
      finalTextRef.current = '';
      revokeWebAudioUri();
      webChunksRef.current = [];
      durationMsRef.current = 0;
      setLevels(Array.from({ length: WAVE_BARS }, () => 0.12));
      if (Platform.OS === 'web') {
        await startWebMetering();
        startSpeech();
      } else {
        await startNativeMetering();
      }
      setStatus('recording');
    } catch (e) {
      await reset();
      if ((e as Error)?.message !== 'mic-denied') {
        Alert.alert('Could not start Speak', 'Check microphone permissions and try again.');
      }
    }
  };

  const pause = async () => {
    if (status !== 'recording') return;
    stopRecognition();
    if (Platform.OS === 'web') {
      if (webRafRef.current != null) {
        cancelAnimationFrame(webRafRef.current);
        webRafRef.current = null;
      }
      webRecorderRef.current?.pause();
    } else if (recordingRef.current) {
      try {
        await recordingRef.current.pauseAsync();
      } catch {
        /* some platforms lack pause */
      }
    }
    setStatus('paused');
  };

  const resume = async () => {
    if (status !== 'paused') return;
    if (Platform.OS === 'web') {
      if (!webStreamRef.current) {
        await startWebMetering();
      } else if (webCtxRef.current) {
        const analyser = webCtxRef.current.createAnalyser();
        analyser.fftSize = 256;
        webCtxRef.current.createMediaStreamSource(webStreamRef.current).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const n = (data[i] - 128) / 128;
            sum += n * n;
          }
          pushLevel(Math.sqrt(sum / data.length) * 4);
          webRafRef.current = requestAnimationFrame(tick);
        };
        tick();
      }
      webRecorderRef.current?.resume();
      startSpeech();
    } else if (recordingRef.current) {
      try {
        await recordingRef.current.startAsync();
      } catch {
        await startNativeMetering();
      }
    } else {
      await startNativeMetering();
    }
    setStatus('recording');
  };

  const finalizeWebAudio = async (): Promise<{ uri?: string; durationMs?: number }> => {
    const recorder = webRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });
    }

    revokeWebAudioUri();
    if (webChunksRef.current.length > 0) {
      const blob = new Blob(webChunksRef.current, { type: 'audio/webm' });
      webAudioUriRef.current = URL.createObjectURL(blob);
    }

    const durationMs =
      webStartedAtRef.current != null ? Date.now() - webStartedAtRef.current : durationMsRef.current;

    stopWebAudio();
    return { uri: webAudioUriRef.current ?? undefined, durationMs };
  };

  /** Finalize audio + transcript when the user taps Send. */
  const finishAndTranscribe = async (): Promise<VoiceSendResult> => {
    setStatus('transcribing');
    stopRecognition();
    clearTimers();

    if (Platform.OS === 'web') {
      const audio = await finalizeWebAudio();
      const text = transcript.trim() || finalTextRef.current.trim();
      setTranscript(text);
      setStatus('paused');
      return { text, audioUri: audio.uri, durationMs: audio.durationMs };
    }

    const rec = recordingRef.current;
    recordingRef.current = null;
    let audioUri: string | undefined;
    let durationMs = durationMsRef.current;

    if (rec) {
      try {
        const statusBeforeStop = await rec.getStatusAsync();
        if (statusBeforeStop.durationMillis != null) {
          durationMs = statusBeforeStop.durationMillis;
        }
        await rec.stopAndUnloadAsync();
        audioUri = rec.getURI() ?? undefined;
      } catch {
        /* ignore */
      }
    }

    await new Promise((r) => setTimeout(r, 200));
    const text = transcript.trim() || finalTextRef.current.trim();
    setTranscript(text);
    setStatus('paused');
    return { text, audioUri, durationMs: durationMs || undefined };
  };

  return {
    status,
    levels,
    transcript,
    setTranscript,
    start,
    pause,
    resume,
    finishAndTranscribe,
    reset,
    isActive: status !== 'idle',
  };
}

export const VOICE_WAVE_BARS = WAVE_BARS;
