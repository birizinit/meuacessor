"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type RiskProfile = "conservative" | "moderate" | "aggressive"

export function CalculatorCard() {
  const [bankValue, setBankValue] = useState(5000)
  const [selectedRisk, setSelectedRisk] = useState<RiskProfile>("conservative")
  const [projectionPeriod, setProjectionPeriod] = useState<"day" | "month">("day")

  const riskProfiles = {
    conservative: { percent: 1, name: "Conservador", icon: "/assets/porco.png" },
    moderate: { percent: 3, name: "Moderado", icon: "/assets/equilibrado.png" },
    aggressive: { percent: 5, name: "Arrojado", icon: "/assets/foguet.png" },
  }

  const calculateInvestment = () => {
    return (bankValue * riskProfiles[selectedRisk].percent) / 100
  }

  const calculateProjection = () => {
    const investment = calculateInvestment()
    const dailyReturn = investment * 0.87 * 0.6 // 87% assertividade, ~60% retorno médio
    return projectionPeriod === "day" ? dailyReturn : dailyReturn * 22 // 22 dias úteis
  }

  const handleClear = () => {
    setBankValue(5000)
    setSelectedRisk("conservative")
    setProjectionPeriod("day")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-4 flex flex-col gap-3">
      <h4 className="text-base font-bold text-white">Calculadora de projeção</h4>

      <div>
        <label className="block text-xs text-[#aeabd8] mb-1.5">Qual valor da sua banca?</label>
        <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[10px] px-2 py-1.5">
          <span className="text-[#aeabd8] mr-1.5">R$</span>
          <input
            type="text"
            value={formatCurrency(bankValue)}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "")
              setBankValue(Number.parseInt(value) || 0)
            }}
            className="bg-transparent border-none text-white text-base font-bold w-full outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="bg-[rgba(2,177,90,0.15)] text-[#16c784] text-xs px-2 py-0.5 rounded-[50px]">87%</span>
        <p className="text-xs text-[#aeabd8] leading-tight">
          de assertividade e<br />
          payout em média
        </p>
      </div>

      <div>
        <label className="block text-sm text-[#aeabd8] mb-2">Qual valor que gostaria de aportar da sua banca?</label>
        <div className="flex flex-col md:flex-row gap-1.5">
          {(Object.keys(riskProfiles) as RiskProfile[]).map((risk) => {
            const profile = riskProfiles[risk]
            const investment = (bankValue * profile.percent) / 100
            return (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`flex-1 border rounded-[10px] p-2 text-center cursor-pointer transition-all ${
                  selectedRisk === risk
                    ? "border-[#845bf6] shadow-[0px_0px_6.5px_0px_#845bf6] bg-[#27264e]"
                    : "border-[rgba(174,171,216,0.53)] hover:border-[#845bf6]/50"
                }`}
              >
                <Image
                  src={profile.icon || "/placeholder.svg"}
                  alt={profile.name}
                  width={32}
                  height={32}
                  className="mx-auto mb-2"
                />
                <p className="text-[22px] font-semibold text-white mb-1">{profile.percent}%</p>
                <p className="text-xs text-[#aeabd8] mb-1">R${formatCurrency(investment)}</p>
                <p className="text-xs font-bold text-white">{profile.name}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#aeabd8] mb-1">Resultado da projeção</label>
        <div className="flex justify-between items-center">
          <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[50px] p-1">
            <Button
              variant="ghost"
              onClick={() => setProjectionPeriod("day")}
              className={`rounded-[50px] px-3 py-1.5 text-sm ${
                projectionPeriod === "day" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
              }`}
            >
              Dia
            </Button>
            <Button
              variant="ghost"
              onClick={() => setProjectionPeriod("month")}
              className={`rounded-[50px] px-3 py-1.5 text-sm ${
                projectionPeriod === "month" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
              }`}
            >
              Mês
            </Button>
          </div>
          <p className="text-[22px] font-semibold text-[#16c784] flex items-center gap-2">
            R$ {formatCurrency(calculateProjection())}
            <Image src="/assets/setacima.svg" alt="Up" width={16} height={16} />
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <Button className="flex-1 bg-[#27264e] text-white border-none rounded-[10px] py-1.5 text-sm font-medium hover:bg-[#2f2e5a]">
          Salvar
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="flex-1 bg-transparent text-[#aeabd8] border border-[rgba(174,171,216,0.53)] rounded-[10px] py-1.5 text-sm hover:bg-[#27264e]/50"
        >
          Limpar
        </Button>
      </div>
    </Card>
  )
}
