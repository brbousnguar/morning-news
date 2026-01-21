/**
 * Helper function for navigation that respects basePath in static export
 * Next.js router.push() should handle basePath automatically, but this ensures it works
 */
export function getBasePath(): string {
  if (typeof window !== 'undefined') {
    // In browser, check if we're on GitHub Pages
    const pathname = window.location.pathname
    // If pathname starts with /morning-news, extract it
    const match = pathname.match(/^(\/[^\/]+)/)
    if (match && match[1] !== '/') {
      return match[1]
    }
  }
  // Fallback to environment variable or empty
  return process.env.NEXT_PUBLIC_BASE_PATH || ''
}

export function navigateTo(path: string): void {
  if (typeof window !== 'undefined') {
    const basePath = getBasePath()
    const fullPath = `${basePath}${path}`
    window.location.href = fullPath
  }
}

