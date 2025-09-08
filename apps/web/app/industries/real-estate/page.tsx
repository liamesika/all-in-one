'use client';
import { useLang } from '../../../components/i18n/LangProvider';

export default function RealEstateLanding() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-bold">{t('card.re.title')} — {t('nav.re')}</h1>
      <p className="opacity-80 mt-2">{t('card.re.body')}</p>
      {/* התוכן שהיה לך בקובץ הישן */}
    </section>
  );
}
