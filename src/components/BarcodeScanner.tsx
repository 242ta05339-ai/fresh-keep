import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Loader2, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface ScannedProduct {
  name: string;
  category?: string;
  found: boolean;
  barcode: string;
}

interface BarcodeScannerProps {
  onProductFound: (product: ScannedProduct) => void;
  onClose: () => void;
}

interface OpenFoodFactsProduct {
  product_name?: string;
  categories_tags?: string[];
}

function mapCategory(tags: string[] | undefined): string | undefined {
  if (!tags) return undefined;
  const joined = tags.join(' ').toLowerCase();
  if (/dairy|milk|cheese|yogurt|butter/.test(joined)) return 'dairy';
  if (/fruit|vegetable|produce|salad/.test(joined)) return 'produce';
  if (/meat|chicken|beef|pork|fish|seafood/.test(joined)) return 'meat';
  if (/bread|grain|cereal|pasta|rice/.test(joined)) return 'grains';
  if (/beverage|drink|juice|soda|water|coffee|tea/.test(joined)) return 'beverages';
  if (/snack|chip|cookie|candy|chocolate/.test(joined)) return 'snacks';
  if (/sauce|condiment|ketchup|mustard|dressing/.test(joined)) return 'condiments';
  if (/frozen/.test(joined)) return 'frozen';
  return 'other';
}

export default function BarcodeScanner({ onProductFound, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'starting' | 'scanning' | 'looking-up' | 'error'>('starting');
  const [errorMsg, setErrorMsg] = useState('');
  const processingRef = useRef(false);
  const isRunningRef = useRef(false);

  const lookupBarcode = useCallback(async (code: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setStatus('looking-up');

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const p = data.product as OpenFoodFactsProduct;
        const name = p.product_name || `Product ${code}`;
        onProductFound({ name, category: mapCategory(p.categories_tags), found: true, barcode: code });
        toast.success(`Found: ${name}`);
      } else {
        toast.info('Product not found — please add details manually');
        onProductFound({ name: '', category: undefined, found: false, barcode: code });
      }
    } catch {
      toast.error('Failed to look up product — please add details manually');
      onProductFound({ name: '', category: undefined, found: false, barcode: code });
    }
  }, [onProductFound]);

  useEffect(() => {
    const elementId = 'barcode-reader';
    let scanner: Html5Qrcode | null = null;

    const start = async () => {
      try {
        scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 160 } },
          (decodedText) => {
            lookupBarcode(decodedText);
          },
          () => {}
        );
        setStatus('scanning');
        isRunningRef.current = true;
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (/permission/i.test(msg)) {
          setErrorMsg('Camera permission denied. Please allow camera access and try again.');
        } else if (/not found/i.test(msg) || /no camera/i.test(msg)) {
          setErrorMsg('No camera found on this device.');
        } else {
          setErrorMsg('Could not start the camera. Try a different browser or device.');
        }
        setStatus('error');
      }
    };

    start();

    return () => {
      if (scanner && isRunningRef.current) {
        isRunningRef.current = false;
        scanner.stop().then(() => scanner!.clear()).catch(() => {});
      }
    };
  }, [lookupBarcode]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b bg-card px-4 py-3">
        <h3 className="font-display text-lg font-semibold">Scan Barcode</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        {status === 'error' ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">{errorMsg}</p>
            <Button variant="outline" onClick={onClose}>Go Back</Button>
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-primary/20 bg-black"
            >
              <div id="barcode-reader" className="w-full" />
              {status === 'looking-up' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-white">Looking up product…</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {status === 'starting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting camera…
                </>
              ) : status === 'scanning' ? (
                <>
                  <Camera className="h-4 w-4" />
                  Point at a barcode
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
