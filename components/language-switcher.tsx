"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <Select value={language} onValueChange={(value: "en" | "th") => setLanguage(value)}>
        <SelectTrigger className="w-20 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">EN</SelectItem>
          <SelectItem value="th">TH</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "th" : "en")}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{language === "en" ? "ไทย" : "English"}</span>
    </Button>
  )
}
