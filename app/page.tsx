"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/header"
import { Filters } from "@/components/filters"
import { ResultCard } from "@/components/result-card"
import { CalculatorCard } from "@/components/calculator-card"
import { BalanceCard } from "@/components/balance-card"
import { TopOperationsCard } from "@/components/top-operations-card"
import { ProjectionCard } from "@/components/projection-card"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "today">("month")

  const getCurrentMonth = () => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ]
    return months[new Date().getMonth()]
  }

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())

  const getDateRangeForMonth = (monthName: string) => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ]
    const monthIndex = months.indexOf(monthName)
    const year = new Date().getFullYear()
    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      return `${day}/${month}/${date.getFullYear()}`
    }

    return {
      start: formatDate(firstDay),
      end: formatDate(lastDay),
    }
  }

  const [dateRange, setDateRange] = useState(getDateRangeForMonth(getCurrentMonth()))

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141332] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#141332] flex items-center justify-center">
        <div className="text-white">Redirecionando...</div>
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
          <div className="flex flex-col lg:flex-row lg:items-start gap-7">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-5">
              <ResultCard dateRange={dateRange} currentMonth={currentMonth} />
              <CalculatorCard />
            </div>
            {/* Right Column */}
            <div className="flex-[1.6] flex flex-col gap-6">
              <BalanceCard dateRange={dateRange} selectedPeriod={selectedPeriod} currentMonth={currentMonth} />
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                <div className="flex-[1.85]">
                  <TopOperationsCard dateRange={dateRange} currentMonth={currentMonth} />
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
