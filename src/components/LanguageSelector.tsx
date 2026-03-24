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
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
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
