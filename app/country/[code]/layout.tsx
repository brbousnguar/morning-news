import { countryNames } from '@/lib/translations'
import { ReactNode } from 'react'

// Generate static params for all country codes (required for static export)
export function generateStaticParams() {
  // Get all country codes from translations
  const countryCodes = Object.keys(countryNames.en)
  return countryCodes.map((code) => ({
    code: code, // Keep uppercase to match navigation
  }))
}

export default function CountryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

