"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/header"
import { Filters } from "@/components/filters"
import { OperationsTable } from "@/components/operations-table"

export default function OperacoesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "today">("month")
  const [currentMonth, setCurrentMonth] = useState(() => {
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
  })
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const lastDay = new Date(year, month, 0).getDate()
    return {
      start: `01/${month.toString().padStart(2, "0")}/${year}`,
      end: `${lastDay}/${month.toString().padStart(2, "0")}/${year}`,
    }
  })

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
          <OperationsTable dateRange={dateRange} selectedPeriod={selectedPeriod} />
        </div>
      </main>
    </div>
  )
}
