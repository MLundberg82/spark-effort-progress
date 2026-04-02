import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { redeemCode } from '@/lib/promoStore';
import { Gift, Check, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const RedeemCode = ({ open, onClose }: Props) => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = () => {
    setLoading(true);
    // Small delay for feel
    setTimeout(() => {
      const res = redeemCode(code);
      if (res.success) {
        setResult({ success: true, message: res.message });
      } else {
        setResult({ success: false, message: 'error' in res ? res.error : 'Unknown error' });
      }
      setLoading(false);
    }, 500);
  };

  const handleClose = () => {
    setCode('');
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[320px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> Redeem Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {result ? (
            <div className={`p-4 rounded-xl text-center space-y-2 ${
              result.success ? 'bg-primary/10' : 'bg-destructive/10'
            }`}>
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                result.success ? 'bg-primary/20' : 'bg-destructive/20'
              }`}>
                {result.success ? (
                  <Check className="w-6 h-6 text-primary" />
                ) : (
                  <X className="w-6 h-6 text-destructive" />
                )}
              </div>
              <p className={`text-sm font-bold ${result.success ? 'text-primary' : 'text-destructive'}`}>
                {result.message}
              </p>
              {result.success && (
                <button onClick={handleClose}
                  className="mt-2 px-6 py-2 rounded-xl gradient-primary text-primary-foreground font-bold text-sm btn-3d">
                  Continue
                </button>
              )}
              {!result.success && (
                <button onClick={() => setResult(null)}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground">
                  Try again
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Enter your promo code below to unlock rewards.
              </p>
              <Input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="input-3d text-center font-mono font-bold tracking-wider uppercase"
                maxLength={20}
                onKeyDown={e => e.key === 'Enter' && handleRedeem()}
              />
              <button
                onClick={handleRedeem}
                disabled={!code.trim() || loading}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-display font-bold text-sm btn-3d shadow-button disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Checking...' : 'Redeem'}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemCode;
