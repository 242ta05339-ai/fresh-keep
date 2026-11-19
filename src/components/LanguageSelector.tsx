import { useI18n, LANGUAGES, Language } from '@/lib/i18n-context';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LanguageSelector() {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Globe className="hidden h-4 w-4 text-muted-foreground sm:block" />
      <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
        <SelectTrigger className="h-9 w-[108px] text-xs sm:h-8 sm:w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <SelectItem key={code} value={code} className="text-sm">
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
