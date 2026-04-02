import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrainingLevel } from '@/lib/exerciseData';
import { setTrainingLevel as saveTrainingLevel, getPlansForLevel, getSelectedPlanIndex, setSelectedPlanIndex } from '@/lib/trainingStore';
import { useT, getLanguage, setLanguage, languageLabels, Language } from '@/lib/i18n';
import { checkPremium, restorePurchases, getPremiumStatus } from '@/lib/premiumStore';
import { trackEvent } from '@/lib/analytics';
import { Dumbbell, Target, Zap, Sun, Moon, Download, Mail, Globe, Crown, Gift, Bell, BellOff, Shield, FileText, RefreshCw, Bug, HelpCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import RedeemCode from './RedeemCode';
import levelupLogo from '@/assets/levelup-labs-logo.png';

const APP_VERSION = '1.0.0';

interface Props {
  trainingLevel: TrainingLevel;
  onTrainingLevelChange: (level: TrainingLevel) => void;
}

const levels: { id: TrainingLevel; labelKey: string; icon: typeof Dumbbell }[] = [
  { id: 'beginner', labelKey: 'beginner', icon: Dumbbell },
  { id: 'intermediate', labelKey: 'intermediate', icon: Target },
  { id: 'advanced', labelKey: 'advanced', icon: Zap },
];

function getTheme(): 'dark' | 'light' {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

function setTheme(theme: 'dark' | 'light') {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
    localStorage.setItem('gymrat-theme', 'light');
  } else {
    document.documentElement.classList.remove('light');
    localStorage.setItem('gymrat-theme', 'dark');
  }
}

function getNotificationsEnabled(): boolean {
  return localStorage.getItem('gymrat-notifications') !== 'false';
}

function setNotificationsEnabled(val: boolean) {
  localStorage.setItem('gymrat-notifications', val ? 'true' : 'false');
}

function exportAllData() {
  const keys = [
    'fitforge-workouts', 'fitforge-nutrition', 'fitforge-training-level',
    'fitforge-selected-plan', 'gymrat-theme', 'gymrat-email', 'gymrat-language',
    'gymrat-xp', 'gymrat-level', 'gymrat-pbs', 'gymrat-premium', 'gymrat-profile',
    'gymrat-shop-purchases', 'gymrat-equipped', 'gymrat-redeemed-codes',
  ];
  const data: Record<string, unknown> = {};
  keys.forEach(key => {
    const val = localStorage.getItem(key);
    if (val !== null) {
      try { data[key] = JSON.parse(val); } catch { data[key] = val; }
    }
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gymrat-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
        resolve();
      } catch (e) { reject(e); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const SettingsContent = ({ trainingLevel, onTrainingLevelChange }: Props) => {
  const t = useT();
  const [theme, setThemeState] = useState<'dark' | 'light'>(getTheme());
  const [email, setEmail] = useState(localStorage.getItem('gymrat-email') || '');
  const [selectedPlan, setSelectedPlan] = useState(getSelectedPlanIndex());
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(getNotificationsEnabled());
  const [restoringPurchases, setRestoringPurchases] = useState(false);

  const plans = getPlansForLevel(trainingLevel);
  const premium = checkPremium();
  const premiumStatus = getPremiumStatus();

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  const handleLevelChange = (level: TrainingLevel) => {
    saveTrainingLevel(level);
    setSelectedPlan(0);
    setSelectedPlanIndex(0);
    onTrainingLevelChange(level);
  };

  const handlePlanChange = (idx: number) => {
    setSelectedPlan(idx);
    setSelectedPlanIndex(idx);
    onTrainingLevelChange(trainingLevel);
  };

  const handleEmailSave = () => {
    localStorage.setItem('gymrat-email', email);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCurrentLang(lang);
    window.location.reload();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      window.location.reload();
    } catch { alert('Invalid backup file'); }
  };

  const handleRestorePurchases = async () => {
    setRestoringPurchases(true);
    trackEvent('premium_restored');
    try {
      const restored = await restorePurchases();
      if (restored) {
        toast.success('Premium restored! 🎉');
      } else {
        toast.error('No previous purchases found');
      }
    } catch {
      toast.error('Failed to restore. Please try again.');
    }
    setRestoringPurchases(false);
  };

  const handleNotificationsToggle = () => {
    const next = !notificationsOn;
    setNotificationsEnabled(next);
    setNotificationsOn(next);
    toast.success(next ? 'Notifications enabled 🔔' : 'Notifications disabled');
  };

  return (
    <div className="space-y-6">
      <RedeemCode open={redeemOpen} onClose={() => setRedeemOpen(false)} />

      {/* Premium Status */}
      <div className="space-y-2">
        <div className={`p-4 rounded-2xl ${premium ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30' : 'card-3d'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${premium ? 'gradient-primary' : 'bg-secondary'}`}>
              <Crown className={`w-5 h-5 ${premium ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{premium ? 'Premium Active' : 'Free Plan'}</p>
              <p className="text-[10px] text-muted-foreground">
                {premium 
                  ? `Source: ${premiumStatus.source || 'purchase'}${premiumStatus.expiresAt === 'lifetime' ? ' • Lifetime' : ''}` 
                  : 'Upgrade to unlock all features'}
              </p>
            </div>
            {premium && <span className="text-xs px-2 py-1 rounded-full gradient-primary text-primary-foreground font-bold">PRO</span>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Quick Actions</label>
        <div className="space-y-1.5">
          <button onClick={() => { setRedeemOpen(true); trackEvent('premium_clicked', { source: 'settings_redeem' }); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
            <Gift className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground flex-1 text-left">Redeem Code</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button onClick={handleRestorePurchases} disabled={restoringPurchases}
            className="w-full flex items-center gap-3 p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 text-primary ${restoringPurchases ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-foreground flex-1 text-left">Restore Purchases</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Notifications</label>
        <button onClick={handleNotificationsToggle}
          className="w-full flex items-center justify-between p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
          <div className="flex items-center gap-3">
            {notificationsOn ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm font-medium text-foreground">Workout Reminders</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors shadow-inset ${notificationsOn ? 'bg-primary' : 'bg-secondary'}`}>
            <div className={`w-5 h-5 rounded-full bg-foreground transition-transform shadow-elevated ${notificationsOn ? 'translate-x-4' : ''}`} />
          </div>
        </button>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> {t('language')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(languageLabels) as [Language, string][]).map(([code, label]) => (
            <button key={code} onClick={() => handleLanguageChange(code)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentLang === code ? 'gradient-primary text-primary-foreground shadow-button btn-3d' : 'card-3d text-foreground hover:bg-secondary/50'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('appearance')}</label>
        <button onClick={handleThemeToggle}
          className="w-full flex items-center justify-between p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-accent" />}
            <span className="text-sm font-medium text-foreground">{theme === 'dark' ? t('darkMode') : t('lightMode')}</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors shadow-inset ${theme === 'light' ? 'bg-primary' : 'bg-secondary'}`}>
            <div className={`w-5 h-5 rounded-full bg-foreground transition-transform shadow-elevated ${theme === 'light' ? 'translate-x-4' : ''}`} />
          </div>
        </button>
      </div>

      {/* Training Level */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('trainingLevel')}</label>
        <div className="grid grid-cols-3 gap-2">
          {levels.map(({ id, labelKey, icon: Icon }) => (
            <button key={id} onClick={() => handleLevelChange(id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                trainingLevel === id ? 'gradient-primary text-primary-foreground shadow-button btn-3d' : 'card-3d hover:bg-secondary/50 text-foreground'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold">{t(labelKey as any)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Training Plan */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('trainingPlan')}</label>
        <div className="space-y-2">
          {plans.map((plan, idx) => (
            <button key={idx} onClick={() => handlePlanChange(idx)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                selectedPlan === idx ? 'bg-primary/15 border border-primary/40 text-foreground shadow-glow' : 'card-3d hover:bg-secondary/50 text-foreground'
              }`}>
              <p className="text-sm font-semibold">{plan.name}</p>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('emailAddress')}</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 input-3d" />
          </div>
          <Button onClick={handleEmailSave} size="sm" className="px-4 btn-3d gradient-primary text-primary-foreground">{t('save')}</Button>
        </div>
      </div>

      {/* Data Export/Import */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('dataBackup')}</label>
        <p className="text-xs text-muted-foreground">{t('exportInfo')}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={exportAllData} variant="outline" className="w-full btn-3d">
            <Download className="w-4 h-4 mr-2" /> {t('exportData')}
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" className="w-full pointer-events-none btn-3d">
              <Download className="w-4 h-4 mr-2 rotate-180" /> {t('importData')}
            </Button>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Support</label>
        <div className="space-y-1.5">
          <a href="mailto:hello@getgymrat.com"
            className="w-full flex items-center gap-3 p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
            <Mail className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Contact Support</p>
              <p className="text-[10px] text-muted-foreground">hello@getgymrat.com</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
          <a href="mailto:hello@getgymrat.com?subject=Bug%20Report%20-%20GymRat%20v${APP_VERSION}"
            className="w-full flex items-center gap-3 p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
            <Bug className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Report Bug</p>
              <p className="text-[10px] text-muted-foreground">Help us improve</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
          <a href="https://getgymrat.com" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
            <Globe className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">getgymrat.com</p>
              <p className="text-[10px] text-muted-foreground">{t('visitWebsite') || 'Visit our website'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
          <a href="https://getgymrat.com/faq" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">FAQ</p>
              <p className="text-[10px] text-muted-foreground">Frequently asked questions</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Legal */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Legal</label>
        <div className="space-y-1.5">
          <a href="https://getgymrat.com/privacy" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground flex-1 text-left">Privacy Policy</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
          <a href="https://getgymrat.com/terms" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground flex-1 text-left">Terms of Service</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Version */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-border/30">
        <img src={levelupLogo} alt="LevelUp Labs" className="w-8 h-8 opacity-60" />
        <span className="text-xs text-muted-foreground">GymRat v{APP_VERSION}</span>
        <span className="text-[9px] text-muted-foreground/60">by LevelUp Labs AB</span>
      </div>
    </div>
  );
};

export default SettingsContent;
