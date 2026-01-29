"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Bell, Shield, Clock, Globe, Key, Save, Eye, EyeOff, Upload, Trash2, FormInput, MessageSquare, BookOpen, AlertCircle, Plus, X, Edit2 } from "lucide-react"
import { CustomFieldsList } from "@/components/custom-fields-list"
import { DayOffModal } from "@/components/day-off-modal"
import { DayOffSettingsCard } from "@/components/day-off-settings-card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { invalidateCompanyBrandingCache } from "@/hooks/use-company-branding"
import { 
  getGeneralConfig, 
  updateGeneralConfig, 
  getNotificationConfig, 
  updateNotificationConfig,
  getBookingConfig,
  updateBookingConfig,
  getSystemConfig,
  updateSystemConfig,
  getSecurityConfig,
  updateSecurityConfig,
  getLineConfig,
  updateLineConfig,
  type GeneralConfig,
  type NotificationConfig,
  type BookingConfig,
  type SystemConfig,
  type SecurityConfig,
  type LineConfig
} from "./actions"
import { LINE_MESSAGE_VARIABLES } from "@/lib/line-message-utils"
import {
  getUserAccounts,
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
  toggleUserAccountStatus,
  changePassword,
  type UserAccount,
  type CreateUserData,
  type UpdateUserData,
  type ChangePasswordData
} from "./auth-actions"
import {
  getAllRooms,
  getRoomDayOffs,
  removeRoomDayOff,
  type Room,
  type RoomDayOff
} from "@/app/admin/rooms/actions"

