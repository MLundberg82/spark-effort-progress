import { useEffect, useState } from 'react';

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
  | 'common.back'
  | 'common.days'
  | 'common.free'
  | 'common.premium'
  | 'common.saved'
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.identity'
  | 'settings.identitySub'
  | 'settings.height'
  | 'settings.weight'
  | 'settings.goal'
  | 'settings.goalSub'
  | 'settings.training'
  | 'settings.trainingSub'
  | 'settings.language'
  | 'settings.languageSub'
  | 'settings.support'
  | 'settings.supportSub'
  | 'settings.contact'
  | 'settings.report'
  | 'settings.save'
  | 'settings.male'
  | 'settings.female'
  | 'settings.nonBinary'
  | 'settings.lose'
  | 'settings.maintain'
  | 'settings.build'
  | 'settings.beginner'
  | 'settings.intermediate'
  | 'settings.advanced'
  | 'workoutStart.title'
  | 'workoutStart.subtitle'
  | 'workoutStart.premiumMode'
  | 'workoutStart.customTitle'
  | 'workoutStart.customSubtitle'
  | 'workoutStart.customButton'
  | 'workoutStart.unlockPremium'
  | 'workoutStart.pickSession'
  | 'workoutStart.fastStart'
  | 'workoutStart.customLocked'
  | 'workoutStart.customLockedSub'
  | 'workoutComplete.complete'
  | 'workoutComplete.levelUp'
  | 'workoutComplete.titleA'
  | 'workoutComplete.titleB'
  | 'workoutComplete.doneText'
  | 'workoutComplete.xpEarned'
  | 'workoutComplete.level'
  | 'workoutComplete.levelFromTo'
  | 'workoutComplete.levelProgressUpdated'
  | 'workoutComplete.xpProgress'
  | 'workoutComplete.totalXp'
  | 'workoutComplete.exercises'
  | 'workoutComplete.duration'
  | 'workoutComplete.volume'
  | 'workoutComplete.coins'
  | 'workoutComplete.backHome'
  | 'workoutComplete.premiumBoost'
  | 'workoutComplete.makeItHit'
  | 'workoutComplete.makeItHitSub'
  | 'workoutComplete.animating'
  | 'workoutComplete.newForm';

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    'common.back': 'Back',
    'common.days': 'days',
    'common.free': 'Free',
    'common.premium': 'Premium',
    'common.saved': 'Saved',
    'settings.title': 'Control Center',
    'settings.subtitle': 'Identity, progression setup, language and support in one place.',
    'settings.identity': 'Identity',
    'settings.identitySub': 'This decides which rat variant the app should use.',
    'settings.height': 'Height',
    'settings.weight': 'Weight',
    'settings.goal': 'Goal',
    'settings.goalSub': 'Controls the main direction of the app.',
    'settings.training': 'Training setup',
    'settings.trainingSub': 'Controls the kind of workout plan the app prepares.',
    'settings.language': 'Language',
    'settings.languageSub': 'The app can auto-detect first, then remember your choice.',
    'settings.support': 'Support',
    'settings.supportSub': 'Direct access from inside the app.',
    'settings.contact': 'Contact',
    'settings.report': 'Report bug',
    'settings.save': 'Save Settings',
    'settings.male': 'Male',
    'settings.female': 'Female',
    'settings.nonBinary': 'Non-binary',
    'settings.lose': 'Lose',
    'settings.maintain': 'Maintain',
    'settings.build': 'Build',
    'settings.beginner': 'Beginner',
    'settings.intermediate': 'Intermediate',
    'settings.advanced': 'Advanced',
    'workoutStart.title': 'Start workout',
    'workoutStart.subtitle': 'Fast start. Heavy feel. Built for momentum.',
    'workoutStart.premiumMode': 'Premium mode',
    'workoutStart.customTitle': 'Custom Workout',
    'workoutStart.customSubtitle': 'No preset wall. Build your own session and go straight into work.',
    'workoutStart.customButton': 'Start Custom Workout',
    'workoutStart.unlockPremium': 'Unlock Premium',
    'workoutStart.pickSession': 'Pick your session',
    'workoutStart.fastStart': 'Fast start',
    'workoutStart.customLocked': 'Custom Workout',
    'workoutStart.customLockedSub': 'Build your own session from scratch and train exactly how you want.',
    'workoutComplete.complete': 'Workout complete',
    'workoutComplete.levelUp': 'Level Up',
    'workoutComplete.titleA': 'Session',
    'workoutComplete.titleB': 'Crushed',
    'workoutComplete.doneText': 'Work converted into XP, momentum and a stronger GymRat.',
    'workoutComplete.xpEarned': 'XP earned',
    'workoutComplete.level': 'Level',
    'workoutComplete.levelFromTo': 'You went from level {from} to level {to}.',
    'workoutComplete.levelProgressUpdated': 'Level {level} progression updated.',
    'workoutComplete.xpProgress': 'XP progress',
    'workoutComplete.totalXp': 'Total XP',
    'workoutComplete.exercises': 'Exercises',
    'workoutComplete.duration': 'Duration',
    'workoutComplete.volume': 'Volume',
    'workoutComplete.coins': 'Coins',
    'workoutComplete.backHome': 'Back Home',
    'workoutComplete.premiumBoost': 'Premium boost',
    'workoutComplete.makeItHit': 'Make progression hit harder',
    'workoutComplete.makeItHitSub': 'Stronger identity, cleaner flow and more dopamine in every session.',
    'workoutComplete.animating': 'Animating progression…',
    'workoutComplete.newForm': 'New Form',
  },
  sv: {
    'common.back': 'Tillbaka',
    'common.days': 'dagar',
    'common.free': 'Gratis',
    'common.premium': 'Premium',
    'common.saved': 'Sparat',
    'settings.title': 'Kontrollcenter',
    'settings.subtitle': 'Identitet, progression, språk och support på ett ställe.',
    'settings.identity': 'Identitet',
    'settings.identitySub': 'Det här avgör vilken råttvariant appen ska använda.',
    'settings.height': 'Längd',
    'settings.weight': 'Vikt',
    'settings.goal': 'Mål',
    'settings.goalSub': 'Styr appens huvudsakliga riktning.',
    'settings.training': 'Träningsupplägg',
    'settings.trainingSub': 'Styr vilken typ av träningsplan appen förbereder.',
    'settings.language': 'Språk',
    'settings.languageSub': 'Appen kan känna av språk först och sedan minnas ditt val.',
    'settings.support': 'Support',
    'settings.supportSub': 'Direkt åtkomst inifrån appen.',
    'settings.contact': 'Kontakt',
    'settings.report': 'Rapportera bugg',
    'settings.save': 'Spara inställningar',
    'settings.male': 'Man',
    'settings.female': 'Kvinna',
    'settings.nonBinary': 'Icke-binär',
    'settings.lose': 'Minska',
    'settings.maintain': 'Bibehålla',
    'settings.build': 'Bygga',
    'settings.beginner': 'Nybörjare',
    'settings.intermediate': 'Medel',
    'settings.advanced': 'Avancerad',
    'workoutStart.title': 'Starta pass',
    'workoutStart.subtitle': 'Snabb start. Tung känsla. Byggt för momentum.',
    'workoutStart.premiumMode': 'Premium-läge',
    'workoutStart.customTitle': 'Eget pass',
    'workoutStart.customSubtitle': 'Ingen preset-vägg. Bygg ditt eget pass och gå rakt in i jobbet.',
    'workoutStart.customButton': 'Starta eget pass',
    'workoutStart.unlockPremium': 'Lås upp Premium',
    'workoutStart.pickSession': 'Välj ditt pass',
    'workoutStart.fastStart': 'Snabb start',
    'workoutStart.customLocked': 'Eget pass',
    'workoutStart.customLockedSub': 'Bygg ditt eget pass från grunden och träna exakt som du vill.',
    'workoutComplete.complete': 'Pass klart',
    'workoutComplete.levelUp': 'Level Up',
    'workoutComplete.titleA': 'Passet',
    'workoutComplete.titleB': 'Krossat',
    'workoutComplete.doneText': 'Arbetet omvandlat till XP, momentum och en starkare GymRat.',
    'workoutComplete.xpEarned': 'XP tjänat',
    'workoutComplete.level': 'Level',
    'workoutComplete.levelFromTo': 'Du gick från level {from} till level {to}.',
    'workoutComplete.levelProgressUpdated': 'Progression för level {level} uppdaterad.',
    'workoutComplete.xpProgress': 'XP-progress',
    'workoutComplete.totalXp': 'Total XP',
    'workoutComplete.exercises': 'Övningar',
    'workoutComplete.duration': 'Tid',
    'workoutComplete.volume': 'Volym',
    'workoutComplete.coins': 'Coins',
    'workoutComplete.backHome': 'Till hem',
    'workoutComplete.premiumBoost': 'Premium-boost',
    'workoutComplete.makeItHit': 'Få progressionen att slå hårdare',
    'workoutComplete.makeItHitSub': 'Starkare identitet, renare flöde och mer dopamin i varje pass.',
    'workoutComplete.animating': 'Animerar progression…',
    'workoutComplete.newForm': 'Ny Form',
  },
  es: {
    'common.back': 'Atrás',
    'common.days': 'días',
    'common.free': 'Gratis',
    'common.premium': 'Premium',
    'common.saved': 'Guardado',
    'settings.title': 'Centro de control',
    'settings.subtitle': 'Identidad, progresión, idioma y soporte en un solo lugar.',
    'settings.identity': 'Identidad',
    'settings.identitySub': 'Esto decide qué variante de rata usa la app.',
    'settings.height': 'Altura',
    'settings.weight': 'Peso',
    'settings.goal': 'Objetivo',
    'settings.goalSub': 'Controla la dirección principal de la app.',
    'settings.training': 'Plan de entrenamiento',
    'settings.trainingSub': 'Controla qué tipo de plan prepara la app.',
    'settings.language': 'Idioma',
    'settings.languageSub': 'La app puede detectarlo primero y luego recordar tu elección.',
    'settings.support': 'Soporte',
    'settings.supportSub': 'Acceso directo desde la app.',
    'settings.contact': 'Contacto',
    'settings.report': 'Reportar error',
    'settings.save': 'Guardar ajustes',
    'settings.male': 'Hombre',
    'settings.female': 'Mujer',
    'settings.nonBinary': 'No binario',
    'settings.lose': 'Bajar',
    'settings.maintain': 'Mantener',
    'settings.build': 'Construir',
    'settings.beginner': 'Principiante',
    'settings.intermediate': 'Intermedio',
    'settings.advanced': 'Avanzado',
    'workoutStart.title': 'Iniciar entrenamiento',
    'workoutStart.subtitle': 'Inicio rápido. Sensación pesada. Hecho para momentum.',
    'workoutStart.premiumMode': 'Modo Premium',
    'workoutStart.customTitle': 'Entrenamiento personalizado',
    'workoutStart.customSubtitle': 'Sin muro de presets. Crea tu sesión y entra directo al trabajo.',
    'workoutStart.customButton': 'Iniciar entrenamiento personalizado',
    'workoutStart.unlockPremium': 'Desbloquear Premium',
    'workoutStart.pickSession': 'Elige tu sesión',
    'workoutStart.fastStart': 'Inicio rápido',
    'workoutStart.customLocked': 'Entrenamiento personalizado',
    'workoutStart.customLockedSub': 'Crea tu propia sesión desde cero y entrena exactamente como quieras.',
    'workoutComplete.complete': 'Entrenamiento completado',
    'workoutComplete.levelUp': 'Subiste de nivel',
    'workoutComplete.titleA': 'Sesión',
    'workoutComplete.titleB': 'Aplastada',
    'workoutComplete.doneText': 'Trabajo convertido en XP, impulso y un GymRat más fuerte.',
    'workoutComplete.xpEarned': 'XP ganada',
    'workoutComplete.level': 'Nivel',
    'workoutComplete.levelFromTo': 'Fuiste del nivel {from} al nivel {to}.',
    'workoutComplete.levelProgressUpdated': 'Progreso del nivel {level} actualizado.',
    'workoutComplete.xpProgress': 'Progreso XP',
    'workoutComplete.totalXp': 'XP total',
    'workoutComplete.exercises': 'Ejercicios',
    'workoutComplete.duration': 'Duración',
    'workoutComplete.volume': 'Volumen',
    'workoutComplete.coins': 'Monedas',
    'workoutComplete.backHome': 'Volver al inicio',
    'workoutComplete.premiumBoost': 'Impulso Premium',
    'workoutComplete.makeItHit': 'Haz que la progresión pegue más fuerte',
    'workoutComplete.makeItHitSub': 'Más identidad, flujo más limpio y más dopamina en cada sesión.',
    'workoutComplete.animating': 'Animando progresión…',
    'workoutComplete.newForm': 'Nueva Forma',
  },
  ru: {
    'common.back': 'Назад',
    'common.days': 'дней',
    'common.free': 'Бесплатно',
    'common.premium': 'Premium',
    'common.saved': 'Сохранено',
    'settings.title': 'Центр управления',
    'settings.subtitle': 'Идентичность, прогресс, язык и поддержка в одном месте.',
    'settings.identity': 'Идентичность',
    'settings.identitySub': 'Это определяет, какую форму крысы использует приложение.',
    'settings.height': 'Рост',
    'settings.weight': 'Вес',
    'settings.goal': 'Цель',
    'settings.goalSub': 'Определяет основное направление приложения.',
    'settings.training': 'Тренировочный план',
    'settings.trainingSub': 'Определяет, какой тип плана готовит приложение.',
    'settings.language': 'Язык',
    'settings.languageSub': 'Сначала приложение может определить язык автоматически, потом запомнить твой выбор.',
    'settings.support': 'Поддержка',
    'settings.supportSub': 'Прямой доступ из приложения.',
    'settings.contact': 'Контакт',
    'settings.report': 'Сообщить об ошибке',
    'settings.save': 'Сохранить настройки',
    'settings.male': 'Мужчина',
    'settings.female': 'Женщина',
    'settings.nonBinary': 'Небинарный',
    'settings.lose': 'Снизить',
    'settings.maintain': 'Поддерживать',
    'settings.build': 'Набрать',
    'settings.beginner': 'Новичок',
    'settings.intermediate': 'Средний',
    'settings.advanced': 'Продвинутый',
    'workoutStart.title': 'Начать тренировку',
    'workoutStart.subtitle': 'Быстрый старт. Тяжёлое ощущение. Сделано для импульса.',
    'workoutStart.premiumMode': 'Режим Premium',
    'workoutStart.customTitle': 'Своя тренировка',
    'workoutStart.customSubtitle': 'Без стены из пресетов. Собери свою сессию и сразу в работу.',
    'workoutStart.customButton': 'Начать свою тренировку',
    'workoutStart.unlockPremium': 'Открыть Premium',
    'workoutStart.pickSession': 'Выбери сессию',
    'workoutStart.fastStart': 'Быстрый старт',
    'workoutStart.customLocked': 'Своя тренировка',
    'workoutStart.customLockedSub': 'Собери тренировку с нуля и тренируйся так, как хочешь.',
    'workoutComplete.complete': 'Тренировка завершена',
    'workoutComplete.levelUp': 'Новый уровень',
    'workoutComplete.titleA': 'Сессию',
    'workoutComplete.titleB': 'Разнёс',
    'workoutComplete.doneText': 'Работа превращена в XP, импульс и более сильного GymRat.',
    'workoutComplete.xpEarned': 'Получено XP',
    'workoutComplete.level': 'Уровень',
    'workoutComplete.levelFromTo': 'Ты перешёл с уровня {from} на уровень {to}.',
    'workoutComplete.levelProgressUpdated': 'Прогресс уровня {level} обновлён.',
    'workoutComplete.xpProgress': 'Прогресс XP',
    'workoutComplete.totalXp': 'Всего XP',
    'workoutComplete.exercises': 'Упражнения',
    'workoutComplete.duration': 'Длительность',
    'workoutComplete.volume': 'Объём',
    'workoutComplete.coins': 'Монеты',
    'workoutComplete.backHome': 'Домой',
    'workoutComplete.premiumBoost': 'Premium-буст',
    'workoutComplete.makeItHit': 'Сделай прогресс сильнее',
    'workoutComplete.makeItHitSub': 'Больше идентичности, чище поток и больше дофамина в каждой сессии.',
    'workoutComplete.animating': 'Анимация прогресса…',
    'workoutComplete.newForm': 'Новая Форма',
  },
  zh: {
    'common.back': '返回',
    'common.days': '天',
    'common.free': '免费',
    'common.premium': 'Premium',
    'common.saved': '已保存',
    'settings.title': '控制中心',
    'settings.subtitle': '身份、进度、语言和支持集中在一个地方。',
    'settings.identity': '身份',
    'settings.identitySub': '这决定应用使用哪种老鼠形态。',
    'settings.height': '身高',
    'settings.weight': '体重',
    'settings.goal': '目标',
    'settings.goalSub': '控制应用的主要方向。',
    'settings.training': '训练设置',
    'settings.trainingSub': '控制应用准备哪种训练计划。',
    'settings.language': '语言',
    'settings.languageSub': '应用可先自动识别语言，然后记住你的选择。',
    'settings.support': '支持',
    'settings.supportSub': '可直接从应用中访问。',
    'settings.contact': '联系',
    'settings.report': '报告问题',
    'settings.save': '保存设置',
    'settings.male': '男性',
    'settings.female': '女性',
    'settings.nonBinary': '非二元',
    'settings.lose': '减脂',
    'settings.maintain': '维持',
    'settings.build': '增肌',
    'settings.beginner': '初级',
    'settings.intermediate': '中级',
    'settings.advanced': '高级',
    'workoutStart.title': '开始训练',
    'workoutStart.subtitle': '快速开始。更重的感觉。为势头而生。',
    'workoutStart.premiumMode': 'Premium 模式',
    'workoutStart.customTitle': '自定义训练',
    'workoutStart.customSubtitle': '没有预设墙。自己组建训练，直接开练。',
    'workoutStart.customButton': '开始自定义训练',
    'workoutStart.unlockPremium': '解锁 Premium',
    'workoutStart.pickSession': '选择训练',
    'workoutStart.fastStart': '快速开始',
    'workoutStart.customLocked': '自定义训练',
    'workoutStart.customLockedSub': '从零开始建立自己的训练，按你想要的方式训练。',
    'workoutComplete.complete': '训练完成',
    'workoutComplete.levelUp': '升级',
    'workoutComplete.titleA': '训练',
    'workoutComplete.titleB': '碾压完成',
    'workoutComplete.doneText': '你的努力已转化为 XP、势头和更强的 GymRat。',
    'workoutComplete.xpEarned': '获得 XP',
    'workoutComplete.level': '等级',
    'workoutComplete.levelFromTo': '你从等级 {from} 升到了等级 {to}。',
    'workoutComplete.levelProgressUpdated': '等级 {level} 的进度已更新。',
    'workoutComplete.xpProgress': 'XP 进度',
    'workoutComplete.totalXp': '总 XP',
    'workoutComplete.exercises': '动作',
    'workoutComplete.duration': '时长',
    'workoutComplete.volume': '训练量',
    'workoutComplete.coins': '金币',
    'workoutComplete.backHome': '返回首页',
    'workoutComplete.premiumBoost': 'Premium 强化',
    'workoutComplete.makeItHit': '让进度更有冲击力',
    'workoutComplete.makeItHitSub': '更强身份感、更干净流程、每次训练更多多巴胺。',
    'workoutComplete.animating': '进度动画中…',
    'workoutComplete.newForm': '新形态',
  },
};

