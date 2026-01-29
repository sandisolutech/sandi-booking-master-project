"use client"

import type React from "react"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import { TutorialBanner } from "@/components/tutorial-banner"
import { TutorialProvider } from "@/lib/tutorial-context"
import { useLanguage } from "@/lib/language-context"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { t } = useLanguage()
  const pathname = usePathname()

  const navItems = [
    {
      title: t.bookings, // New item for bookings calendar
      href: "/admin/bookings",
      icon: "CalendarDaysIcon",
      active: pathname.startsWith("/admin/bookings"),
    },
    {
      title: t.dashboard,
      href: "/admin/dashboard",
      icon: "LayoutDashboardIcon",
      active: pathname === "/admin/dashboard",
    },
    {
      title: t.companies,
      href: "/admin/companies",
      icon: "BuildingIcon",
      active: pathname.startsWith("/admin/companies"),
    },
    {
      title: t.rooms,
      href: "/admin/rooms",
      icon: "DoorOpenIcon",
      active: pathname.startsWith("/admin/rooms"),
    },
    {
      title: t.bookingLinks,
      href: "/admin/links",
      icon: "LinkIcon",
      active: pathname.startsWith("/admin/links"),
    },
    {
      title: t.bookings, // New item for bookings calendar
      href: "/admin/bookings",
      icon: "CalendarDaysIcon",
      active: pathname.startsWith("/admin/bookings"),
    },
    {
      title: t.reports,
      href: "/admin/reports",
      icon: "BarChartIcon",
      active: pathname.startsWith("/admin/reports"),
    },
    {
      title: t.settings,
      href: "/admin/settings",
      icon: "SettingsIcon",
      active: pathname.startsWith("/admin/settings"),
    },
  ]

  return (
    <TutorialProvider>
      <div className="flex min-h-screen w-full bg-gray-100/40 dark:bg-gray-800">
        <AdminSidebar navItems={navItems} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex flex-col w-full">
          <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <TutorialBanner />
            {children}
          </main>
        </div>
        <TutorialOverlay />
      </div>
    </TutorialProvider>
  )
}
