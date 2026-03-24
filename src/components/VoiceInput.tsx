import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { toast } from 'sonner';

interface VoiceInputProps {
  onResult: (text: string) => void;
}

export default function VoiceInput({ onResult }: VoiceInputProps) {
  const { t, speechLang } = useI18n();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setListening(false);
      toast.success(`🎙️ "${text}"`);
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied. Please allow access.');
      } else if (event.error === 'no-speech') {
        toast.info('No speech detected. Please try again.');
      } else {
        toast.error('Voice recognition error. Please try again.');
      }
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, speechLang, onResult]);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors active:scale-[0.98] ${
        listening
          ? 'border-destructive/50 bg-destructive/5 animate-pulse'
          : 'border-accent/30 bg-accent/5 hover:border-accent/50'
      }`}
    >
      {listening ? (
        <Loader2 className="h-6 w-6 animate-spin text-destructive" />
      ) : (
        <Mic className="h-6 w-6 text-accent" />
      )}
      <div className="text-left">
        <p className={`font-medium ${listening ? 'text-destructive' : 'text-accent'}`}>
          {listening ? t('listening') : t('voiceInput')}
        </p>
        <p className="text-xs text-muted-foreground">
          {listening ? t('tapToSpeak') : t('voiceDesc')}
        </p>
      </div>
      {listening && (
        <MicOff className="ml-auto h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
}
