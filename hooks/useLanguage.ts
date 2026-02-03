import { useState, useEffect } from 'react';

export function useLanguage() {
  const [language, setLanguage] = useState<string>(() => {
    // Get initial language from localStorage or default to Arabic
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'ar';
  });

  useEffect(() => {
    // Update localStorage when language changes
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  return {
    language,
    toggleLanguage,
    isArabic: language === 'ar',
  };
}