export default function SettingsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Configuration data from database
  const [generalConfig, setGeneralConfig] = useState<GeneralConfig | null>(null)
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig | null>(null)
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(null)
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null)
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null)
  const [lineConfig, setLineConfig] = useState<LineConfig | null>(null)

  // Form state for editing
  const [editedGeneral, setEditedGeneral] = useState<Partial<GeneralConfig>>({})
  const [editedNotification, setEditedNotification] = useState<Partial<NotificationConfig>>({})
  const [editedBooking, setEditedBooking] = useState<Partial<BookingConfig>>({})
  const [editedSystem, setEditedSystem] = useState<Partial<SystemConfig>>({})
  const [editedSecurity, setEditedSecurity] = useState<Partial<SecurityConfig>>({})
  const [editedLine, setEditedLine] = useState<Partial<LineConfig>>({})

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Cover image upload state
  const [coverImageUploading, setCoverImageUploading] = useState(false)
  const coverImageFileInputRef = useRef<HTMLInputElement>(null)

  // Account management states
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false)
  const [showEditAccountDialog, setShowEditAccountDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null)
  const [newAccount, setNewAccount] = useState<{
    name: string
    email: string
    password: string
    confirmPassword: string
    role: "Administrator" | "Manager" | "Staff"
  }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Staff"
  })

  // Load all configuration data on component mount
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setLoading(true)
        const [general, notification, booking, system, security, line, userAccounts] = await Promise.all([
          getGeneralConfig(),
          getNotificationConfig(),
          getBookingConfig(),
          getSystemConfig(),
          getSecurityConfig(),
          getLineConfig(),
          getUserAccounts()
        ])
        
        setGeneralConfig(general)
        setNotificationConfig(notification)
        setBookingConfig(booking)
        setSystemConfig(system)
        setSecurityConfig(security)
        setLineConfig(line)
        setAccounts(userAccounts)
        
        // Initialize form state
        setEditedGeneral(general)
        setEditedNotification(notification)
        setEditedBooking(booking)
        setEditedSystem(system)
        setEditedSecurity(security)
        setEditedLine(line)
      } catch (error) {
        console.error('Failed to load configuration:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadConfigs()
  }, [])

  const handleSave = async (section: string) => {
    setIsSaving(true)
    try {
      switch (section) {
        case "general":
          if (editedGeneral) {
            const updated = await updateGeneralConfig(editedGeneral)
            setGeneralConfig(updated)
          }
          break
        case "notifications":
          if (editedNotification) {
            const updated = await updateNotificationConfig(editedNotification)
            setNotificationConfig(updated)
          }
          break
        case "booking":
          if (editedBooking) {
            const updated = await updateBookingConfig(editedBooking)
            setBookingConfig(updated)
          }
          break
        case "system":
          if (editedSystem) {
            const updated = await updateSystemConfig(editedSystem)
            setSystemConfig(updated)
          }
          break
        case "security":
          if (editedSecurity) {
            const updated = await updateSecurityConfig(editedSecurity)
            setSecurityConfig(updated)
          }
          break
        case "line":
          if (editedLine) {
            const updated = await updateLineConfig(editedLine)
            setLineConfig(updated)
          }
          break
      }
      // Show success message or toast here
      console.log(`${section} configuration saved successfully`)
    } catch (error) {
      console.error(`Failed to save ${section} configuration:`, error)
      // Show error message or toast here
    } finally {
      setIsSaving(false)
    }
  }

  // Account management handlers
  const handleAddAccount = () => {
    setNewAccount({ name: "", email: "", password: "", confirmPassword: "", role: "Staff" as const })
    setShowAddAccountDialog(true)
  }

  const handleEditAccount = (account: UserAccount) => {
    setSelectedAccount(account)
    setNewAccount({
      name: account.name,
      email: account.email,
      password: "",
      confirmPassword: "",
      role: account.role
    })
    setShowEditAccountDialog(true)
  }

  const handleSaveAccount = async () => {
    try {
      if (selectedAccount) {
        // Update existing account
        const updated = await updateUserAccount({
          id: selectedAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role
        })
        if (updated) {
          setAccounts(prev => prev.map(acc => 
            acc.id === selectedAccount.id ? updated : acc
          ))
          setShowEditAccountDialog(false)
        }
      } else {
        // Add new account
        if (newAccount.password !== newAccount.confirmPassword) {
          alert("Passwords do not match!")
          return
        }
        
        const created = await createUserAccount({
          name: newAccount.name,
          email: newAccount.email,
          password: newAccount.password,
          role: newAccount.role
        })
        
        if (created) {
          setAccounts(prev => [...prev, created])
          setShowAddAccountDialog(false)
        }
      }
      setSelectedAccount(null)
    } catch (error) {
      console.error("Failed to save account:", error)
      alert("Failed to save account. Please try again.")
    }
  }

  const handleDeleteAccount = async (accountId: number) => {
    if (confirm("Are you sure you want to delete this account?")) {
      try {
        const success = await deleteUserAccount(accountId)
        if (success) {
          setAccounts(prev => prev.filter(acc => acc.id !== accountId))
        }
      } catch (error) {
        console.error("Failed to delete account:", error)
        alert("Failed to delete account. Please try again.")
      }
    }
  }

  const handleToggleAccountStatus = async (accountId: number) => {
    try {
      const updated = await toggleUserAccountStatus(accountId)
      if (updated) {
        setAccounts(prev => prev.map(acc => 
          acc.id === accountId ? updated : acc
        ))
      }
    } catch (error) {
      console.error("Failed to toggle account status:", error)
      alert("Failed to update account status. Please try again.")
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    try {
      // For demo purposes, we'll use the first account as the current user
      // In a real app, you'd get the current user's ID from the session/auth context
      const currentUserId = accounts[0]?.id || 1
      
      const success = await changePassword(currentUserId, {
        currentPassword,
        newPassword
      })
      
      if (success) {
        alert("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        alert("Current password is incorrect!")
      }
    } catch (error) {
      console.error("Failed to change password:", error)
      alert("Failed to change password. Please try again.")
    }
  }

  // Logo upload handlers
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, SVG)",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 512KB)
    if (file.size > 512 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 512KB",
        variant: "destructive"
      })
      return
    }

    setLogoUploading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string
        // Update the logo in the edited state
        setEditedGeneral(prev => ({ ...prev, companyLogoUrl: base64 }))
        // Auto-save the logo
        await handleSave("general")
        // Invalidate cache to force refresh of logo across the app
        invalidateCompanyBrandingCache()
        toast({
          title: "Logo uploaded successfully",
          description: "Company logo has been updated",
        })
      } catch (error) {
        console.error('Error uploading logo:', error)
        toast({
          title: "Upload failed",
          description: "Failed to upload logo. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLogoUploading(false)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.onerror = () => {
      setLogoUploading(false)
      toast({
        title: "File read error",
        description: "Error reading file. Please try again.",
        variant: "destructive"
      })
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const handleLogoRemove = async () => {
    if (confirm('Are you sure you want to remove the company logo?')) {
      try {
        setEditedGeneral(prev => ({ ...prev, companyLogoUrl: null }))
        // Auto-save the change
        await handleSave("general")
        // Invalidate cache to force refresh of logo across the app
        invalidateCompanyBrandingCache()
        toast({
          title: "Logo removed",
          description: "Company logo has been removed successfully",
        })
      } catch (error) {
        console.error('Error removing logo:', error)
        toast({
          title: "Remove failed",
          description: "Failed to remove logo. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  // Cover image upload handlers
  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, SVG)",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 512KB)
    if (file.size > 512 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 512KB",
        variant: "destructive"
      })
      return
    }

    setCoverImageUploading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string
        // Update the cover image in the edited state
        setEditedGeneral(prev => ({ ...prev, companyCoverImageUrl: base64 }))
        // Auto-save the cover image
        await handleSave("general")
        // Invalidate cache to force refresh across the app
        invalidateCompanyBrandingCache()
        toast({
          title: "Cover image uploaded successfully",
          description: "Company cover image has been updated",
        })
      } catch (error) {
        console.error('Error uploading cover image:', error)
        toast({
          title: "Upload failed",
          description: "Failed to upload cover image. Please try again.",
          variant: "destructive"
        })
      } finally {
        setCoverImageUploading(false)
        // Reset the file input
        if (coverImageFileInputRef.current) {
          coverImageFileInputRef.current.value = ''
        }
      }
    }
    reader.onerror = () => {
      setCoverImageUploading(false)
      toast({
        title: "File read error",
        description: "Error reading file. Please try again.",
        variant: "destructive"
      })
      // Reset the file input
      if (coverImageFileInputRef.current) {
        coverImageFileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCoverImageRemove = async () => {
    if (confirm('Are you sure you want to remove the company cover image?')) {
      try {
        setEditedGeneral(prev => ({ ...prev, companyCoverImageUrl: null }))
        // Auto-save the change
        await handleSave("general")
        // Invalidate cache to force refresh across the app
        invalidateCompanyBrandingCache()
        toast({
          title: "Cover image removed",
          description: "Company cover image has been removed successfully",
        })
      } catch (error) {
        console.error('Error removing cover image:', error)
        toast({
          title: "Remove failed",
          description: "Failed to remove cover image. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const handleCoverImageUploadClick = () => {
    coverImageFileInputRef.current?.click()
  }

  const isBase64Image = (str: string | null) => {
    if (!str) return false
    return str.startsWith('data:image/')
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.settingsTitle}</h1>
          <p className="text-gray-600 mt-1">{t.settingsSubtitle}</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t.general}</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t.account}</span>
          </TabsTrigger>
          <TabsTrigger value="line" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">LINE</span>
          </TabsTrigger>
          <TabsTrigger value="custom-fields" className="flex items-center gap-2">
            <FormInput className="w-4 h-4" />
            <span className="hidden sm:inline">Custom Fields</span>
          </TabsTrigger>
          <TabsTrigger value="day-offs" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Day Offs</span>
          </TabsTrigger>
          <TabsTrigger value="secret-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Secret Keys</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                {t.companyInformationSettings}
              </CardTitle>
              <CardDescription>{t.updateBrandingDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t.companyName}</Label>
                  <Input 
                    id="companyName" 
                    value={editedGeneral?.companyName || ""} 
                    onChange={(e) => setEditedGeneral(prev => ({ ...prev, companyName: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">{t.companyEmail}</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={editedGeneral?.companyEmail || ""}
                    onChange={(e) => setEditedGeneral(prev => ({ ...prev, companyEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">{t.phoneNumber}</Label>
                  <Input 
                    id="companyPhone" 
                    value={editedGeneral?.companyPhone || ""} 
                    onChange={(e) => setEditedGeneral(prev => ({ ...prev, companyPhone: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">{t.address}</Label>
                  <Input
                    id="companyAddress"
                    value={editedGeneral?.companyAddress || ""}
                    onChange={(e) => setEditedGeneral(prev => ({ ...prev, companyAddress: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyDescription">{t.companyDescription}</Label>
                <Textarea
                  id="companyDescription"
                  value={editedGeneral?.companyDescription || ""}
                  onChange={(e) => setEditedGeneral(prev => ({ ...prev, companyDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">{t.website}</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://www.example.com"
                    value={editedGeneral?.companyWebsite || ""}
                    onChange={(e) => setEditedGeneral(prev => ({ ...prev, companyWebsite: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">{t.supportEmail}</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    placeholder="support@example.com"
                    value={editedGeneral?.supportEmail || ""}
                    onChange={(e) => setEditedGeneral(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingTerms">{t.bookingTerms}</Label>
                <Textarea
                  id="bookingTerms"
                  placeholder="Enter terms and conditions for bookings..."
                  value={editedGeneral?.bookingTerms || ""}
                  onChange={(e) => setEditedGeneral(prev => ({ ...prev, bookingTerms: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">{t.welcomeMessage}</Label>
                <Textarea
                  id="welcomeMessage"
                  placeholder="Welcome message that appears on the booking page..."
                  value={editedGeneral?.welcomeMessage || ""}
                  onChange={(e) => setEditedGeneral(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.companyLogo}</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                    {editedGeneral?.companyLogoUrl && isBase64Image(editedGeneral.companyLogoUrl) ? (
                      <img 
                        src={editedGeneral.companyLogoUrl} 
                        alt="Company Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : editedGeneral?.companyLogoUrl ? (
                      <img 
                        src={editedGeneral.companyLogoUrl} 
                        alt="Company Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {editedGeneral?.companyName?.charAt(0) || 'B'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={logoUploading}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleUploadClick}
                      disabled={logoUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {logoUploading ? 'Uploading...' : t.uploadNew}
                    </Button>
                    {editedGeneral?.companyLogoUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogoRemove}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        disabled={logoUploading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Upload a company logo (max 512KB). Supported formats: PNG, JPG, GIF, SVG.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                  {editedGeneral?.companyCoverImageUrl && isBase64Image(editedGeneral.companyCoverImageUrl) ? (
                    <div className="space-y-4">
                      <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={editedGeneral.companyCoverImageUrl} 
                          alt="Company Cover Image" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <input
                          ref={coverImageFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                          disabled={coverImageUploading}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCoverImageUploadClick}
                          disabled={coverImageUploading}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {coverImageUploading ? 'Uploading...' : 'Replace Image'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCoverImageRemove}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={coverImageUploading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : editedGeneral?.companyCoverImageUrl ? (
                    <div className="space-y-4">
                      <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={editedGeneral.companyCoverImageUrl} 
                          alt="Company Cover Image" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <input
                          ref={coverImageFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                          disabled={coverImageUploading}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCoverImageUploadClick}
                          disabled={coverImageUploading}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {coverImageUploading ? 'Uploading...' : 'Replace Image'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCoverImageRemove}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={coverImageUploading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">Upload a cover image</p>
                      <p className="text-gray-500 text-sm mb-4">Drag and drop or click to upload</p>
                      <input
                        ref={coverImageFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                        disabled={coverImageUploading}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleCoverImageUploadClick}
                        disabled={coverImageUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {coverImageUploading ? 'Uploading...' : 'Select Image'}
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Upload a cover image (max 512KB). Supported formats: PNG, JPG, GIF, SVG. Any size or aspect ratio.
                </p>
              </div>
              
              <Button
                onClick={() => handleSave("general")}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? t.saving : t.saveChanges}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Management */}
        <TabsContent value="account" className="space-y-6">
          {/* User Account List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                User Accounts
              </CardTitle>
              <CardDescription>Manage user accounts and access permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Active Users</h3>
                <Button onClick={handleAddAccount} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Add New User
                </Button>
              </div>
              
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{account.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{account.name}</p>
                        <p className="text-sm text-gray-600">{account.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={account.status === "Active" ? "default" : "secondary"}>
                            {account.status}
                          </Badge>
                          <Badge variant="outline">{account.role}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAccountStatus(account.id)}
                        className={account.status === "Active" ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}
                      >
                        {account.status === "Active" ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password for security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Account Dialog */}
        {showAddAccountDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New User Account</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newAccountName">Full Name</Label>
                  <Input
                    id="newAccountName"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAccountEmail">Email Address</Label>
                  <Input
                    id="newAccountEmail"
                    type="email"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAccountPassword">Password</Label>
                  <Input
                    id="newAccountPassword"
                    type="password"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAccountConfirmPassword">Confirm Password</Label>
                  <Input
                    id="newAccountConfirmPassword"
                    type="password"
                    value={newAccount.confirmPassword}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAccountRole">Role</Label>
                  <Select value={newAccount.role} onValueChange={(value: "Administrator" | "Manager" | "Staff") => setNewAccount(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={handleSaveAccount}
                  disabled={!newAccount.name || !newAccount.email || !newAccount.password || newAccount.password !== newAccount.confirmPassword}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Account
                </Button>
                <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Account Dialog */}
        {showEditAccountDialog && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit User Account</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editAccountName">Full Name</Label>
                  <Input
                    id="editAccountName"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAccountEmail">Email Address</Label>
                  <Input
                    id="editAccountEmail"
                    type="email"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAccountRole">Role</Label>
                  <Select value={newAccount.role} onValueChange={(value: "Administrator" | "Manager" | "Staff") => setNewAccount(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600">
                  Note: To change the password, use the password reset function.
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={handleSaveAccount}
                  disabled={!newAccount.name || !newAccount.email}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Update Account
                </Button>
                <Button variant="outline" onClick={() => setShowEditAccountDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {/* <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                {t.notificationPreferences}
              </CardTitle>
              <CardDescription>{t.notificationDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t.emailNotifications}</Label>
                    <p className="text-sm text-gray-600">{t.emailNotificationsDesc}</p>
                  </div>
                  <Switch 
                    checked={editedNotification?.emailNotifications || false} 
                    onCheckedChange={(checked) => setEditedNotification(prev => ({ ...prev, emailNotifications: checked }))} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t.bookingAlerts}</Label>
                    <p className="text-sm text-gray-600">{t.bookingAlertsDesc}</p>
                  </div>
                  <Switch 
                    checked={editedNotification?.bookingAlerts || false} 
                    onCheckedChange={(checked) => setEditedNotification(prev => ({ ...prev, bookingAlerts: checked }))} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t.dailyReports}</Label>
                    <p className="text-sm text-gray-600">{t.dailyReportsDesc}</p>
                  </div>
                  <Switch 
                    checked={editedNotification?.dailyReports || false} 
                    onCheckedChange={(checked) => setEditedNotification(prev => ({ ...prev, dailyReports: checked }))} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t.weeklyReports}</Label>
                    <p className="text-sm text-gray-600">{t.weeklyReportsDesc}</p>
                  </div>
                  <Switch 
                    checked={editedNotification?.weeklyReports || false} 
                    onCheckedChange={(checked) => setEditedNotification(prev => ({ ...prev, weeklyReports: checked }))} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t.systemAlerts}</Label>
                    <p className="text-sm text-gray-600">{t.systemAlertsDesc}</p>
                  </div>
                  <Switch 
                    checked={editedNotification?.systemAlerts || false} 
                    onCheckedChange={(checked) => setEditedNotification(prev => ({ ...prev, systemAlerts: checked }))} 
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave("notifications")}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.saveNotificationSettings}
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Booking Settings */}
        {/* <TabsContent value="booking" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {t.bookingConfiguration}
              </CardTitle>
              <CardDescription>{t.bookingRulesDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultDuration">{t.defaultBookingDuration}</Label>
                  <Select 
                    value={editedBooking?.defaultBookingDuration?.toString() || "60"} 
                    onValueChange={(value) => setEditedBooking(prev => ({ ...prev, defaultBookingDuration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {t.minutes}</SelectItem>
                      <SelectItem value="60">60 {t.minutes}</SelectItem>
                      <SelectItem value="90">90 {t.minutes}</SelectItem>
                      <SelectItem value="120">120 {t.minutes}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAdvance">{t.maxAdvanceBooking}</Label>
                  <Input
                    id="maxAdvance"
                    type="number"
                    value={editedBooking?.maxAdvanceBooking || 30}
                    onChange={(e) => setEditedBooking(prev => ({ ...prev, maxAdvanceBooking: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minAdvance">{t.minAdvanceBooking}</Label>
                  <Input
                    id="minAdvance"
                    type="number"
                    value={editedBooking?.minAdvanceBooking || 1}
                    onChange={(e) => setEditedBooking(prev => ({ ...prev, minAdvanceBooking: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationDeadline">{t.cancellationDeadline}</Label>
                  <Input
                    id="cancellationDeadline"
                    type="number"
                    value={editedBooking?.cancellationDeadline || 24}
                    onChange={(e) => setEditedBooking(prev => ({ ...prev, cancellationDeadline: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t.autoConfirmBookings}</Label>
                    <p className="text-sm text-gray-600">{t.autoConfirmDescription}</p>
                  </div>
                  <Switch 
                    checked={editedBooking?.autoConfirmBookings || false} 
                    onCheckedChange={(checked) => setEditedBooking(prev => ({ ...prev, autoConfirmBookings: checked }))} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t.allowCancellations}</Label>
                    <p className="text-sm text-gray-600">{t.allowCancellationsDesc}</p>
                  </div>
                  <Switch 
                    checked={editedBooking?.allowCancellations || false} 
                    onCheckedChange={(checked) => setEditedBooking(prev => ({ ...prev, allowCancellations: checked }))} 
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave("booking")}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.saveBookingSettings}
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* System Settings */}
        {/* <TabsContent value="system" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                {t.systemConfiguration}
              </CardTitle>
              <CardDescription>{t.systemSettingsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">{t.timezone}</Label>
                  <Select 
                    value={editedSystem?.timezone || "America/New_York"} 
                    onValueChange={(value) => setEditedSystem(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">{t.dateFormat}</Label>
                  <Select 
                    value={editedSystem?.dateFormat || "MM/DD/YYYY"} 
                    onValueChange={(value) => setEditedSystem(prev => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">{t.timeFormat}</Label>
                  <Select 
                    value={editedSystem?.timeFormat || "12"} 
                    onValueChange={(value) => setEditedSystem(prev => ({ ...prev, timeFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t.language}</Label>
                  <Select 
                    value={editedSystem?.language || "en"} 
                    onValueChange={(value) => setEditedSystem(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="th">Thai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => handleSave("system")}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.saveSystemSettings}
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Security Settings */}
        {/* <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                {t.securityConfiguration}
              </CardTitle>
              <CardDescription>{t.securityDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">{t.sessionTimeout}</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={editedSecurity?.sessionTimeout || 60}
                    onChange={(e) => setEditedSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    min="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">{t.maxLoginAttempts}</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={editedSecurity?.maxLoginAttempts || 5}
                    onChange={(e) => setEditedSecurity(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    min="3"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t.twoFactorAuth}</Label>
                    <p className="text-sm text-gray-600">{t.twoFactorDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editedSecurity?.twoFactorAuth || false} 
                      onCheckedChange={(checked) => setEditedSecurity(prev => ({ ...prev, twoFactorAuth: checked }))} 
                    />
                    {editedSecurity?.twoFactorAuth && <Badge className="bg-green-100 text-green-700">{t.enabled}</Badge>}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">{t.securityRecommendations}</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• {t.securityRec1}</li>
                  <li>• {t.securityRec2}</li>
                  <li>• {t.securityRec3}</li>
                  <li>• {t.securityRec4}</li>
                </ul>
              </div>

              <Button
                onClick={() => handleSave("security")}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.saveSecuritySettings}
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* LINE Configuration */}
        <TabsContent value="line" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                LINE Integration Settings
              </CardTitle>
              <CardDescription>
                Configure LINE LIFF integration and customize messages for your booking system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="liffId">LINE LIFF ID</Label>
                <Input
                  id="liffId"
                  placeholder="e.g., 1234567890-abcdefgh"
                  value={editedLine?.liffId || ""}
                  onChange={(e) => setEditedLine(prev => ({ ...prev, liffId: e.target.value }))}
                />
                <p className="text-sm text-gray-500">
                  Enter your LINE LIFF (LINE Front-end Framework) application ID. 
                  You can get this from your LINE Developers Console.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="successMessage">Success Message</Label>
                <Textarea
                  id="successMessage"
                  placeholder="Message shown when booking is successful..."
                  value={editedLine?.successMessage || ""}
                  onChange={(e) => setEditedLine(prev => ({ ...prev, successMessage: e.target.value }))}
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  This message will be sent to users via LINE when their booking is confirmed.
                  Use variables from the list below to personalize the message.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelMessage">Cancel Message</Label>
                <Textarea
                  id="cancelMessage"
                  placeholder="Message shown when booking is cancelled..."
                  value={editedLine?.cancelMessage || ""}
                  onChange={(e) => setEditedLine(prev => ({ ...prev, cancelMessage: e.target.value }))}
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  This message will be sent to users via LINE when their booking is cancelled.
                  Use variables from the list below to personalize the message.
                </p>
              </div>

              {/* Available Variables Guide */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3">🔧 Available Variables</h4>
                <p className="text-sm text-yellow-800 mb-3">
                  You can use these variables in your messages. They will be automatically replaced with actual booking information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(LINE_MESSAGE_VARIABLES).map(([variable, description]) => (
                    <div key={variable} className="flex items-start gap-2">
                      <code className="bg-yellow-100 px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
                        {variable}
                      </code>
                      <span className="text-yellow-700 text-xs">{description}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Example Success Message:</p>
                  <p className="text-xs font-mono text-yellow-800">
                    🎉 Booking Confirmed!<br/>
                    <br/>
                    Booking #: {`{{booking_number}}`}<br/>
                    Company: {`{{company_name}}`}<br/>
                    Date: {`{{date}}`}<br/>
                    Time: {`{{time_slot}}`}<br/>
                    Room: {`{{room_name}}`}<br/>
                    <br/>
                    View details: {`{{booking_link}}`}<br/>
                    <br/>
                    Thank you for your booking!
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 How to get LINE LIFF ID:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="underline">LINE Developers Console</a></li>
                  <li>Create or select your LINE Login channel</li>
                  <li>Go to LIFF tab and create a new LIFF app</li>
                  <li>Copy the LIFF ID and paste it above</li>
                  <li>Set the endpoint URL to your booking domain</li>
                </ol>
              </div>

              <Button
                onClick={() => handleSave("line")}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save LINE Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Fields Settings */}
        <TabsContent value="custom-fields" className="space-y-6">
          <CustomFieldsList />
        </TabsContent>

        <TabsContent value="secret-keys" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                API Secret Keys
              </CardTitle>
              <CardDescription>
                Manage API secret keys for external applications and integrations. These keys provide secure access to your booking API endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Security Notice
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Keep your secret keys secure and never share them publicly. 
                          Secret keys provide full access to your booking API and should be treated as passwords.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8">
                  <Key className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Secret Key Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The full secret key management interface is available as a dedicated page.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => window.open('/admin/settings/secret-keys', '_blank')}
                      className="inline-flex items-center gap-2 mr-3"
                    >
                      <Key className="w-4 h-4" />
                      Open Secret Keys Manager
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('/admin/api-docs', '_blank')}
                      className="inline-flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      View API Documentation
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Settings className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        API Usage
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Include your secret key in API requests using one of these methods:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Header: <code className="bg-blue-100 px-1 rounded">x-secret-key: sk_your_key_here</code></li>
                          <li>Header: <code className="bg-blue-100 px-1 rounded">Authorization: Bearer sk_your_key_here</code></li>
                          <li>Query: <code className="bg-blue-100 px-1 rounded">?secret_key=sk_your_key_here</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Day Off Settings */}
        <TabsContent value="day-offs" className="space-y-6">
          <DayOffSettingsCard autoSelectFirstRoom={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
