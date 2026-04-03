import IndexScreen from '@/pages/Index';
import type { PaywallTrigger } from '@/lib/paywallStore';

type AppProps = {
  openPaywall?: (trigger: PaywallTrigger) => void;
};

export default function App({ openPaywall }: AppProps) {
  const safeOpenPaywall =
    openPaywall ??
    (() => {
      // fallback so app does not crash if prop is missing
    });

  return <IndexScreen openPaywall={safeOpenPaywall} />;
}