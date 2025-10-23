"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProjectionCard() {
  const router = useRouter()
  const [period, setPeriod] = useState<"day" | "month">("day")
  const [percentage, setPercentage] = useState(72.5)
  const [projectedValue, setProjectedValue] = useState(189.225)

  useEffect(() => {
    if (period === "day") {
      setPercentage(72.5)
      setProjectedValue(189.225)
    } else {
      setPercentage(82)
      setProjectedValue(5932.5)
    }
  }, [period])

  const radius = 80
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-5 flex flex-col">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
        <h4 className="text-lg font-semibold text-white">Projeção salva</h4>
        <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[50px] p-1">
          <Button
            variant="ghost"
            onClick={() => setPeriod("day")}
            className={`rounded-[50px] px-3.5 py-1.5 text-sm ${
              period === "day" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
            }`}
          >
            Dia
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPeriod("month")}
            className={`rounded-[50px] px-3.5 py-1.5 text-sm ${
              period === "month" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
            }`}
          >
            Mês
          </Button>
        </div>
      </div>

      <div className="relative mx-auto w-[240px] h-[180px] my-3 flex flex-col items-center justify-center">
        <svg width="240" height="140" viewBox="0 0 240 140" className="absolute top-0">
          {/* Background arc */}
          <path
            d="M 30 120 A 80 80 0 0 1 210 120"
            fill="none"
            stroke="#27264e"
            strokeWidth="32"
            strokeLinecap="square"
          />
          {/* Progress arc */}
          <path
            d="M 30 120 A 80 80 0 0 1 210 120"
            fill="none"
            stroke="#00ff88"
            strokeWidth="32"
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.3s ease",
              filter: "drop-shadow(0 0 8px rgba(0, 255, 136, 0.6))",
            }}
          />
        </svg>

        {/* Text overlay */}
        <div className="text-center mt-8">
          <p className="text-3xl font-bold text-white">{percentage}%</p>
          <p className="text-sm text-[#00ff88]">R${projectedValue.toFixed(3)}</p>
        </div>
      </div>

      {/* Bottom labels */}
      <div className="flex justify-between items-end text-sm mt-8">
        <span className="text-[#f2474a] flex items-center gap-1">
          R$0
          <Image src="/assets/ARROWDOWN.svg" alt="Down" width={12} height={12} />
        </span>
        <span className="text-white">Conservador</span>
        <span className="text-[#00ff88] flex items-center gap-1">
          R$261
          <Image src="/assets/arrow-up.svg" alt="Up" width={12} height={12} />
        </span>
      </div>

      <Button
        onClick={() => router.push("/operacoes")}
        variant="outline"
        className="w-full bg-transparent border border-[rgba(174,171,216,0.53)] text-[#aeabd8] rounded-[10px] py-2 text-sm hover:bg-[#27264e]/50 mt-4"
      >
        Visualizar operações
      </Button>
    </Card>
  )
}
