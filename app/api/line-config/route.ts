import { NextResponse } from "next/server"
import { getLineConfig } from "@/app/admin/settings/actions"

export async function GET() {
  try {
    const lineConfig = await getLineConfig()
    return NextResponse.json({ 
      liffId: lineConfig.liffId,
      successMessage: lineConfig.successMessage,
      cancelMessage: lineConfig.cancelMessage
    })
  } catch (error) {
    console.error("Error fetching LINE config:", error)
    return NextResponse.json({ 
      liffId: process.env.NEXT_PUBLIC_LIFF_ID || '',
      successMessage: 'Your booking has been confirmed successfully! Thank you for choosing our service.',
      cancelMessage: 'Your booking has been cancelled. If you need assistance, please contact our support team.'
    }, { status: 200 }) // Return fallback config instead of error
  }
}
