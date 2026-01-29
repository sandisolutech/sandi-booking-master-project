"use client"

import { useCompanyBranding } from "@/hooks/use-company-branding"

interface CompanyLogoProps {
  className?: string
  fallbackClassName?: string
  size?: "sm" | "md" | "lg" | "xl"
  showCompanyName?: boolean
  fallbackText?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12", 
  lg: "w-16 h-16",
  xl: "w-24 h-24"
}

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl"
}

export function CompanyLogo({ 
  className = "", 
  fallbackClassName = "",
  size = "md",
  showCompanyName = false,
  fallbackText
}: CompanyLogoProps) {
  const { branding, loading } = useCompanyBranding()

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded ${className}`} />
    )
  }

  const isBase64Image = (str: string | null) => {
    if (!str) return false
    return str.startsWith('data:image/')
  }

  const displayText = fallbackText || branding?.name?.charAt(0) || 'B'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50`}>
        {branding?.logo && (isBase64Image(branding.logo) || branding.logo.startsWith('http')) ? (
          <img 
            src={branding.logo} 
            alt={`${branding.name} Logo`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to text if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ${fallbackClassName}">
                    <span class="text-white font-bold ${textSizeClasses[size]}">${displayText}</span>
                  </div>
                `
              }
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ${fallbackClassName}`}>
            <span className={`text-white font-bold ${textSizeClasses[size]}`}>
              {displayText}
            </span>
          </div>
        )}
      </div>
      {showCompanyName && (
        <span className={`font-semibold text-gray-900 ${textSizeClasses[size]}`}>
          {branding?.name}
        </span>
      )}
    </div>
  )
}
