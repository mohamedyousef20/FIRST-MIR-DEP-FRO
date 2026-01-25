import { redirect } from 'next/navigation';

export default function RedirectPage() {
  redirect('/vendor/dashboard/products/new');
  return null;
}
