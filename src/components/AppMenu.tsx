import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu, Settings, Apple, Timer, CalendarCheck, ChevronRight, ChevronLeft, Lock } from 'lucide-react';
import SettingsPanel from './SettingsContent';
import NutritionPlanner from './NutritionPlanner';
import RestTimer from './RestTimer';
import DailyCheckIn from './DailyCheckIn';
import { isPremium } from '@/lib/gamificationStore';
import { TrainingLevel } from '@/lib/exerciseData';
import { useT } from '@/lib/i18n';

type SubMenu = 'main' | 'settings' | 'food' | 'timer' | 'checkin';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingLevel: TrainingLevel;
  onTrainingLevelChange: (level: TrainingLevel) => void;
}

const AppMenu = ({ open, onOpenChange, trainingLevel, onTrainingLevelChange }: Props) => {
  const [sub, setSub] = useState<SubMenu>('main');
  const premium = isPremium();
  const t = useT();

  const menuItems: { id: SubMenu; labelKey: keyof ReturnType<typeof t> extends never ? string : string; icon: typeof Settings; premium?: boolean }[] = [
    { id: 'checkin', labelKey: 'dailyCheckin', icon: CalendarCheck },
    { id: 'food', labelKey: 'food', icon: Apple },
    { id: 'timer', labelKey: 'timer', icon: Timer },
    { id: 'settings', labelKey: 'settings', icon: Settings },
  ];

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setSub('main'), 300);
  };

  const subLabels: Record<SubMenu, string> = {
    main: t('menu'),
    settings: t('settings'),
    food: t('food'),
    timer: t('timer'),
    checkin: t('dailyCheckin'),
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto pb-24 bg-card border-border">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pt-2">
          {sub !== 'main' && (
            <button onClick={() => setSub('main')} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="font-display text-lg font-bold text-foreground">{subLabels[sub]}</h2>
        </div>

        {/* Main menu */}
        {sub === 'main' && (
          <div className="space-y-2 animate-fade-in">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSub(item.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl card-3d hover:shadow-glow transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-foreground">{t(item.labelKey as any)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.premium && !premium && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-menus */}
        {sub === 'settings' && (
          <div className="animate-fade-in">
            <SettingsPanel trainingLevel={trainingLevel} onTrainingLevelChange={onTrainingLevelChange} />
          </div>
        )}
        {sub === 'food' && (
          <div className="animate-fade-in">
            <NutritionPlanner />
          </div>
        )}
        {sub === 'timer' && (
          <div className="animate-fade-in">
            <RestTimer />
          </div>
        )}
        {sub === 'checkin' && (
          <div className="animate-fade-in">
            <DailyCheckIn />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AppMenu;
