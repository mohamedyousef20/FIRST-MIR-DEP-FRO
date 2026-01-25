import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    localStorage.removeItem("language")
      
  }, []);

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
}
