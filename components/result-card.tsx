"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface ResultCardProps {
  dateRange: { start: string; end: string }
}

export function ResultCard({ dateRange }: ResultCardProps) {
  const [result, setResult] = useState({ value: 632000, percentage: 1.29 })
  const [chartData, setChartData] = useState<{ value: number }[]>([])

  // Simulate data fetching based on date range
  useEffect(() => {
    // In a real app, this would fetch from an API
    const randomValue = Math.floor(Math.random() * 200000) + 500000
    const randomPercentage = (Math.random() * 3).toFixed(2)
    setResult({ value: randomValue, percentage: Number.parseFloat(randomPercentage) })

    const data = Array.from({ length: 30 }, (_, i) => ({
      value: Math.floor(Math.random() * 40000) + 80000 + i * 1000,
    }))
    setChartData(data)
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
        <h4 className="text-lg font-semibold text-white">Resultado do período</h4>
        <p className="text-base text-[#8c89b4]">
          {dateRange.start.split("/")[0]} de ago. - {dateRange.end.split("/")[0]} de ago
        </p>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-[45px] h-[45px] bg-[#16c784] rounded-[10px] flex items-center justify-center">
          <Image src="/assets/seta diagonal direita.jpg" alt="Up" width={13} height={13} />
        </div>
        <p className="text-[35px] font-semibold text-white">{formatCurrency(result.value)}</p>
        <span className="bg-[rgba(2,177,90,0.15)] text-[#16c784] text-xs px-2 py-1 rounded-[10px]">
          +{result.percentage}%
        </span>
      </div>
      <div className="relative w-full h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
