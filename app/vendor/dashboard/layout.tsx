'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from "@/components/language-provider";
import { useRouter } from 'next/navigation';

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  const router = useRouter();

  return (
    <div className="flex-1 overflow-auto p-6">
      {children}
    </div>
  );
}
