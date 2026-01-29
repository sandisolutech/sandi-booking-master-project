"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Search, User, LogOut, Settings, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageSwitcher } from "@/components/language-switcher"
import { TutorialButton } from "@/components/tutorial-button"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"
import { CompanyLogo } from "@/components/company-logo"
import { 
  getUserSession, 
  clearUserSession, 
  startSessionTimer, 
  isSessionExpiringSoon,
  getSessionTimeRemaining 
} from "@/lib/auth"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface DashboardHeaderProps {
  title?: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>("")
  const router = useRouter()
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentUser = getUserSession()
    setUser(currentUser)
    
    // Check if session is expiring soon
    if (currentUser && isSessionExpiringSoon()) {
      setShowSessionWarning(true)
    }
    
    // Start session monitoring
    if (currentUser) {
      sessionTimerRef.current = startSessionTimer(
        () => {
          // Session expired - logout
          handleLogout()
        },
        () => {
          // Session expiring soon - show warning
          setShowSessionWarning(true)
        }
      )
    }
    
    // Update session time display every minute
    const updateTimer = setInterval(() => {
      if (currentUser) {
        const timeLeft = getSessionTimeRemaining()
        if (timeLeft > 0) {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60))
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
          setSessionTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setSessionTimeLeft("Expired")
        }
      }
    }, 60000)
    
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
      clearInterval(updateTimer)
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      // Clear local session
      clearUserSession()
      
      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear session and redirect on error
      clearUserSession()
      router.push('/login')
    }
  }

  const handleProfile = () => {
    setShowProfileDialog(true)
  }

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
      {/* Left side - Title or Search */}
      <div className="flex-1">
        {showSearch ? (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search..." className="pl-9 w-full" autoFocus onBlur={() => setShowSearch(false)} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <CompanyLogo size="sm" />
            <h2 className="text-xl font-semibold text-gray-800">{title || "Dashboard"}</h2>
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-3">
        <LanguageSwitcher />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Edit Dialog */}
      <ProfileEditDialog 
        isOpen={showProfileDialog} 
        onClose={() => setShowProfileDialog(false)} 
      />
    </header>
  )
}
