import { useState, useEffect } from 'react';
import { Flame, RefreshCw } from 'lucide-react';
import { useT, getLanguage } from '@/lib/i18n';

interface Quote {
  text: string;
  author: string;
}

const quotesByLang: Record<string, Quote[]> = {
  en: [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
    { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
    { text: "Don't limit your challenges. Challenge your limits.", author: "Jerry Dunn" },
    { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
    { text: "No matter how slow you go, you are still lapping everybody on the couch.", author: "Unknown" },
    { text: "What hurts today makes you stronger tomorrow.", author: "Jay Cutler" },
  ],
  sv: [
    { text: "Det enda dåliga träningspasset är det som aldrig hände.", author: "Okänd" },
    { text: "Styrka kommer inte från fysisk kapacitet. Den kommer från en oböjlig vilja.", author: "Mahatma Gandhi" },
    { text: "Smärtan du känner idag blir styrkan du känner imorgon.", author: "Arnold Schwarzenegger" },
    { text: "Framgång handlar inte alltid om storhet. Det handlar om konsekvens.", author: "Dwayne Johnson" },
    { text: "Begränsa inte dina utmaningar. Utmana dina begränsningar.", author: "Jerry Dunn" },
    { text: "Kroppen uppnår vad sinnet tror på.", author: "Napoleon Hill" },
    { text: "Oavsett hur långsamt du går, springer du fortfarande om alla i soffan.", author: "Okänd" },
    { text: "Det som gör ont idag gör dig starkare imorgon.", author: "Jay Cutler" },
  ],
  es: [
    { text: "El único mal entrenamiento es el que no hiciste.", author: "Desconocido" },
    { text: "La fuerza no viene de la capacidad física. Viene de una voluntad inquebrantable.", author: "Mahatma Gandhi" },
    { text: "El dolor que sientes hoy será la fuerza que sentirás mañana.", author: "Arnold Schwarzenegger" },
    { text: "El éxito no siempre se trata de grandeza. Se trata de consistencia.", author: "Dwayne Johnson" },
    { text: "No limites tus desafíos. Desafía tus límites.", author: "Jerry Dunn" },
  ],
  zh: [
    { text: "唯一糟糕的锻炼就是你没有做的那次。", author: "未知" },
    { text: "力量不是来自身体能力，而是来自不屈不挠的意志。", author: "圣雄甘地" },
    { text: "今天感受到的痛苦，将成为明天的力量。", author: "阿诺德·施瓦辛格" },
    { text: "成功并不总是关于伟大，而是关于坚持。", author: "道恩·强森" },
  ],
  ru: [
    { text: "Единственная плохая тренировка — та, которой не было.", author: "Неизвестный" },
    { text: "Сила не от физических возможностей. Она от несокрушимой воли.", author: "Махатма Ганди" },
    { text: "Боль, которую ты чувствуешь сегодня — это сила, которую ты почувствуешь завтра.", author: "Арнольд Шварценеггер" },
    { text: "Успех — это не всегда про величие. Это про постоянство.", author: "Дуэйн Джонсон" },
  ],
  ar: [
    { text: "التمرين السيء الوحيد هو الذي لم يحدث.", author: "مجهول" },
    { text: "القوة لا تأتي من القدرة الجسدية بل من إرادة لا تقهر.", author: "المهاتما غاندي" },
    { text: "الألم الذي تشعر به اليوم سيكون القوة التي تشعر بها غداً.", author: "أرنولد شوارزنيجر" },
  ],
};

const MotivationalQuote = () => {
  const t = useT();
  const lang = getLanguage();
  const quotes = quotesByLang[lang] || quotesByLang.en;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * quotes.length));
  }, [quotes.length]);

  const nextQuote = () => {
    setIndex(prev => (prev + 1) % quotes.length);
  };

  const quote = quotes[index];

  return (
    <div className="card-3d rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-10 rounded-full blur-2xl" />
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">{t('dailyMotivation')}</span>
      </div>
      <blockquote className="text-foreground font-display text-lg font-semibold leading-relaxed mb-2 animate-fade-in" key={index}>
        "{quote.text}"
      </blockquote>
      <div className="flex items-center justify-between">
        <cite className="text-muted-foreground text-sm not-italic">— {quote.author}</cite>
        <button onClick={nextQuote} className="text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MotivationalQuote;
