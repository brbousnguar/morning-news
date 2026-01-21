'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { navigateTo } from '@/lib/navigation'

const WorldMap = dynamic(() => import('@/components/WorldMap'), {
  ssr: false,
})

export default function Home() {
  const router = useRouter()
  const { t } = useLanguage()

  const handleCountryClick = (countryCode: string) => {
    console.log('handleCountryClick called with:', countryCode)
    if (countryCode) {
      // Use helper function to ensure basePath is respected in static export
      navigateTo(`/country/${countryCode}`)
    }
  }

  return (
    <main className="min-h-screen relative">
      <LanguageSwitcher />
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white/90 to-transparent p-6 pointer-events-none">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {t('app.title')}
        </h1>
        <p className="text-gray-600">
          {t('app.subtitle')}
        </p>
      </div>
      <div className="relative z-0">
        <WorldMap onCountryClick={handleCountryClick} />
      </div>
    </main>
  )
}
