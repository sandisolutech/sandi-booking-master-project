"use client"

import { useState, useEffect } from "react"
import { getCompanyBranding } from "@/app/admin/settings/actions"

type CompanyBranding = {
  name: string
  logo: string | null
  description: string | null
}

// Global cache for company branding
let cachedBranding: CompanyBranding | null = null
let loadingPromise: Promise<CompanyBranding> | null = null

export function useCompanyBranding() {
  const [branding, setBranding] = useState<CompanyBranding | null>(cachedBranding)
  const [loading, setLoading] = useState(!cachedBranding)

  useEffect(() => {
    if (cachedBranding) {
      setBranding(cachedBranding)
      setLoading(false)
      return
    }

    if (loadingPromise) {
      loadingPromise.then((data) => {
        setBranding(data)
        setLoading(false)
      })
      return
    }

    // Start loading if not already loading
    loadingPromise = getCompanyBranding()
      .then((data) => {
        cachedBranding = data
        setBranding(data)
        setLoading(false)
        return data
      })
      .catch((error) => {
        console.error('Failed to fetch company branding:', error)
        const fallback = {
          name: 'BookSpace',
          logo: null,
          description: null
        }
        cachedBranding = fallback
        setBranding(fallback)
        setLoading(false)
        return fallback
      })
      .finally(() => {
        loadingPromise = null
      })
  }, [])

  return { branding, loading }
}

// Function to preload company branding (can be called early in the app)
export function preloadCompanyBranding() {
  if (!cachedBranding && !loadingPromise) {
    loadingPromise = getCompanyBranding()
      .then((data) => {
        cachedBranding = data
        return data
      })
      .catch((error) => {
        console.error('Failed to preload company branding:', error)
        const fallback = {
          name: 'BookSpace',
          logo: null,
          description: null
        }
        cachedBranding = fallback
        return fallback
      })
      .finally(() => {
        loadingPromise = null
      })
  }
  return loadingPromise
}

// Function to invalidate cache (useful after logo updates)
export function invalidateCompanyBrandingCache() {
  cachedBranding = null
  loadingPromise = null
}
