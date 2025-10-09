import { redirect } from 'next/navigation';

export default function LawRedirect() {
  redirect('/dashboard/law/dashboard');
}