import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, ArrowRight, Shield, Zap, Heart, Sparkles } from "lucide-react"
import { CompanyLogo } from "@/components/company-logo"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CompanyLogo size="sm" showCompanyName />
            </div>
            <Link href="/login">
              <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                เข้าสู่ระบบผู้ดูแล
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              จองคิวคลีนิกความงาม{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                ออนไลน์
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              ระบบจองคิวคลีนิกความงามที่ทันสมัย สะดวก รวดเร็ว 
              จองได้ทุกที่ทุกเวลา พร้อมบริการดูแลผิวหน้าและความงามครบครัน
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3"
              >
                จองคิวตอนนี้
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8 py-3">
                ดูบริการทั้งหมด
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ทำไมต้องเลือก BeautyClinic Pro?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              คลีนิกความงามมาตรฐานสากล พร้อมบริการครบครันและระบบจองที่ทันสมัย
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">จองได้ทันที</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  จองคิวได้ภายในไม่กี่วินาที ด้วยระบบที่รวดเร็ว ไม่ต้องรอ ไม่ต้องยุ่งยาก
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">ปลอดภัย เชื่อถือได้</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  ระบบความปลอดภัยระดับองค์กร ข้อมูลของคุณปลอดภัย ไม่มีปัญหาการจองซ้อน
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">บริการครบครัน</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  บริการดูแลผิวหน้า ฉีดโบท็อกซ์ ฟิลเลอร์ และทรีทเมนต์ความงามอื่นๆ ครบครัน
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">วิธีการจองคิว</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ขั้นตอนง่ายๆ เพียง 3 ขั้นตอนเท่านั้น
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">เลือกบริการ</h3>
              <p className="text-gray-600">
                เลือกบริการที่ต้องการจากเมนูบริการต่างๆ ของคลีนิก
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">เลือกวันและเวลา</h3>
              <p className="text-gray-600">เลือกวันที่และช่วงเวลาที่สะดวกจากตารางเวลาที่ว่างอยู่</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">ยืนยันการจอง</h3>
              <p className="text-gray-600">
                กรอกข้อมูลส่วนตัวและยืนยันการจอง รับการยืนยันทันที
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">BeautyClinic Pro</span>
            </div>
            <div className="text-blue-200 text-sm">© 2024 BeautyClinic Pro. สงวนลิขสิทธิ์</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
