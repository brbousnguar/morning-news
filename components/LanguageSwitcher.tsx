'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-6 right-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white border border-gray-200"
      aria-label="Switch language"
    >
      <Languages size={18} className="text-gray-700" />
      <span className="font-semibold text-gray-700 uppercase">
        {language === 'en' ? 'EN' : 'FR'}
      </span>
    </button>
  )
}
