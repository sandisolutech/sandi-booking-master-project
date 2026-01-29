"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell, Search, Settings, User, Home, BarChart3, Users, FileText, Calendar, MoreHorizontal } from "lucide-react"

export default function Component() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* Top Progress Bar */}
      <div className="w-full h-1 bg-[#e8e8e8]">
        <div className="h-full w-3/4 bg-[#007aff]"></div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#e8e8e8] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-[#007aff] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-semibold text-[#1e1e1e]">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-[#e8e8e8] rounded-lg bg-[#f2f2f7] text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-[#757575]">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#757575]">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32&query=user+avatar" />
              <AvatarFallback className="bg-[#34c759] text-white">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#e8e8e8] min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {[
                { id: "dashboard", icon: Home, label: "Dashboard" },
                { id: "analytics", icon: BarChart3, label: "Analytics" },
                { id: "users", icon: Users, label: "Users" },
                { id: "reports", icon: FileText, label: "Reports" },
                { id: "calendar", icon: Calendar, label: "Calendar" },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id ? "bg-[#007aff] text-white" : "text-[#757575] hover:bg-[#f2f2f7]"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#1e1e1e] mb-2">Dashboard Overview</h2>
            <p className="text-[#757575]">Welcome back! Here's what's happening with your admin panel.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Total Users", value: "2,847", change: "+12%", color: "#34c759" },
              { title: "Active Sessions", value: "1,234", change: "+5%", color: "#007aff" },
              { title: "Revenue", value: "$45,678", change: "+18%", color: "#34c759" },
              { title: "Support Tickets", value: "23", change: "-8%", color: "#ff3b30" },
            ].map((stat, index) => (
              <Card key={index} className="border-[#e8e8e8]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#757575] mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-[#1e1e1e]">{stat.value}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2 border-[#e8e8e8]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#1e1e1e]">Recent Activity</h3>
                  <Button variant="ghost" size="icon" className="text-[#757575]">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "John Doe", action: "Created new user account", time: "2 minutes ago" },
                    { user: "Jane Smith", action: "Updated profile settings", time: "5 minutes ago" },
                    { user: "Mike Johnson", action: "Generated monthly report", time: "10 minutes ago" },
                    { user: "Sarah Wilson", action: "Resolved support ticket #1234", time: "15 minutes ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-[#f2f2f7]">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-[#007aff] text-white text-xs">
                          {activity.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-[#1e1e1e]">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-[#757575]">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-[#e8e8e8]">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-semibold text-[#1e1e1e]">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-[#34c759] hover:bg-[#2fb653] text-white">
                    <User className="w-4 h-4 mr-2" />
                    Add New User
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-[#e8e8e8] text-[#1e1e1e]">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-[#e8e8e8] text-[#1e1e1e]">
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-[#f2f2f7] rounded-lg">
                  <h4 className="text-sm font-medium text-[#1e1e1e] mb-2">System Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#757575]">Server Load</span>
                      <span className="text-[#1e1e1e]">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
