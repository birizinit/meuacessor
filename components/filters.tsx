"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfWeek, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface FiltersProps {
  selectedPeriod: "week" | "month" | "today"
  onPeriodChange: (period: "week" | "month" | "today") => void
  currentMonth: string
  onMonthChange: (month: string) => void
  dateRange: { start: string; end: string }
  onDateRangeChange: (range: { start: string; end: string }) => void
}

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

export function Filters({
  selectedPeriod,
  onPeriodChange,
  currentMonth,
  onMonthChange,
  dateRange,
  onDateRangeChange,
}: FiltersProps) {
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from: undefined, to: undefined })
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedPeriod === "today") {
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)

      const newDateRange = {
        start: format(today, "dd/MM/yyyy"),
        end: format(todayEnd, "dd/MM/yyyy"),
      }

      onDateRangeChange(newDateRange)
      setSelectedRange({ from: today, to: todayEnd })
    } else if (selectedPeriod === "week") {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const weekEnd = addDays(weekStart, 6)
      weekStart.setHours(0, 0, 0, 0)
      weekEnd.setHours(23, 59, 59, 999)

      const newDateRange = {
        start: format(weekStart, "dd/MM/yyyy"),
        end: format(weekEnd, "dd/MM/yyyy"),
      }

      onDateRangeChange(newDateRange)
      setSelectedRange({ from: weekStart, to: weekEnd })
    } else {
      const monthIndex = months.indexOf(currentMonth)
      const firstDay = new Date(currentYear, monthIndex, 1)
      const lastDay = new Date(currentYear, monthIndex + 1, 0)
      firstDay.setHours(0, 0, 0, 0)
      lastDay.setHours(23, 59, 59, 999)

      const newDateRange = {
        start: format(firstDay, "dd/MM/yyyy"),
        end: format(lastDay, "dd/MM/yyyy"),
      }

      onDateRangeChange(newDateRange)
      setSelectedRange({ from: firstDay, to: lastDay })
    }
  }, [selectedPeriod, currentMonth, currentYear, onDateRangeChange])

  const handlePreviousMonth = () => {
    const currentIndex = months.indexOf(currentMonth)
    if (currentIndex === 0) {
      onMonthChange(months[11])
      setCurrentYear(currentYear - 1)
    } else {
      onMonthChange(months[currentIndex - 1])
    }
  }

  const handleNextMonth = () => {
    const currentIndex = months.indexOf(currentMonth)
    if (currentIndex === 11) {
      onMonthChange(months[0])
      setCurrentYear(currentYear + 1)
    } else {
      onMonthChange(months[currentIndex + 1])
    }
  }

  const handleRangeSelect = (
    range:
      | {
          from: Date | undefined
          to: Date | undefined
        }
      | undefined,
  ) => {
    if (range) {
      setSelectedRange(range)

      if (range.from) {
        setCurrentYear(range.from.getFullYear())
        onMonthChange(months[range.from.getMonth()])
      }

      if (range.from && range.to) {
        const startDate = new Date(range.from)
        const endDate = new Date(range.to)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)

        onDateRangeChange({
          start: format(startDate, "dd/MM/yyyy"),
          end: format(endDate, "dd/MM/yyyy"),
        })
      }
    }
  }

  return (
    <section className="py-9">
      <div className="container mx-auto px-4 md:px-10 lg:px-[124px] max-w-[1920px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-6">
            <button
              onClick={handlePreviousMonth}
              className="bg-[#27264e] border border-[rgba(174,171,216,0.53)] w-8 h-8 rounded-[5px] flex items-center justify-center cursor-pointer hover:bg-[#2f2e5a] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#aeabd8]" />
            </button>
            <h3 className="font-semibold text-2xl text-white">
              {currentMonth} {currentYear}
            </h3>
            <button
              onClick={handleNextMonth}
              className="bg-[#27264e] border border-[rgba(174,171,216,0.53)] w-8 h-8 rounded-[5px] flex items-center justify-center cursor-pointer hover:bg-[#2f2e5a] transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#aeabd8]" />
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 w-full md:w-auto">
            <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[50px] p-1.5 bg-transparent gap-1">
              <Button
                variant="ghost"
                onClick={() => onPeriodChange("week")}
                className={`rounded-[50px] px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedPeriod === "week"
                    ? "bg-[#845bf6] text-white shadow-lg shadow-[#845bf6]/50"
                    : "bg-transparent text-[#aeabd8] hover:text-white hover:bg-[#845bf6]/10"
                }`}
              >
                Semana
              </Button>
              <div className="w-px h-6 bg-[rgba(174,171,216,0.3)]" />
              <Button
                variant="ghost"
                onClick={() => onPeriodChange("month")}
                className={`rounded-[50px] px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedPeriod === "month"
                    ? "bg-[#845bf6] text-white shadow-lg shadow-[#845bf6]/50"
                    : "bg-transparent text-[#aeabd8] hover:text-white hover:bg-[#845bf6]/10"
                }`}
              >
                Mês
              </Button>
              <div className="w-px h-6 bg-[rgba(174,171,216,0.3)]" />
              <Button
                variant="ghost"
                onClick={() => onPeriodChange("today")}
                className={`rounded-[50px] px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedPeriod === "today"
                    ? "bg-[#845bf6] text-white shadow-lg shadow-[#845bf6]/50"
                    : "bg-transparent text-[#aeabd8] hover:text-white hover:bg-[#845bf6]/10"
                }`}
              >
                Hoje
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2.5 bg-[#1d1d41] border border-[rgba(174,171,216,0.53)] rounded-[10px] px-4 py-2.5 text-white text-sm hover:bg-[#27264e] transition-colors cursor-pointer">
                  <Image src="/assets/calendar.png" alt="Calendar" width={18} height={18} />
                  <span>
                    {dateRange.start} até {dateRange.end}
                  </span>
                  <Image src="/assets/seta baixo.svg" alt="Dropdown" width={12} height={12} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1d1d41] border-[rgba(174,171,216,0.53)]" align="end">
                <div className="p-4">
                  <p className="text-sm text-[#aeabd8] mb-2">Selecione uma data</p>
                  <Calendar
                    mode="range"
                    selected={selectedRange}
                    onSelect={handleRangeSelect}
                    locale={ptBR}
                    className="rounded-md [&_.rdp-day_today]:bg-transparent [&_.rdp-day_today]:font-normal"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </section>
  )
}
