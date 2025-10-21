"use client"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"

interface BalanceCardProps {
  dateRange: { start: string; end: string }
}

export function BalanceCard({ dateRange }: BalanceCardProps) {
  const [chartData, setChartData] = useState<{ day: number; gain: number; loss: number }[]>([])

  useEffect(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      day: i + 1,
      gain: Math.floor(Math.random() * 30000) + 20000,
      loss: Math.floor(Math.random() * 15000) + 5000,
    }))
    setChartData(data)
  }, [dateRange])

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
            Perca
          </span>
        </div>
        <p className="text-base text-[#8c89b4]">
          {dateRange.start.split("/")[0]} de ago. - {dateRange.end.split("/")[0]} de ago
        </p>
      </div>
      <div className="relative w-full h-[280px] mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorGain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16c784" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16c784" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
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
            <Tooltip
              contentStyle={{
                backgroundColor: "#27264e",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => [`R$${value.toLocaleString("pt-BR")}`, ""]}
              labelFormatter={(label) => `${label} de Agosto`}
            />
            <Area
              type="monotone"
              dataKey="gain"
              stroke="#16c784"
              strokeWidth={2}
              fill="url(#colorGain)"
              animationDuration={1000}
              dot={false}
              activeDot={false as unknown as any}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
