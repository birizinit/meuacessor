"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/header"
import { Filters } from "@/components/filters"
import { ResultCard } from "@/components/result-card"
import { CalculatorCard } from "@/components/calculator-card"
import { BalanceCard } from "@/components/balance-card"
import { TopOperationsCard } from "@/components/top-operations-card"
import { ProjectionCard } from "@/components/projection-card"

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "today">("month")
  const [currentMonth, setCurrentMonth] = useState("Agosto")
  const [dateRange, setDateRange] = useState({ start: "01/08/2025", end: "31/08/2025" })

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    if (authStatus !== "true") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141332] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141332]">
      <Header />
      <Filters
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <main className="pb-12">
        <div className="container mx-auto px-4 md:px-10 lg:px-[124px] max-w-[1920px]">
          <div className="flex flex-col lg:flex-row lg:items-end gap-7">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-5">
              <ResultCard dateRange={dateRange} />
              <CalculatorCard />
            </div>
            {/* Right Column */}
            <div className="flex-[1.6] flex flex-col gap-6">
              <BalanceCard dateRange={dateRange} />
              <div className="flex flex-col lg:flex-row lg:items-end gap-7">
                <div className="flex-[1.85]">
                  <TopOperationsCard dateRange={dateRange} />
                </div>
                <div className="flex-1">
                  <ProjectionCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
