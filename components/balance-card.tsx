"use client"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { useState, useEffect } from "react"
import { createApiClient } from "@/lib/api"
import { getMonthAbbreviation } from "@/lib/date-utils"

interface BalanceCardProps {
  dateRange: { start: string; end: string }
  selectedPeriod: "week" | "month" | "today"
  currentMonth: string
}

export function BalanceCard({ dateRange, selectedPeriod, currentMonth }: BalanceCardProps) {
  const [chartData, setChartData] = useState<{ day: number; gain: number; loss: number; label: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalanceData = async () => {
      const apiClient = createApiClient()
      if (!apiClient) {
        setError("API client não disponível. Faça login novamente.")
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const response = await apiClient.getTrades(1, 100)

        const [startDay, startMonth, startYear] = dateRange.start.split("/").map(Number)
        const [endDay, endMonth, endYear] = dateRange.end.split("/").map(Number)
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0)
        const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59)

        console.log("[v0] BalanceCard: Filtering trades between", startDate, "and", endDate)
        console.log("[v0] BalanceCard: Total trades received:", response.data.length)

        const filteredTrades = response.data.filter((trade) => {
          const tradeDate = new Date(trade.closeTime)
          const isInRange = tradeDate >= startDate && tradeDate <= endDate

          if (isInRange) {
            console.log("[v0] BalanceCard: Trade included:", {
              symbol: trade.symbol,
              closeTime: tradeDate.toISOString(),
              pnl: trade.pnl,
            })
          }

          return isInRange
        })

        console.log("[v0] BalanceCard: Filtered trades count:", filteredTrades.length)

        let data: { day: number; gain: number; loss: number; label: string }[] = []

        if (selectedPeriod === "month") {
          const dailyData = new Map<number, { gain: number; loss: number }>()

          filteredTrades.forEach((trade) => {
            const tradeDate = new Date(trade.closeTime)
            const dayOfMonth = tradeDate.getDate()

            const existing = dailyData.get(dayOfMonth) || { gain: 0, loss: 0 }

            if (trade.pnl > 0) {
              existing.gain += trade.pnl
            } else {
              existing.loss += Math.abs(trade.pnl)
            }

            dailyData.set(dayOfMonth, existing)
          })

          const daysInMonth = new Date(startYear, startMonth, 0).getDate()
          data = Array.from({ length: daysInMonth }, (_, i) => {
            const dayOfMonth = i + 1
            const dayData = dailyData.get(dayOfMonth) || { gain: 0, loss: 0 }
            return {
              day: dayOfMonth,
              gain: dayData.gain,
              loss: dayData.loss,
              label: `${dayOfMonth}`,
            }
          })
        } else if (selectedPeriod === "week") {
          const dailyData = new Map<number, { gain: number; loss: number }>()

          filteredTrades.forEach((trade) => {
            const tradeDate = new Date(trade.closeTime)
            const dayOfWeek = tradeDate.getDay()

            const existing = dailyData.get(dayOfWeek) || { gain: 0, loss: 0 }

            if (trade.pnl > 0) {
              existing.gain += trade.pnl
            } else {
              existing.loss += Math.abs(trade.pnl)
            }

            dailyData.set(dayOfWeek, existing)
          })

          const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
          data = Array.from({ length: 7 }, (_, i) => {
            const dayData = dailyData.get(i) || { gain: 0, loss: 0 }
            return {
              day: i,
              gain: dayData.gain,
              loss: dayData.loss,
              label: dayNames[i],
            }
          })
        } else {
          const hourlyData = new Map<number, { gain: number; loss: number }>()

          filteredTrades.forEach((trade) => {
            const tradeDate = new Date(trade.closeTime)
            const hour = tradeDate.getHours()

            const existing = hourlyData.get(hour) || { gain: 0, loss: 0 }

            if (trade.pnl > 0) {
              existing.gain += trade.pnl
            } else {
              existing.loss += Math.abs(trade.pnl)
            }

            hourlyData.set(hour, existing)
          })

          data = Array.from({ length: 24 }, (_, i) => {
            const hourData = hourlyData.get(i) || { gain: 0, loss: 0 }
            return {
              day: i,
              gain: hourData.gain,
              loss: hourData.loss,
              label: `${i}h`,
            }
          })
        }

        setChartData(data)
      } catch (error) {
        console.error("[v0] BalanceCard: Error fetching balance data:", error)
        setError(error instanceof Error ? error.message : "Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalanceData()
  }, [dateRange, selectedPeriod])

  const CustomDot = (props: any) => {
    const { cx, cy, index, payload } = props

    if (index === 0) return null

    const currentValue = payload.gain
    const previousValue = chartData[index - 1]?.gain

    const isGain = currentValue > previousValue
    const color = isGain ? "#16c784" : "#f2474a"

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        style={{
          filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color}) drop-shadow(0 0 12px ${color})`,
        }}
      />
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const gainValue = data.gain
      const lossValue = data.loss
      const formattedGain = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(gainValue)
      const formattedLoss = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(lossValue)

      return (
        <div className="bg-[#2a2a5a] border border-[#3a3a6a] rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm font-semibold mb-2">{data.label}</p>
          <p className="text-[#16c784] text-sm font-bold">Ganho: {formattedGain}</p>
          <p className="text-[#f2474a] text-sm font-bold">Perda: {formattedLoss}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <h4 className="text-lg font-semibold text-white">Balanço do período</h4>
        <div className="flex gap-5">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-3.5 h-3.5 rounded-full bg-[#16c784]"></span>
            Ganho
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-3.5 h-3.5 rounded-full bg-[#f2474a]"></span>
            Perda
          </span>
        </div>
        <p className="text-base text-[#8c89b4]">
          {(() => {
            const [startDay, startMonth, startYear] = dateRange.start.split("/").map(Number)
            const [endDay, endMonth, endYear] = dateRange.end.split("/").map(Number)

            const startMonthName = getMonthAbbreviation(
              [
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
              ][startMonth - 1],
            )
            const endMonthName = getMonthAbbreviation(
              [
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
              ][endMonth - 1],
            )

            return `${startDay} de ${startMonthName}. - ${endDay} de ${endMonthName}`
          })()}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-[#aeabd8]">Carregando...</div>
      ) : error ? (
        <div className="text-center py-8 text-[#f2474a]">{error}</div>
      ) : chartData.length === 0 ? (
        <div className="text-center py-8 text-[#aeabd8]">Nenhum dado disponível para o período</div>
      ) : (
        <div className="relative w-full h-[320px] mt-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorGain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16c784" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16c784" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#8c89b4"
                tick={{ fill: "#8c89b4", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#8c89b4"
                tick={{ fill: "#8c89b4", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="gain"
                stroke="#16c784"
                strokeWidth={3}
                fill="url(#colorGain)"
                animationDuration={1000}
                dot={<CustomDot />}
                activeDot={{ r: 7, fill: "#16c784", stroke: "#16c784", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
