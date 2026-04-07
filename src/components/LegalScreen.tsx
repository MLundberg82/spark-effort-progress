import { ArrowLeft, FileText, Shield } from 'lucide-react';

type LegalVariant = 'terms' | 'privacy';

type LegalScreenProps = {
  variant: LegalVariant;
  onBack: () => void;
};

const termsSections = [
  {
    title: '1. Use of the service',
    body:
      'GetGymRat provides fitness tools, workout tracking, progress features and related content for personal and informational use. By using the app, you agree to use it lawfully and in line with these terms.',
  },
  {
    title: '2. Eligibility',
    body:
      'You must be at least 13 years old, or the minimum age required where you live, to use the service.',
  },
  {
    title: '3. Accounts',
    body:
      'Some features may require an account. You are responsible for keeping your login information secure, providing accurate details and activity that happens under your account.',
  },
  {
    title: '4. Health disclaimer',
    body:
      'GetGymRat provides general fitness and wellness information only. It does not provide medical advice, diagnosis or treatment. Speak with a qualified healthcare professional before starting exercise, nutrition or wellness changes, especially if you have pain, injury or a medical condition.',
  },
  {
    title: '5. Premium subscriptions',
    body:
      'Some features may require a paid subscription. Pricing is the one shown at the time of purchase. Subscriptions may renew automatically unless cancelled through the platform used to subscribe, such as Apple App Store or Google Play, unless otherwise stated.',
  },
  {
    title: '6. Acceptable use',
    body:
      'You may not use the service unlawfully, try to gain unauthorized access, interfere with security or operations, reverse engineer or resell the service except where the law allows it, or upload harmful or malicious content.',
  },
  {
    title: '7. Intellectual property',
    body:
      'Branding, design, features, logos, text, graphics and software connected to GetGymRat are owned by or licensed to GetGymRat and protected by intellectual property law.',
  },
  {
    title: '8. User content',
    body:
      'You keep ownership of content you submit, such as workout logs or profile entries, while granting GetGymRat a limited right to use, store and process it to operate, maintain and improve the service.',
  },
  {
    title: '9. Availability',
    body:
      'The service may change over time. GetGymRat does not guarantee uninterrupted, secure or error-free access and may modify, suspend or discontinue parts of the service.',
  },
  {
    title: '10. Warranty and liability',
    body:
      'The service is provided as is and as available to the fullest extent allowed by law. GetGymRat and its operators are not liable for indirect or consequential losses arising from use of the service.',
  },
  {
    title: '11. Termination',
    body:
      'Access may be suspended or terminated if these terms are violated or if needed to protect the service, its users or legal rights.',
  },
  {
    title: '12. Changes',
    body:
      'These terms may be updated from time to time. Continued use after updates means you accept the latest version.',
  },
  {
    title: '13. Contact',
    body:
      'Questions regarding these terms can be sent to hello@getgymrat.com.',
  },
];

const privacySections = [
  {
    title: '1. Who we are',
    body:
      'GetGymRat is operated by GetGymRat / LevelUp Labs. Privacy questions can be sent to hello@getgymrat.com.',
  },
  {
    title: '2. Information we collect',
    body:
      'Information you provide may include name or username, email, workout logs, training history, nutrition or food logs, progress data, goals and support messages. Information collected automatically may include device type, operating system, app version, browser type, IP address, analytics events, crash reports and diagnostics.',
  },
  {
    title: '3. Premium status',
    body:
      'If premium features are used, GetGymRat may receive limited subscription-status data from providers such as Apple, Google or RevenueCat. Full payment card details are not stored directly by GetGymRat.',
  },
  {
    title: '4. How information is used',
    body:
      'Information may be used to provide and improve the service, manage accounts, save workout and nutrition history, handle subscriptions, analyze product usage, provide support, detect abuse or fraud and comply with legal obligations.',
  },
  {
    title: '5. Sharing',
    body:
      'Personal data is not sold. Data may be shared only when necessary with trusted providers involved in hosting, analytics, database, authentication, payment or subscription operations.',
  },
  {
    title: '6. Retention',
    body:
      'Information is kept as long as needed to provide the service, resolve disputes, enforce agreements and comply with legal duties. If deletion is requested, data may be deleted or anonymized unless retention is required by law.',
  },
  {
    title: '7. Your rights',
    body:
      'Depending on where you live, you may have rights to request access, correction, deletion, restriction, objection or a copy of your data. Consent can also be withdrawn where processing depends on consent.',
  },
  {
    title: '8. Security',
    body:
      'Reasonable technical and organizational measures are used to protect information, but no system can be guaranteed completely secure.',
  },
  {
    title: '9. Children',
    body:
      'GetGymRat is not intended for children under 13, or under the minimum age required in the user’s country, and does not knowingly collect personal data from children.',
  },
  {
    title: '10. Changes',
    body:
      'The privacy policy may be updated over time, with the last-updated date changed when updates happen.',
  },
  {
    title: '11. Contact',
    body:
      'Questions about privacy, data handling or deletion requests can be sent to hello@getgymrat.com.',
  },
];

function SectionCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-[20px] border border-white/16 bg-black/42 p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-lime-200">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-white/88">{body}</p>
    </section>
  );
}

export default function LegalScreen({
  variant,
  onBack,
}: LegalScreenProps) {
  const isTerms = variant === 'terms';
  const icon = isTerms ? (
    <Shield className="h-4.5 w-4.5" />
  ) : (
    <FileText className="h-4.5 w-4.5" />
  );

  const title = isTerms ? 'Terms of Use' : 'Privacy Policy';
  const subtitle = isTerms
    ? 'Updated from the current GetGymRat terms.'
    : 'Updated from the current GetGymRat privacy policy.';
  const sections = isTerms ? termsSections : privacySections;

  return (
    <div className="min-h-full">
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/16 bg-black/52 text-white transition hover:bg-black/60"
            aria-label="Back"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-lime-200">
              {icon}
              <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                Legal
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-1 text-sm text-white/82">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-[22px] border border-white/16 bg-white/[0.08] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
            Last updated
          </div>
          <div className="mt-2 text-sm text-white/88">April 2, 2026</div>
          <div className="mt-2 text-sm text-white/82">Contact: hello@getgymrat.com</div>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <SectionCard
              key={section.title}
              title={section.title}
              body={section.body}
            />
          ))}
        </div>
      </div>
    </div>
  );
}