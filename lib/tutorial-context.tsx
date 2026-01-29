"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface TutorialStep {
  id: number
  title: string
  titleTh: string
  description: string
  descriptionTh: string
  page: string
  targetSelector?: string
  position?: "top" | "bottom" | "left" | "right"
  action?: string
  nextPage?: string
  waitForDialog?: boolean
  closeDialog?: boolean
}

interface TutorialContextType {
  isTutorialMode: boolean
  currentStep: number
  totalSteps: number
  isCompleted: boolean
  currentTutorialStep: TutorialStep | null
  startTutorial: () => void
  exitTutorial: () => void
  restartTutorial: () => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  markAsComplete: () => void
  getProgressPercentage: () => number
  tutorialSteps: TutorialStep[]
}

const tutorialSteps: TutorialStep[] = [
  // Welcome
  {
    id: 1,
    title: "Welcome to BookSpace Tutorial",
    titleTh: "ยินดีต้อนรับสู่บทเรียน BookSpace",
    description:
      "This tutorial will guide you through all the key features of BookSpace. You'll learn how to manage companies, create booking links, manage rooms, and use reports effectively.",
    descriptionTh:
      "บทเรียนนี้จะแนะนำคุณผ่านคุณสมบัติสำคัญทั้งหมดของ BookSpace คุณจะได้เรียนรู้วิธีจัดการบริษัท สร้างลิงก์การจอง จัดการห้อง และใช้รายงานอย่างมีประสิทธิภาพ",
    page: "/admin/dashboard",
  },

  // Company Management
  {
    id: 2,
    title: "Company Management",
    titleTh: "การจัดการบริษัท",
    description:
      "Let's start by learning how to manage companies. Companies are the organizations that will be booking your spaces.",
    descriptionTh: "เริ่มต้นด้วยการเรียนรู้วิธีจัดการบริษัท บริษัทคือองค์กรที่จะจองพื้นที่ของคุณ",
    page: "/admin/companies",
    nextPage: "/admin/companies",
  },
  {
    id: 3,
    title: "Create New Company",
    titleTh: "สร้างบริษัทใหม่",
    description: "Click this button to create a new company. This will open a form where you can add company details.",
    descriptionTh: "คลิกปุ่มนี้เพื่อสร้างบริษัทใหม่ จะเปิดฟอร์มที่คุณสามารถเพิ่มรายละเอียดบริษัทได้",
    page: "/admin/companies",
    targetSelector: "[data-tutorial='add-company-btn']",
    position: "left",
    action: "click",
    waitForDialog: true,
  },
  {
    id: 4,
    title: "Company Form",
    titleTh: "ฟอร์มบริษัท",
    description:
      "Fill in the company details like name, email, phone, and description. This information helps you manage and contact companies.",
    descriptionTh: "กรอกรายละเอียดบริษัท เช่น ชื่อ อีเมล โทรศัพท์ และคำอธิบาย ข้อมูลนี้ช่วยให้คุณจัดการและติดต่อบริษัทได้",
    page: "/admin/companies",
    targetSelector: "[data-tutorial='company-form']",
    position: "right",
  },
  {
    id: 5,
    title: "Close Dialog and Continue",
    titleTh: "ปิดไดอะล็อกและดำเนินการต่อ",
    description: "Now close this dialog to continue with the tutorial. We'll learn about editing companies next.",
    descriptionTh: "ตอนนี้ปิดไดอะล็อกนี้เพื่อดำเนินการต่อกับบทเรียน เราจะเรียนรู้เกี่ยวกับการแก้ไขบริษัทต่อไป",
    page: "/admin/companies",
    closeDialog: true,
  },
  {
    id: 6,
    title: "Edit Company",
    titleTh: "แก้ไขบริษัท",
    description:
      "You can edit any company by clicking the edit button on their card. This allows you to update their information anytime.",
    descriptionTh: "คุณสามารถแก้ไขบริษัทใดก็ได้โดยคลิกปุ่มแก้ไขบนการ์ดของพวกเขา ซึ่งช่วยให้คุณอัปเดตข้อมูลได้ตลอดเวลา",
    page: "/admin/companies",
    targetSelector: "[data-tutorial='edit-company-btn']",
    position: "top",
  },

  // Link Management
  {
    id: 7,
    title: "Booking Links",
    titleTh: "ลิงก์การจอง",
    description: "Now let's learn about booking links. These are special URLs that companies use to book your spaces.",
    descriptionTh: "ตอนนี้มาเรียนรู้เกี่ยวกับลิงก์การจอง นี่คือ URL พิเศษที่บริษัทใช้ในการจองพื้นที่ของคุณ",
    page: "/admin/links",
    nextPage: "/admin/links",
  },
  {
    id: 8,
    title: "Create Booking Link",
    titleTh: "สร้างลิงก์การจอง",
    description:
      "Click here to create a new booking link. You can customize settings like approval mode and expiration.",
    descriptionTh: "คลิกที่นี่เพื่อสร้างลิงก์การจองใหม่ คุณสามารถปรับแต่งการตั้งค่า เช่น โหมดการอนุมัติและวันหมดอายุ",
    page: "/admin/links",
    targetSelector: "[data-tutorial='create-link-btn']",
    position: "left",
    action: "click",
  },
  {
    id: 9,
    title: "Link Configuration",
    titleTh: "การกำหนดค่าลิงก์",
    description:
      "Configure your link settings: choose between auto or manual approval, set expiration dates, and customize the link name.",
    descriptionTh: "กำหนดค่าการตั้งค่าลิงก์ของคุณ: เลือกระหว่างการอนุมัติอัตโนมัติหรือด้วยตนเอง กำหนดวันหมดอายุ และปรับแต่งชื่อลิงก์",
    page: "/admin/links/create",
    targetSelector: "[data-tutorial='link-config']",
    position: "right",
  },
  {
    id: 10,
    title: "Preview Link",
    titleTh: "ดูตัวอย่างลิงก์",
    description:
      "After creating a link, you can preview how it looks to users and copy the URL to share with companies.",
    descriptionTh: "หลังจากสร้างลิงก์แล้ว คุณสามารถดูตัวอย่างว่าผู้ใช้จะเห็นอย่างไร และคัดลอก URL เพื่อแชร์กับบริษัท",
    page: "/admin/links",
    targetSelector: "[data-tutorial='link-preview']",
    position: "top",
  },

  // Room Management
  {
    id: 11,
    title: "Room Management",
    titleTh: "การจัดการห้อง",
    description: "Let's learn how to manage your spaces. Rooms are the physical spaces that can be booked.",
    descriptionTh: "มาเรียนรู้วิธีจัดการพื้นที่ของคุณ ห้องคือพื้นที่ทางกายภาพที่สามารถจองได้",
    page: "/admin/rooms",
    nextPage: "/admin/rooms",
  },
  {
    id: 12,
    title: "Create New Room",
    titleTh: "สร้างห้องใหม่",
    description: "Click here to add a new room. You'll specify details like capacity, equipment, and description.",
    descriptionTh: "คลิกที่นี่เพื่อเพิ่มห้องใหม่ คุณจะระบุรายละเอียด เช่น ความจุ อุปกรณ์ และคำอธิบาย",
    page: "/admin/rooms",
    targetSelector: "[data-tutorial='add-room-btn']",
    position: "left",
    action: "click",
    waitForDialog: true,
  },
  {
    id: 13,
    title: "Room Details",
    titleTh: "รายละเอียดห้อง",
    description:
      "Fill in room information: name, description, capacity, and available equipment. This helps users choose the right space.",
    descriptionTh: "กรอกข้อมูลห้อง: ชื่อ คำอธิบาย ความจุ และอุปกรณ์ที่มี ซึ่งช่วยให้ผู้ใช้เลือกพื้นที่ที่เหมาะสม",
    page: "/admin/rooms",
    targetSelector: "[data-tutorial='room-form']",
    position: "right",
  },
  {
    id: 14,
    title: "Close Room Dialog",
    titleTh: "ปิดไดอะล็อกห้อง",
    description: "Now close this room dialog to continue with the tutorial. We'll learn about editing rooms next.",
    descriptionTh: "ตอนนี้ปิดไดอะล็อกห้องนี้เพื่อดำเนินการต่อกับบทเรียน เราจะเรียนรู้เกี่ยวกับการแก้ไขห้องต่อไป",
    page: "/admin/rooms",
    closeDialog: true,
  },
  {
    id: 15,
    title: "Edit Room",
    titleTh: "แก้ไขห้อง",
    description:
      "You can edit room details anytime by clicking the edit button. Update capacity, equipment, or room status as needed.",
    descriptionTh: "คุณสามารถแก้ไขรายละเอียดห้องได้ตลอดเวลาโดยคลิกปุ่มแก้ไข อัปเดตความจุ อุปกรณ์ หรือสถานะห้องตามต้องการ",
    page: "/admin/rooms",
    targetSelector: "[data-tutorial='edit-room-btn']",
    position: "top",
  },

  // Reports and Filtering
  {
    id: 16,
    title: "Reports Overview",
    titleTh: "ภาพรวมรายงาน",
    description:
      "The reports section shows all booking data and statistics. This is where you manage booking requests and view analytics.",
    descriptionTh: "ส่วนรายงานแสดงข้อมูลการจองและสถิติทั้งหมด นี่คือที่ที่คุณจัดการคำขอการจองและดูการวิเคราะห์",
    page: "/admin/reports",
    nextPage: "/admin/reports",
  },
  {
    id: 17,
    title: "Booking Statistics",
    titleTh: "สถิติการจอง",
    description: "These cards show key metrics: total bookings, confirmed, pending, cancelled, and rejected bookings.",
    descriptionTh: "การ์ดเหล่านี้แสดงตัวชี้วัดสำคัญ: การจองทั้งหมด ยืนยันแล้ว รอดำเนินการ ยกเลิก และปฏิเสธ",
    page: "/admin/reports",
    targetSelector: "[data-tutorial='booking-stats']",
    position: "bottom",
  },
  {
    id: 18,
    title: "Filter Bookings",
    titleTh: "กรองการจอง",
    description:
      "Use these filters to find specific bookings by date, room, company, or status. This helps you manage large amounts of data.",
    descriptionTh: "ใช้ตัวกรองเหล่านี้เพื่อค้นหาการจองเฉพาะตามวันที่ ห้อง บริษัท หรือสถานะ ซึ่งช่วยให้คุณจัดการข้อมูลจำนวนมากได้",
    page: "/admin/reports",
    targetSelector: "[data-tutorial='filters-section']",
    position: "bottom",
  },
  {
    id: 19,
    title: "Search Functionality",
    titleTh: "ฟังก์ชันการค้นหา",
    description:
      "Use the search box to quickly find bookings by influencer name or company. Very useful for customer support.",
    descriptionTh: "ใช้กล่องค้นหาเพื่อค้นหาการจองอย่างรวดเร็วตามชื่ออินฟลูเอนเซอร์หรือบริษัท มีประโยชน์มากสำหรับการสนับสนุนลูกค้า",
    page: "/admin/reports",
    targetSelector: "[data-tutorial='search-box']",
    position: "left",
  },
  {
    id: 20,
    title: "Booking Actions",
    titleTh: "การดำเนินการจอง",
    description: "For each booking, you can approve, reject, or cancel. Click these buttons to change booking status.",
    descriptionTh: "สำหรับการจองแต่ละรายการ คุณสามารถอนุมัติ ปฏิเสธ หรือยกเลิกได้ คลิกปุ่มเหล่านี้เพื่อเปลี่ยนสถานะการจอง",
    page: "/admin/reports",
    targetSelector: "[data-tutorial='booking-actions']",
    position: "top",
  },
  {
    id: 21,
    title: "Tutorial Complete!",
    titleTh: "บทเรียนเสร็จสิ้น!",
    description:
      "Congratulations! You've learned all the key features of BookSpace. You're now ready to manage your booking system effectively.",
    descriptionTh: "ยินดีด้วย! คุณได้เรียนรู้คุณสมบัติสำคัญทั้งหมดของ BookSpace แล้ว ตอนนี้คุณพร้อมที่จะจัดการระบบการจองอย่างมีประสิทธิภาพแล้ว",
    page: "/admin/reports",
  },
]

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isTutorialMode, setIsTutorialMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()
  const totalSteps = tutorialSteps.length

  const currentTutorialStep = tutorialSteps.find((step) => step.id === currentStep) || null

  // Load tutorial state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("tutorial-state")
    if (savedState) {
      const { completed } = JSON.parse(savedState)
      setIsCompleted(completed)
    }
  }, [])

  // Save tutorial state to localStorage
  useEffect(() => {
    localStorage.setItem("tutorial-state", JSON.stringify({ completed: isCompleted }))
  }, [isCompleted])

  const startTutorial = () => {
    setIsTutorialMode(true)
    setCurrentStep(1)
    router.push("/admin/dashboard")
  }

  const exitTutorial = () => {
    setIsTutorialMode(false)
    setCurrentStep(1)
    // Close any open dialogs
    const dialogs = document.querySelectorAll('[role="dialog"]')
    dialogs.forEach((dialog) => {
      const closeButton =
        dialog.querySelector('button[aria-label="Close"]') || dialog.querySelector("button:last-child")
      if (closeButton) {
        ;(closeButton as HTMLElement).click()
      }
    })
  }

  const restartTutorial = () => {
    setCurrentStep(1)
    setIsTutorialMode(true)
    router.push("/admin/dashboard")
  }

  const goToNextStep = () => {
    const currentStepData = tutorialSteps.find((step) => step.id === currentStep)

    // Handle dialog closing
    if (currentStepData?.closeDialog) {
      const dialogs = document.querySelectorAll('[role="dialog"]')
      dialogs.forEach((dialog) => {
        const closeButton =
          dialog.querySelector('button[aria-label="Close"]') ||
          dialog.querySelector("[data-radix-collection-item]:last-child button")
        if (closeButton) {
          ;(closeButton as HTMLElement).click()
        }
      })

      // Wait for dialog to close before proceeding
      setTimeout(() => {
        if (currentStep < totalSteps) {
          const nextStep = currentStep + 1
          setCurrentStep(nextStep)

          const nextTutorialStep = tutorialSteps.find((step) => step.id === nextStep)
          if (nextTutorialStep?.nextPage) {
            router.push(nextTutorialStep.nextPage)
          }
        } else {
          setIsTutorialMode(false)
          setCurrentStep(1)
        }
      }, 300)
      return
    }

    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)

      // Navigate to next page if specified
      const nextTutorialStep = tutorialSteps.find((step) => step.id === nextStep)
      if (nextTutorialStep?.nextPage) {
        router.push(nextTutorialStep.nextPage)
      }
    } else {
      // Tutorial completed
      setIsTutorialMode(false)
      setCurrentStep(1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)

      // Navigate to previous page if needed
      const prevTutorialStep = tutorialSteps.find((step) => step.id === prevStep)
      if (prevTutorialStep?.page && prevTutorialStep.page !== window.location.pathname) {
        router.push(prevTutorialStep.page)
      }
    }
  }

  const markAsComplete = () => {
    setIsCompleted(true)
    setIsTutorialMode(false)
    setCurrentStep(1)
  }

  const getProgressPercentage = () => {
    return Math.round((currentStep / totalSteps) * 100)
  }

  return (
    <TutorialContext.Provider
      value={{
        isTutorialMode,
        currentStep,
        totalSteps,
        isCompleted,
        currentTutorialStep,
        startTutorial,
        exitTutorial,
        restartTutorial,
        goToNextStep,
        goToPreviousStep,
        markAsComplete,
        getProgressPercentage,
        tutorialSteps,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return context
}
