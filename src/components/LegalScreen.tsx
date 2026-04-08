import { ArrowLeft, FileText, Shield } from 'lucide-react';

type LegalVariant = 'terms' | 'privacy';

type LegalScreenProps = {
  variant: LegalVariant;
  onBack: () => void;
};

const termsSections = [
  {
    title: '1. Use of the service',
    body: 'GetGymRat provides fitness tools, workout tracking, progress features and related content for personal and informational use. By using the app, you agree to use it lawfully and in line with these terms.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 13 years old, or the minimum age required where you live, to use the service.',
  },
  {
    title: '3. Accounts',
    body: 'Some features may require an account. You are responsible for keeping your login information secure, providing accurate details and activity that happens under your account.',
  },
  {
    title: '4. Health disclaimer',
    body: 'GetGymRat provides general fitness and wellness information only. It does not provide medical advice, diagnosis or treatment. Speak with a qualified healthcare professional before starting exercise, nutrition or wellness changes, especially if you have pain, injury or a medical condition.',
  },
  {
    title: '5. Premium subscriptions',
    body: 'Some features may require a paid subscription. Pricing is the one shown at the time of purchase. Subscriptions may renew automatically unless cancelled through the platform used to subscribe, such as Apple App Store or Google Play, unless otherwise stated.',
  },
  {
    title: '6. Acceptable use',
    body: 'You may not use the service unlawfully, try to gain unauthorized access, interfere with security or operations, reverse engineer or resell the service except where the law allows it, or upload harmful or malicious content.',
  },
  {
    title: '7. Intellectual property',
    body: 'Branding, design, features, logos, text, graphics and software connected to GetGymRat are owned by or licensed to GetGymRat and protected by intellectual property law.',
  },
  {
    title: '8. User content',
    body: 'You keep ownership of content you submit, such as workout logs or profile entries, while granting GetGymRat a limited right to use, store and process it to operate, maintain and improve the service.',
  },
  {
    title: '9. Availability',
    body: 'The service may change over time. GetGymRat does not guarantee uninterrupted, secure or error-free access and may modify, suspend or discontinue parts of the service.',
  },
  {
    title: '10. Warranty and liability',
    body: 'The service is provided as is and as available to the fullest extent allowed by law. GetGymRat and its operators are not liable for indirect or consequential losses arising from use of the service.',
  },
  {
    title: '11. Termination',
    body: 'Access may be suspended or terminated if these terms are violated or if needed to protect the service, its users or legal rights.',
  },
  {
    title: '12. Changes',
    body: 'These terms may be updated from time to time. Continued use after updates means you accept the latest version.',
  },
  {
    title: '13. Contact',
    body: 'Questions regarding these terms can be sent to hello@getgymrat.com.',
  },
];

const privacySections = [
  {
    title: '1. Who we are',
    body: 'GetGymRat is operated by GetGymRat / LevelUp Labs. Privacy questions can be sent to hello@getgymrat.com.',
  },
  {
    title: '2. Information we collect',
    body: 'Information you provide may include name or username, email, workout logs, training history, nutrition or food logs, progress data, goals and support messages. Information collected automatically may include device type, operating system, app version, browser type, IP address, analytics events, crash reports and diagnostics.',
  },
  {
    title: '3. Premium status',
    body: 'If premium features are used, GetGymRat may receive limited subscription-status data from providers such as Apple, Google or RevenueCat. Full payment card details are not stored directly by GetGymRat.',
  },
  {
    title: '4. How information is used',
    body: 'Information may be used to provide and improve the service, manage accounts, save workout and nutrition history, handle subscriptions, analyze product usage, provide support, detect abuse or fraud and comply with legal obligations.',
  },
  {
    title: '5. Sharing',
    body: 'Personal data is not sold. Data may be shared only when necessary with trusted providers involved in hosting, analytics, database, authentication, payment or subscription operations.',
  },
  {
    title: '6. Retention',
    body: 'Information is kept as long as needed to provide the service, resolve disputes, enforce agreements and comply with legal duties. If deletion is requested, data may be deleted or anonymized unless retention is required by law.',
  },
  {
    title: '7. Your rights',
    body: 'Depending on where you live, you may have rights to request access, correction, deletion, restriction, objection or a copy of your data. Consent can also be withdrawn where processing depends on consent.',
  },
  {
    title: '8. Security',
    body: 'Reasonable technical and organizational measures are used to protect information, but no system can be guaranteed completely secure.',
  },
  {
    title: '9. Children',
    body: 'GetGymRat is not intended for children under 13, or under the minimum age required in the user’s country, and does not knowingly collect personal data from children.',
  },
  {
    title: '10. Changes',
    body: 'The privacy policy may be updated over time, with the last-updated date changed when updates happen.',
  },
  {
    title: '11. Contact',
    body: 'Questions about privacy, data handling or deletion requests can be sent to hello@getgymrat.com.',
  },
];

function SectionCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-black/28 p-4">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/64">{body}</p>
    </section>
  );
}

export default function LegalScreen({ variant, onBack }: LegalScreenProps) {
  const isTerms = variant === 'terms';
  const icon = isTerms ? <FileText className="h-3.5 w-3.5 text-lime-300" /> : <Shield className="h-3.5 w-3.5 text-lime-300" />;
  const title = isTerms ? 'Terms of Use' : 'Privacy Policy';
  const subtitle = isTerms
    ? 'Updated from the current GetGymRat terms.'
    : 'Updated from the current GetGymRat privacy policy.';
  const sections = isTerms ? termsSections : privacySections;

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.12),_transparent_35%),linear-gradient(180deg,#0b0b0b_0%,#050505_100%)] px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <button
          onClick={onBack}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/82 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/56">
            {icon}
            Legal
          </div>
          <div>
            <h1 className="text-[30px] font-black leading-[1.02] tracking-[-0.03em] text-white">
              {title}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/64">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-4 rounded-[20px] border border-white/10 bg-black/28 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Last updated</div>
            <div className="mt-1 text-sm font-semibold text-white">April 2, 2026</div>
            <div className="mt-3 text-sm text-white/64">Contact: hello@getgymrat.com</div>
          </div>

          <div className="space-y-3">
            {sections.map((section) => (
              <SectionCard key={section.title} title={section.title} body={section.body} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
