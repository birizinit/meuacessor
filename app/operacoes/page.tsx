"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Filters } from "@/components/filters"
import { OperationsTable } from "@/components/operations-table"

export default function OperacoesPage() {
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
          <OperationsTable />
        </div>
      </main>
    </div>
  )
}
