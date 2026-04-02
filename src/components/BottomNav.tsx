import { Home, BarChart3, Timer, Apple, Settings } from 'lucide-react';
import { useT } from '@/lib/i18n';

export type TabId = 'home' | 'log' | 'nutrition' | 'timer';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  onSettingsClick: () => void;
}

const BottomNav = ({ active, onChange, onSettingsClick }: Props) => {
  const t = useT();

  const tabs: { id: TabId; labelKey: string; icon: typeof Home }[] = [
    { id: 'home', labelKey: 'home', icon: Home },
    { id: 'log', labelKey: 'log', icon: BarChart3 },
    { id: 'nutrition', labelKey: 'food', icon: Apple },
    { id: 'timer', labelKey: 'timer', icon: Timer },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 shadow-elevated">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'animate-count-down drop-shadow-[0_0_6px_hsl(var(--primary))]' : ''}`} />
              <span className="text-[10px] font-semibold">{t(tab.labelKey as any)}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary shadow-glow" />}
            </button>
          );
        })}
        <button
          onClick={onSettingsClick}
          className="flex flex-col items-center gap-0.5 px-3 py-2 transition-all text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-semibold">{t('settings')}</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
