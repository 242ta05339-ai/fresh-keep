import { useState } from 'react';
import { useFridge } from '@/lib/fridge-context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { FoodCategory, CATEGORY_EMOJI } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanBarcode, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import BarcodeScanner, { ScannedProduct } from '@/components/BarcodeScanner';
import VoiceInput from '@/components/VoiceInput';

const categories: FoodCategory[] = ['dairy', 'produce', 'meat', 'grains', 'beverages', 'snacks', 'condiments', 'frozen', 'other'];

const DEFAULT_SHELF_LIFE: Record<string, number> = {
  dairy: 7, produce: 5, meat: 3, grains: 30, beverages: 14, snacks: 60,
  condiments: 90, frozen: 180, other: 7,
  milk: 7, bread: 3, eggs: 14, yogurt: 10, vegetables: 5, cheese: 14,
  chicken: 2, fish: 2, juice: 7, butter: 30,
};

function guessShelfLife(productName: string, category: FoodCategory): string {
  const lower = productName.toLowerCase();
  for (const [key, days] of Object.entries(DEFAULT_SHELF_LIFE)) {
    if (lower.includes(key)) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    }
  }
  const days = DEFAULT_SHELF_LIFE[category] ?? 7;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function AddFood() {
  const { addItem } = useFridge();
  const { profile } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [cost, setCost] = useState('');
  const [added, setAdded] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualPrompt, setManualPrompt] = useState('');

  const resetForm = () => {
    setName(''); setQuantity('1'); setUnit('pieces'); setExpiryDate(''); setCategory('other'); setCost('');
    setAdded(false); setManualPrompt('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const finalExpiry = expiryDate || guessShelfLife(name, category);

    try {
      await addItem({
        name,
        quantity: Number(quantity),
        unit,
        expiryDate: finalExpiry,
        category,
        addedBy: profile?.display_name || 'You',
        cost: cost ? Number(cost) : undefined,
      });
      setAdded(true);
      toast.success(`${name} ${t('added')}`);
      setTimeout(resetForm, 1500);
    } catch {
      toast.error('Failed to add item. Please try again.');
    }
  };

  const handleProductScanned = (product: ScannedProduct) => {
    setShowScanner(false);
    const cat = (product.category as FoodCategory) || 'other';

    if (product.found && product.name) {
      setName(product.name);
      setCategory(cat);
      setExpiryDate('');
      setManualPrompt(`Found "${product.name}". Please enter the expiry date (or leave blank for a smart default).`);
      toast.success(`Found: ${product.name}`);
    } else {
      setName('');
      setCategory('other');
      setExpiryDate('');
      setManualPrompt(`Barcode ${product.barcode} not found. Please fill in the details below.`);
      toast.info('Please add the product details manually.');
    }
  };

  const handleVoiceResult = (data: { name: string; quantity?: string; unit?: string; category?: FoodCategory; cost?: string; expiryDate?: string }) => {
    setName(data.name);
    if (data.quantity) setQuantity(data.quantity);
    if (data.unit) setUnit(data.unit);
    if (data.category) setCategory(data.category);
    if (data.cost) setCost(data.cost);
    if (data.expiryDate) setExpiryDate(data.expiryDate);
    setManualPrompt('');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">{t('addFoodItem')}</h2>
        <p className="text-muted-foreground">{t('trackWhat')}</p>
      </div>

      {showScanner && (
        <BarcodeScanner
          onProductFound={handleProductScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => setShowScanner(true)}
          className="fade-in-up-delay-1 flex items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary/50 active:scale-[0.98]"
        >
          <ScanBarcode className="h-6 w-6 text-primary" />
          <div className="text-left">
            <p className="font-medium text-primary">{t('scanBarcode')}</p>
            <p className="text-xs text-muted-foreground">{t('scanDesc')}</p>
          </div>
        </button>

        <div className="fade-in-up-delay-1">
          <VoiceInput onResult={handleVoiceResult} />
        </div>
      </div>

      {manualPrompt && (
        <div className="fade-in-up rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning-foreground">
          {manualPrompt}
        </div>
      )}

      <div className="fade-in-up-delay-2 rounded-xl border bg-card p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('itemName')}</Label>
            <Input id="name" placeholder="e.g. Whole Milk" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="qty">{t('quantity')}</Label>
              <Input id="qty" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">{t('unit')}</Label>
              <Input id="unit" placeholder="pieces, lbs, etc." value={unit} onChange={e => setUnit(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiry">{t('expiryDate')}</Label>
              <Input id="expiry" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">{t('smartDefault')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">{t('cost')}</Label>
              <Input id="cost" type="number" step="0.01" placeholder="0.00" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-all active:scale-95 ${
                    category === cat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {CATEGORY_EMOJI[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={added}>
            {added ? <><Check className="h-4 w-4" /> {t('added')}</> : <><Plus className="h-4 w-4" /> {t('addToFridge')}</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
