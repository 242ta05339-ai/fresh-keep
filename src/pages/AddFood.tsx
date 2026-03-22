import { useState } from 'react';
import { useFridge } from '@/lib/fridge-context';
import { FoodCategory, CATEGORY_EMOJI } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanBarcode, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import BarcodeScanner from '@/components/BarcodeScanner';

const categories: FoodCategory[] = ['dairy', 'produce', 'meat', 'grains', 'beverages', 'snacks', 'condiments', 'frozen', 'other'];

export default function AddFood() {
  const { addItem } = useFridge();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [cost, setCost] = useState('');
  const [added, setAdded] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) return;
    addItem({
      name,
      quantity: Number(quantity),
      unit,
      expiryDate,
      category,
      addedBy: 'You',
      cost: cost ? Number(cost) : undefined,
    });
    setAdded(true);
    toast.success(`${name} added to your fridge!`);
    setTimeout(() => {
      setName(''); setQuantity('1'); setUnit('pieces'); setExpiryDate(''); setCategory('other'); setCost('');
      setAdded(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">Add Food Item</h2>
        <p className="text-muted-foreground">Track what goes into your fridge.</p>
      </div>

      {showScanner && (
        <BarcodeScanner
          onProductFound={(product) => {
            setName(product.name);
            if (product.category) setCategory(product.category as FoodCategory);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Barcode scanner button */}
      <button
        onClick={() => setShowScanner(true)}
        className="fade-in-up-delay-1 flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary/50 active:scale-[0.98]"
      >
        <ScanBarcode className="h-6 w-6 text-primary" />
        <div className="text-left">
          <p className="font-medium text-primary">Scan Barcode</p>
          <p className="text-xs text-muted-foreground">Use your camera to auto-fetch product details</p>
        </div>
      </button>

      <div className="fade-in-up-delay-2 rounded-xl border bg-card p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" placeholder="e.g. Whole Milk" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" placeholder="pieces, lbs, etc." value={unit} onChange={e => setUnit(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input id="cost" type="number" step="0.01" placeholder="0.00" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
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
            {added ? <><Check className="h-4 w-4" /> Added!</> : <><Plus className="h-4 w-4" /> Add to Fridge</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
