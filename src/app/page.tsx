import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

// This page only redirects to the default-locale-prefixed route
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
