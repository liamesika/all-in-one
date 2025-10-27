import { LangProvider } from '@/components/i18n/LangProvider';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'E-Commerce Suite',
  description: 'Complete E-Commerce management toolkit',
};

export default async function EcommerceLayout({ children }: { children: React.ReactNode }) {
  // Read language from cookie for SSR
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lang');
  const initialLang = (langCookie?.value === 'he' ? 'he' : 'en') as 'en' | 'he';

  return (
    <LangProvider initialLang={initialLang}>
      {children}
    </LangProvider>
  );
}
