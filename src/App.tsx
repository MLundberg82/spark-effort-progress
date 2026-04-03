import IndexScreen from '@/pages/Index';
import type { PaywallTrigger } from '@/lib/paywallStore';

type AppProps = {
  openPaywall?: (trigger: PaywallTrigger) => void;
};

export default function App({ openPaywall }: AppProps) {
  const handleOpenPaywall = openPaywall ?? (() => {});

  return <IndexScreen openPaywall={handleOpenPaywall} />;
}