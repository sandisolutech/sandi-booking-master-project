"use client"
import { useLanguage } from "@/lib/language-context"
import { useTutorial } from "@/lib/tutorial-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Play,
  RotateCcw,
  CheckCircle,
  Building2,
  LinkIcon,
  Users,
  BarChart3,
  Clock,
  ArrowRight,
  BookOpen,
} from "lucide-react"

export default function TutorialPage() {
  const { t } = useLanguage()
  const { startTutorial, restartTutorial, isCompleted, getProgressPercentage } = useTutorial()

  const tutorialModules = [
    {
      id: "companies",
      title: t.companyManagement,
      description: "Learn how to create, edit, and manage companies that will book your spaces",
      icon: Building2,
      steps: 4,
      duration: "5 min",
      topics: ["Create new company", "Edit company details", "Company information", "Contact management"],
    },
    {
      id: "links",
      title: t.bookingLinks,
      description: "Create and manage booking links that companies use to make reservations",
      icon: LinkIcon,
      steps: 4,
      duration: "6 min",
      topics: ["Create booking link", "Configure settings", "Preview link", "Share with companies"],
    },
    {
      id: "rooms",
      title: t.roomManagement,
      description: "Set up and manage your bookable spaces with equipment and capacity details",
      icon: Users,
      steps: 4,
      duration: "5 min",
      topics: ["Add new room", "Set capacity", "Equipment setup", "Room availability"],
    },
    {
      id: "reports",
      title: t.reportsAndAnalytics,
      description: "Master the reports system to filter data, manage bookings, and track performance",
      icon: BarChart3,
      steps: 6,
      duration: "8 min",
      topics: [
        "View statistics",
        "Filter bookings",
        "Search function",
        "Approve/reject",
        "Status management",
        "Analytics",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{t.tutorialCenter}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to BookSpace! This interactive tutorial will guide you through all the essential features you need to
          manage your booking system effectively.
        </p>
      </div>

      {/* Tutorial Progress */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">{t.tutorialCompleted}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Congratulations! You've completed the BookSpace tutorial. You can restart it anytime to refresh your
              knowledge.
            </p>
            <Button onClick={restartTutorial} variant="outline" className="border-green-300 text-green-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart Tutorial
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Start Tutorial */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Ready to Get Started?</CardTitle>
          <CardDescription className="text-blue-600">
            The complete tutorial takes about 25 minutes and covers all major features. You can exit and resume anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={startTutorial} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Play className="mr-2 h-5 w-5" />
              Start Interactive Tutorial
            </Button>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="h-4 w-4" />
              <span>~25 minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {tutorialModules.map((module, index) => (
          <Card key={module.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <module.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <Badge variant="secondary">{module.steps} steps</Badge>
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Duration: {module.duration}</span>
                  <span>
                    Module {index + 1} of {tutorialModules.length}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">What you'll learn:</h4>
                  <ul className="space-y-1">
                    {module.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="h-3 w-3" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tutorial Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tutorial Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                <ArrowRight className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Interactive Guidance</h3>
              <p className="text-sm text-muted-foreground">Follow highlighted elements and step-by-step instructions</p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">Safe Environment</h3>
              <p className="text-sm text-muted-foreground">Practice without affecting your real data</p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
                <RotateCcw className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium">Resume Anytime</h3>
              <p className="text-sm text-muted-foreground">Exit and continue where you left off</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
