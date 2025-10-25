"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { createApiClient } from "@/lib/api"

interface ResultCardProps {
  dateRange: { start: string; end: string }
}

export function ResultCard({ dateRange }: ResultCardProps) {
  const [result, setResult] = useState({ value: 0, percentage: 0 })
  const [chartData, setChartData] = useState<{ value: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchMonthlyProfit = async () => {
      const apiClient = createApiClient()
      if (!apiClient) return

      setIsLoading(true)
      try {
        const response = await apiClient.getTrades(1, 100)

        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const monthlyTrades = response.data.filter((trade) => {
          const tradeDate = new Date(trade.openTime)
          return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear
        })

        const totalProfit = monthlyTrades.reduce((sum, trade) => sum + trade.pnl, 0)
        const totalInvestment = monthlyTrades.reduce((sum, trade) => sum + trade.amount, 0)
        const percentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

        setResult({ value: totalProfit, percentage })

        const dailyProfits = new Map<number, number>()
        monthlyTrades.forEach((trade) => {
          const day = new Date(trade.openTime).getDate()
          dailyProfits.set(day, (dailyProfits.get(day) || 0) + trade.pnl)
        })

        const data = Array.from({ length: 30 }, (_, i) => ({
          value: dailyProfits.get(i + 1) || 0,
        }))
        setChartData(data)

        console.log("[v0] Monthly profit calculated:", totalProfit)
      } catch (error) {
        console.error("[v0] Error fetching monthly profit:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthlyProfit()
  }, [dateRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
        <h4 className="text-lg font-semibold text-white">Lucro do Mês</h4>
        <p className="text-base text-[#8c89b4]">
          {dateRange.start.split("/")[0]} de ago. - {dateRange.end.split("/")[0]} de ago
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-[#aeabd8]">Carregando...</div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-2">
            <div
              className={`w-[45px] h-[45px] rounded-[10px] flex items-center justify-center ${result.value >= 0 ? "bg-[#16c784]" : "bg-[#f2474a]"}`}
            >
              <Image
                src={result.value >= 0 ? "/assets/seta diagonal direita.svg" : "/assets/ARROWDOWN.svg"}
                alt={result.value >= 0 ? "Up" : "Down"}
                width={13}
                height={13}
              />
            </div>
            <p className="text-[35px] font-semibold text-white">{formatCurrency(result.value)}</p>
            <span
              className={`text-xs px-2 py-1 rounded-[10px] ${result.value >= 0 ? "bg-[rgba(2,177,90,0.15)] text-[#16c784]" : "bg-[rgba(242,71,74,0.15)] text-[#f2474a]"}`}
            >
              {result.value >= 0 ? "+" : ""}
              {result.percentage.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8c89b4] mb-5">
            <p>Consórcio 8%</p>
            <span className="bg-[rgba(140,137,180,0.15)] text-[#8c89b4] px-2 py-1 rounded-[10px]">
              {formatCurrency(result.value * 0.08)}
            </span>
          </div>

          <div className="relative w-full h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16c784" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16c784" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#16c784"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                  animationDuration={1000}
                  dot={false}
                  activeDot={false as unknown as any}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  )
}
