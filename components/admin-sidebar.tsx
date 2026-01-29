"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Building2, Users, LinkIcon, BarChart3, Settings, GraduationCap, Calendar, BookOpen } from "lucide-react"
import { getCompanyName } from "@/app/admin/settings/actions"
import { CompanyLogo } from "@/components/company-logo"

const navigation = [
  {
    name: "bookingsTable",
    href: "/admin/bookings",
    icon: Calendar,
  },
  {
    name: "bookingLinks",
    href: "/admin/links",
    icon: LinkIcon,
  },
  // {
  //   name: "companies",
  //   href: "/admin/companies",
  //   icon: Building2,
  // },
  {
    name: "rooms",
    href: "/admin/rooms",
    icon: Users,
  },
  {
    name: "settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "apiDocs",
    href: "/admin/api-docs",
    icon: BookOpen,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [companyName, setCompanyName] = useState("BookSpace")

  useEffect(() => {
    async function fetchCompanyName() {
      try {
        const name = await getCompanyName()
        setCompanyName(name)
      } catch (error) {
        console.error('Error fetching company name:', error)
        // Keep default "BookSpace" if error occurs
      }
    }
    
    fetchCompanyName()
  }, [])

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <CompanyLogo size="sm" showCompanyName className="flex-1" />
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700",
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {t[item.name as keyof typeof t]}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
