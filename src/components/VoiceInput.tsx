import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { toast } from 'sonner';
import { FoodCategory } from '@/lib/types';

interface ParsedVoiceData {
  name: string;
  quantity?: string;
  unit?: string;
  category?: FoodCategory;
  cost?: string;
  expiryDate?: string;
}

interface VoiceInputProps {
  onResult: (data: ParsedVoiceData) => void;
}

const CATEGORY_KEYWORDS: Record<string, FoodCategory> = {
  milk: 'dairy', cheese: 'dairy', yogurt: 'dairy', butter: 'dairy', cream: 'dairy', curd: 'dairy', paneer: 'dairy',
  दूध: 'dairy', दही: 'dairy', पनीर: 'dairy', मक्खन: 'dairy',
  apple: 'produce', banana: 'produce', tomato: 'produce', potato: 'produce', onion: 'produce',
  spinach: 'produce', carrot: 'produce', vegetable: 'produce', fruit: 'produce', sabzi: 'produce',
  सब्जी: 'produce', फल: 'produce', टमाटर: 'produce', आलू: 'produce', प्याज: 'produce',
  chicken: 'meat', mutton: 'meat', fish: 'meat', egg: 'meat', eggs: 'meat', meat: 'meat',
  मांस: 'meat', चिकन: 'meat', मछली: 'meat', अंडा: 'meat',
  rice: 'grains', wheat: 'grains', flour: 'grains', bread: 'grains', atta: 'grains', roti: 'grains',
  चावल: 'grains', आटा: 'grains', रोटी: 'grains',
  juice: 'beverages', water: 'beverages', soda: 'beverages', tea: 'beverages', coffee: 'beverages',
  जूस: 'beverages', पानी: 'beverages', चाय: 'beverages',
  chips: 'snacks', biscuit: 'snacks', cookie: 'snacks', chocolate: 'snacks', namkeen: 'snacks',
  sauce: 'condiments', ketchup: 'condiments', pickle: 'condiments', achaar: 'condiments',
  frozen: 'frozen', ice: 'frozen',
};

const UNIT_KEYWORDS: Record<string, string> = {
  kg: 'kg', kilogram: 'kg', kilo: 'kg', किलो: 'kg',
  gram: 'grams', grams: 'grams', g: 'grams', ग्राम: 'grams',
  liter: 'liters', litre: 'liters', liters: 'liters', l: 'liters', लीटर: 'liters',
  ml: 'ml', milliliter: 'ml', मिलीलीटर: 'ml',
  piece: 'pieces', pieces: 'pieces', pcs: 'pieces', टुकड़े: 'pieces', पीस: 'pieces',
  dozen: 'dozen', दर्जन: 'dozen',
  packet: 'packets', pack: 'packets', packets: 'packets', पैकेट: 'packets',
  bottle: 'bottles', bottles: 'bottles', बोतल: 'bottles',
  box: 'boxes', boxes: 'boxes', डिब्बा: 'boxes',
};

function parseVoiceText(text: string): ParsedVoiceData {
  const lower = text.toLowerCase().trim();
  const result: ParsedVoiceData = { name: text };

  // Extract cost (numbers with rupees/rs/₹)
  const costMatch = lower.match(/(?:₹|rs\.?|rupees?|रुपये?)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|rupees?|रुपये?)/);
  if (costMatch) {
    result.cost = costMatch[1] || costMatch[2];
  }

  // Extract quantity (number followed by unit or standalone)
  const qtyMatch = lower.match(/(\d+(?:\.\d+)?)\s*(kg|kilogram|kilo|gram|grams|g|liter|litre|liters|l|ml|milliliter|piece|pieces|pcs|dozen|packet|pack|packets|bottle|bottles|box|boxes|किलो|ग्राम|लीटर|मिलीलीटर|टुकड़े|पीस|दर्जन|पैकेट|बोतल|डिब्बा)\b/i);
  if (qtyMatch) {
    result.quantity = qtyMatch[1];
    const unitKey = qtyMatch[2].toLowerCase();
    result.unit = UNIT_KEYWORDS[unitKey] || unitKey;
  } else {
    // Just a number at start
    const numMatch = lower.match(/^(\d+)\s+/);
    if (numMatch) {
      result.quantity = numMatch[1];
    }
  }

  // Detect category from keywords
  for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      result.category = cat;
      break;
    }
  }

  // Extract expiry date patterns
  const dateMatch = lower.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    if (year.length === 2) year = '20' + year;
    result.expiryDate = `${year}-${month}-${day}`;
  }

  // Clean up the name: remove cost, quantity+unit, date patterns
  let cleanName = text;
  if (costMatch) cleanName = cleanName.replace(costMatch[0], '');
  if (qtyMatch) cleanName = cleanName.replace(qtyMatch[0], '');
  if (dateMatch) cleanName = cleanName.replace(dateMatch[0], '');
  // Remove common filler words
  cleanName = cleanName.replace(/\b(add|rupees?|rs\.?|₹|रुपये?|expiry|expires?|date|cost|price|quantity|category)\b/gi, '');
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  if (cleanName) result.name = cleanName;

  return result;
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
      const parsed = parseVoiceText(text);
      onResult(parsed);
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
