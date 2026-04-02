import { useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { Camera, X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface NutritionResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

interface Props {
  onResult: (result: NutritionResult) => void;
}

const BarcodeScanner = ({ onResult }: Props) => {
  const t = useT();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>('barcode-reader-' + Math.random().toString(36).slice(2));

  const lookupBarcode = useCallback(async (code: string) => {
    setLoading(true);
    try {
      // Try Scandinavian/EU-specific endpoints first, then global
      const endpoints = [
        `https://se.openfoodfacts.org/api/v0/product/${code}.json`,
        `https://no.openfoodfacts.org/api/v0/product/${code}.json`,
        `https://dk.openfoodfacts.org/api/v0/product/${code}.json`,
        `https://fi.openfoodfacts.org/api/v0/product/${code}.json`,
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      ];

      let product = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.status === 1 && data.product) {
            product = data.product;
            break;
          }
        } catch {}
      }

      if (!product) {
        toast.error(t('productNotFound' as any) || 'Product not found. Try entering manually.');
        return;
      }

      const nutrients = product.nutriments || {};
      const name = product.product_name || product.generic_name || 'Unknown Product';
      const serving = product.serving_size || '100g';

      // EU products use kJ often - convert if needed
      let calories = Math.round(nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0);
      if (calories === 0 && nutrients['energy-kj_100g']) {
        calories = Math.round(nutrients['energy-kj_100g'] / 4.184);
      }
      if (calories === 0 && nutrients['energy_100g']) {
        // could be kJ or kcal depending on product
        const val = nutrients['energy_100g'];
        calories = val > 400 ? Math.round(val / 4.184) : Math.round(val);
      }

      const result: NutritionResult = {
        name,
        calories,
        protein: Math.round(nutrients.proteins_100g || nutrients.proteins || 0),
        carbs: Math.round(nutrients.carbohydrates_100g || nutrients.carbohydrates || 0),
        fat: Math.round(nutrients.fat_100g || nutrients.fat || 0),
        servingSize: serving,
      };

      onResult(result);
      toast.success(`${t('found' as any) || 'Found'}: ${name}`);
    } catch {
      toast.error(t('lookupFailed' as any) || 'Failed to look up product.');
    } finally {
      setLoading(false);
    }
  }, [onResult, t]);

  const startScanning = useCallback(async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 100));

    try {
      const scanner = new Html5Qrcode(containerRef.current);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          await stopScanning();
          lookupBarcode(decodedText);
        },
        () => {}
      );
    } catch {
      toast.error('Could not access camera.');
      setScanning(false);
    }
  }, [lookupBarcode]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleManualLookup = () => {
    const code = manualCode.trim();
    if (code.length < 4) {
      toast.error('Enter a valid barcode number');
      return;
    }
    lookupBarcode(code);
  };

  return (
    <div className="card-3d rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">{t('scanNutrition')}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{t('scanBarcode')}</p>

      {scanning ? (
        <div className="space-y-2">
          <div id={containerRef.current} className="w-full rounded-lg overflow-hidden" style={{ minHeight: 200 }} />
          <Button variant="outline" className="w-full btn-3d" onClick={stopScanning}>
            <X className="w-4 h-4 mr-2" /> {t('stopScanning')}
          </Button>
        </div>
      ) : (
        <Button className="w-full gradient-primary text-primary-foreground btn-3d" onClick={startScanning} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
          {loading ? t('lookingUp') : t('openCamera')}
        </Button>
      )}

      <div className="flex gap-2">
        <Input
          placeholder={t('orTypeBarcode')}
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          className="flex-1 input-3d"
        />
        <Button size="icon" onClick={handleManualLookup} disabled={loading} className="btn-3d">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default BarcodeScanner;
