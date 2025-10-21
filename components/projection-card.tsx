"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export function ProjectionCard() {
  const [period, setPeriod] = useState<"day" | "month">("day")
  const [percentage, setPercentage] = useState(75)
  const [projectedValue, setProjectedValue] = useState(197.75)

  useEffect(() => {
    if (period === "day") {
      setPercentage(75)
      setProjectedValue(197.75)
    } else {
      setPercentage(82)
      setProjectedValue(5932.5)
    }
  }, [period])

  const data = [
    { name: "Completed", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ]

  const COLORS = ["#22c55e", "#27264e"]

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h4 className="text-lg font-semibold text-white">Projeção salva</h4>
        <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[50px] p-1">
          <Button
            variant="ghost"
            onClick={() => setPeriod("day")}
            className={`rounded-[50px] px-4 py-2 text-sm ${
              period === "day" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
            }`}
          >
            Dia
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPeriod("month")}
            className={`rounded-[50px] px-4 py-2 text-sm ${
              period === "month" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
            }`}
          >
            Mês
          </Button>
        </div>
      </div>
      <div className="relative mx-auto w-[260px] h-[220px] my-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={105}
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-center">
          <p className="text-xl font-bold text-white">{percentage}%</p>
          <p className="text-xs text-green-500">R${projectedValue.toFixed(2)}</p>
        </div>
        <div className="absolute bottom-0 w-full flex justify-between items-end text-sm">
          <span className="text-[#f2474a] flex items-center gap-1">
            R$0
            <Image src="/assets/ARROWDOWN.svg" alt="Down" width={12} height={12} />
          </span>
          <span className="text-white">Conservador</span>
          <span className="text-green-500 flex items-center gap-1">
            R$261
            <Image src="/assets/arrow-up.svg" alt="Up" width={12} height={12} />
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full bg-transparent border border-[rgba(174,171,216,0.53)] text-[#aeabd8] rounded-[10px] py-3 text-base mt-auto hover:bg-[#27264e]/50"
      >
        Visualizar operações
      </Button>
    </Card>
  )
}
