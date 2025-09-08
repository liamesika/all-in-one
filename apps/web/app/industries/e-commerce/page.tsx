'use client';
import { useLang } from '../../../components/i18n/LangProvider';

export default function EcomLanding() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-bold">{t('ecom.title')}</h1>
      <p className="opacity-80 mt-2">{t('ecom.desc')}</p>
      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
          <h3 className="font-semibold mb-1">{t('ecom.tool.csv.title')}</h3>
          <p className="text-sm opacity-80 mb-4">{t('ecom.tool.csv.desc')}</p>
          <a className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium bg-white text-black hover:opacity-90 w-full"
             href="/e-commerce/shopify-csv">{t('cta.run')}</a>
        </div>
        {/* שני קלפים "בקרוב"… */}
      </div>
      <div className="mt-8 flex gap-3">
        <a className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium bg-white text-black hover:opacity-90"
           href="/login?next=/e-commerce/dashboard">{t('cta.login')}</a>
        <a className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm border border-white/15 hover:bg-white/5"
           href="/register?next=/e-commerce/dashboard">{t('cta.register')}</a>
      </div>
    </section>
  );
}