export function isAppLanguage(value: string): value is AppLanguage {
  return ['en', 'sv', 'es', 'ru', 'zh'].includes(value);
}

function detectFromNavigator(): AppLanguage {
  if (typeof navigator === 'undefined') return 'en';

  const lang = (navigator.language || 'en').toLowerCase();

  if (lang.startsWith('sv')) return 'sv';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('zh')) return 'zh';
  return 'en';
}

export function ensureLanguageInitialized(): AppLanguage {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && isAppLanguage(stored)) return stored;

  const detected = detectFromNavigator();
  localStorage.setItem(LANGUAGE_KEY, detected);
  return detected;
}

export function getLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && isAppLanguage(stored)) return stored;

  return ensureLanguageInitialized();
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

export function t(
  key: TranslationKey,
  language?: AppLanguage,
  vars?: Record<string, string | number>,
) {
  const current = language ?? getLanguage();
  let value = translations[current]?.[key] ?? translations.en[key] ?? key;

  if (vars) {
    Object.entries(vars).forEach(([varKey, varValue]) => {
      value = value.replaceAll(`{${varKey}}`, String(varValue));
    });
  }

  return value;
}

export function useAppLanguage() {
  const [language, setLanguageState] = useState<AppLanguage>(() => getLanguage());

  useEffect(() => {
    ensureLanguageInitialized();

    const sync = () => setLanguageState(getLanguage());

    window.addEventListener('gymrat-language-updated', sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('gymrat-language-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return language;
}