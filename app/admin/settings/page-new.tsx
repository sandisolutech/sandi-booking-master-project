"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Bell, Shield, Clock, Globe, Key, Save, Eye, EyeOff, Upload, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
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
  type GeneralConfig,
  type NotificationConfig,
  type BookingConfig,
  type SystemConfig,
  type SecurityConfig
} from "./actions"

export default function SettingsPage() {
  const { t } = useLanguage()
  
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

  // Form state for editing
  const [editedGeneral, setEditedGeneral] = useState<Partial<GeneralConfig>>({})
  const [editedNotification, setEditedNotification] = useState<Partial<NotificationConfig>>({})
  const [editedBooking, setEditedBooking] = useState<Partial<BookingConfig>>({})
  const [editedSystem, setEditedSystem] = useState<Partial<SystemConfig>>({})
  const [editedSecurity, setEditedSecurity] = useState<Partial<SecurityConfig>>({})

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Load all configuration data on component mount
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setLoading(true)
        const [general, notification, booking, system, security] = await Promise.all([
          getGeneralConfig(),
          getNotificationConfig(),
          getBookingConfig(),
          getSystemConfig(),
          getSecurityConfig()
        ])
        
        setGeneralConfig(general)
        setNotificationConfig(notification)
        setBookingConfig(booking)
        setSystemConfig(system)
        setSecurityConfig(security)
        
        // Initialize form state
        setEditedGeneral(general)
        setEditedNotification(notification)
        setEditedBooking(booking)
        setEditedSystem(system)
        setEditedSecurity(security)
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t.general}</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t.account}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t.notifications}</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">{t.booking}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{t.system}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">{t.security}</span>
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
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">B</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      {t.uploadNew}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking" className="space-y-6">
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
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
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
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
