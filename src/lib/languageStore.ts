export type AppLanguage = 'en' | 'sv' | 'es' | 'ru' | 'zh';

const LANGUAGE_KEY = 'gymrat-language';

export const languageOptions: Array<{ value: AppLanguage; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'sv', label: 'Svenska' },
  { value: 'es', label: 'Español' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
];

type TranslationKey =
  | 'home.startWorkout'
  | 'home.shop'
  | 'home.levelGallery'
  | 'menu.title'
  | 'menu.subtitle'
  | 'menu.status'
  | 'menu.premiumActive'
  | 'menu.baseMode'
  | 'menu.unlocked'
  | 'menu.upgrade'
  | 'menu.daily'
  | 'menu.dailySub'
  | 'menu.history'
  | 'menu.historySub'
  | 'menu.nutrition'
  | 'menu.nutritionSub'
  | 'menu.gallery'
  | 'menu.gallerySub'
  | 'menu.shop'
  | 'menu.shopSub'
  | 'menu.premium'
  | 'menu.premiumSub'
  | 'menu.settings'
  | 'menu.settingsSub'
  | 'menu.active'
  | 'menu.boost'
  | 'menu.contact'
  | 'menu.report'
  | 'common.premium'
  | 'xp.progression'
  | 'xp.level'
  | 'xp.progress'
  | 'xp.currentXp'
  | 'xp.nextLevelIn'
  | 'xp.status';

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    'home.startWorkout': 'Start Workout',
    'home.shop': 'Shop',
    'home.levelGallery': 'Level Gallery',
    'menu.title': 'Menu',
    'menu.subtitle': 'Heavy flow. Fast access.',
    'menu.status': 'Status',
    'menu.premiumActive': 'Premium active',
    'menu.baseMode': 'Base mode',
    'menu.unlocked': 'Unlocked',
    'menu.upgrade': 'Upgrade',
    'menu.daily': 'Daily Check-In',
    'menu.dailySub': 'Consistency and momentum',
    'menu.history': 'History',
    'menu.historySub': 'See past sessions',
    'menu.nutrition': 'Nutrition',
    'menu.nutritionSub': 'Macros and intake',
    'menu.gallery': 'Level Gallery',
    'menu.gallerySub': 'All rat forms',
    'menu.shop': 'Shop',
    'menu.shopSub': 'Looks, backgrounds, identity',
    'menu.premium': 'Unlock Premium',
    'menu.premiumSub': 'Boost the full experience',
    'menu.settings': 'Settings',
    'menu.settingsSub': 'Profile, language, support',
    'menu.active': 'Active',
    'menu.boost': 'Boost',
    'menu.contact': 'Contact',
    'menu.report': 'Report',
    'common.premium': 'Premium',
    'xp.progression': 'Progression',
    'xp.level': 'Level',
    'xp.progress': 'Progress',
    'xp.currentXp': 'Current XP',
    'xp.nextLevelIn': 'Next level in',
    'xp.status': 'Status · Keep stacking reps',
  },
  sv: {
    'home.startWorkout': 'Starta pass',
    'home.shop': 'Shop',
    'home.levelGallery': 'Levelgalleri',
    'menu.title': 'Meny',
    'menu.subtitle': 'Tungt flow. Snabb access.',
    'menu.status': 'Status',
    'menu.premiumActive': 'Premium aktiv',
    'menu.baseMode': 'Basläge',
    'menu.unlocked': 'Upplåst',
    'menu.upgrade': 'Uppgradera',
    'menu.daily': 'Daglig check-in',
    'menu.dailySub': 'Konsekvens och momentum',
    'menu.history': 'Historik',
    'menu.historySub': 'Se tidigare pass',
    'menu.nutrition': 'Nutrition',
    'menu.nutritionSub': 'Makron och intag',
    'menu.gallery': 'Levelgalleri',
    'menu.gallerySub': 'Alla råttformer',
    'menu.shop': 'Shop',
    'menu.shopSub': 'Looks, bakgrunder, identitet',
    'menu.premium': 'Lås upp Premium',
    'menu.premiumSub': 'Maxa hela upplevelsen',
    'menu.settings': 'Inställningar',
    'menu.settingsSub': 'Profil, språk, support',
    'menu.active': 'Aktiv',
    'menu.boost': 'Boost',
    'menu.contact': 'Kontakt',
    'menu.report': 'Rapportera',
    'common.premium': 'Premium',
    'xp.progression': 'Progression',
    'xp.level': 'Level',
    'xp.progress': 'Framsteg',
    'xp.currentXp': 'Nuvarande XP',
    'xp.nextLevelIn': 'Nästa level om',
    'xp.status': 'Status · fortsätt stapla reps',
  },
  es: {
    'home.startWorkout': 'Iniciar entrenamiento',
    'home.shop': 'Tienda',
    'home.levelGallery': 'Galería de niveles',
    'menu.title': 'Menú',
    'menu.subtitle': 'Flujo pesado. Acceso rápido.',
    'menu.status': 'Estado',
    'menu.premiumActive': 'Premium activo',
    'menu.baseMode': 'Modo base',
    'menu.unlocked': 'Desbloqueado',
    'menu.upgrade': 'Mejorar',
    'menu.daily': 'Check-in diario',
    'menu.dailySub': 'Constancia y momentum',
    'menu.history': 'Historial',
    'menu.historySub': 'Ver sesiones pasadas',
    'menu.nutrition': 'Nutrición',
    'menu.nutritionSub': 'Macros e ingesta',
    'menu.gallery': 'Galería de niveles',
    'menu.gallerySub': 'Todas las formas de rata',
    'menu.shop': 'Tienda',
    'menu.shopSub': 'Looks, fondos, identidad',
    'menu.premium': 'Desbloquear Premium',
    'menu.premiumSub': 'Mejora toda la experiencia',
    'menu.settings': 'Configuración',
    'menu.settingsSub': 'Perfil, idioma y soporte',
    'menu.active': 'Activo',
    'menu.boost': 'Boost',
    'menu.contact': 'Contacto',
    'menu.report': 'Reportar',
    'common.premium': 'Premium',
    'xp.progression': 'Progresión',
    'xp.level': 'Nivel',
    'xp.progress': 'Progreso',
    'xp.currentXp': 'XP actual',
    'xp.nextLevelIn': 'Siguiente nivel en',
    'xp.status': 'Estado · sigue acumulando reps',
  },
  ru: {
    'home.startWorkout': 'Начать тренировку',
    'home.shop': 'Магазин',
    'home.levelGallery': 'Галерея уровней',
    'menu.title': 'Меню',
    'menu.subtitle': 'Тяжёлый вайб. Быстрый доступ.',
    'menu.status': 'Статус',
    'menu.premiumActive': 'Премиум активен',
    'menu.baseMode': 'Базовый режим',
    'menu.unlocked': 'Открыто',
    'menu.upgrade': 'Улучшить',
    'menu.daily': 'Ежедневный чек-ин',
    'menu.dailySub': 'Стабильность и импульс',
    'menu.history': 'История',
    'menu.historySub': 'Прошлые тренировки',
    'menu.nutrition': 'Питание',
    'menu.nutritionSub': 'Макросы и рацион',
    'menu.gallery': 'Галерея уровней',
    'menu.gallerySub': 'Все формы крысы',
    'menu.shop': 'Магазин',
    'menu.shopSub': 'Образы, фоны, стиль',
    'menu.premium': 'Открыть Premium',
    'menu.premiumSub': 'Усиль весь опыт',
    'menu.settings': 'Настройки',
    'menu.settingsSub': 'Профиль, язык, поддержка',
    'menu.active': 'Активно',
    'menu.boost': 'Буст',
    'menu.contact': 'Контакт',
    'menu.report': 'Сообщить',
    'common.premium': 'Premium',
    'xp.progression': 'Прогресс',
    'xp.level': 'Уровень',
    'xp.progress': 'Прогресс',
    'xp.currentXp': 'Текущий XP',
    'xp.nextLevelIn': 'До следующего уровня',
    'xp.status': 'Статус · продолжай набивать повторения',
  },
  zh: {
    'home.startWorkout': '开始训练',
    'home.shop': '商店',
    'home.levelGallery': '等级画廊',
    'menu.title': '菜单',
    'menu.subtitle': '更硬核的流程，更快的入口。',
    'menu.status': '状态',
    'menu.premiumActive': 'Premium 已激活',
    'menu.baseMode': '基础模式',
    'menu.unlocked': '已解锁',
    'menu.upgrade': '升级',
    'menu.daily': '每日签到',
    'menu.dailySub': '稳定性与势头',
    'menu.history': '历史',
    'menu.historySub': '查看过往训练',
    'menu.nutrition': '营养',
    'menu.nutritionSub': '宏量与摄入',
    'menu.gallery': '等级画廊',
    'menu.gallerySub': '全部老鼠形态',
    'menu.shop': '商店',
    'menu.shopSub': '外观、背景、身份感',
    'menu.premium': '解锁 Premium',
    'menu.premiumSub': '强化完整体验',
    'menu.settings': '设置',
    'menu.settingsSub': '资料、语言、支持',
    'menu.active': '已启用',
    'menu.boost': '强化',
    'menu.contact': '联系',
    'menu.report': '报告',
    'common.premium': 'Premium',
    'xp.progression': '进度',
    'xp.level': '等级',
    'xp.progress': '进展',
    'xp.currentXp': '当前 XP',
    'xp.nextLevelIn': '距离下一等级',
    'xp.status': '状态 · 继续堆叠 reps',
  },
};

export function isAppLanguage(value: string): value is AppLanguage {
  return ['en', 'sv', 'es', 'ru', 'zh'].includes(value);
}

export function getLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && isAppLanguage(stored)) return stored;

  return 'en';
}

export function setLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(LANGUAGE_KEY, language);

  window.dispatchEvent(
    new CustomEvent('gymrat-language-updated', {
      detail: { language },
    }),
  );
}

export function getLanguageLabel(language: AppLanguage) {
  const found = languageOptions.find((option) => option.value === language);
  return found?.label ?? 'English';
}

export function t(key: TranslationKey, language?: AppLanguage) {
  const currentLanguage = language ?? getLanguage();
  return translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
}