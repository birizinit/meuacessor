"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"

interface TopOperationsCardProps {
  dateRange: { start: string; end: string }
}

const operations = [
  {
    rank: 1,
    rankImage: "/assets/rank1.png",
    pair: "BTC/ETH",
    // Usa um único ícone completo do BTC + o ícone do par para evitar duplicações
    icons: ["/assets/btclogo.svg", "/assets/ETC.svg"],
    entries: 50,
    investment: 10000,
    profit: 20000,
  },
  {
    rank: 2,
    rankImage: "/assets/rank2.png",
    pair: "BNB/BTC",
    icons: ["/assets/BNBBTC.svg"],
    entries: 40,
    investment: 5000,
    profit: 10000,
  },
  {
    rank: 3,
    rankImage: "/assets/rank3.png",
    pair: "BTC/ECA",
    icons: ["/assets/BTCECA.svg"],
    entries: 20,
    investment: 2000,
    profit: 5000,
  },
  {
    rank: 4,
    rankImage: null,
    pair: "BTC/ECA",
    icons: ["/assets/BTCECA.svg"],
    entries: 20,
    investment: 2000,
    profit: 5000,
  },
]

export function TopOperationsCard({ dateRange }: TopOperationsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6 h-full">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
        <h4 className="text-lg font-semibold text-white">Top operações</h4>
        <p className="text-base text-[#8c89b4]">
          {dateRange.start.split("/")[0]} de ago. - {dateRange.end.split("/")[0]} de ago
        </p>
      </div>
      <div className="flex flex-col gap-px bg-[rgba(174,171,216,0.1)] py-px">
        <div className="grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr] items-center px-2.5 py-2.5 bg-[#1d1d41] text-[#aeabd8] text-xs">
          <span>Rank</span>
          <span>Moedas</span>
          <span>Entradas</span>
          <span>Aportes</span>
          <span>Lucro</span>
        </div>
        {operations.map((op) => (
          <div
            key={op.rank}
            className="grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr] items-center px-2.5 py-4 bg-[#1d1d41] text-sm text-white"
          >
            <span className="text-center font-bold text-[15px]">
              {op.rankImage ? (
                <Image
                  src={op.rankImage || "/placeholder.svg"}
                  alt={`Rank ${op.rank}`}
                  width={34}
                  height={34}
                  className="mx-auto"
                />
              ) : (
                op.rank
              )}
            </span>
            <div className="flex items-center gap-2.5 pl-2.5">
              <div className="relative w-16 h-9">
                {op.icons.map((icon, idx) => (
                  <Image
                    key={`${op.pair}-icon-${idx}`}
                    src={icon || "/placeholder.svg"}
                    alt=""
                    width={37}
                    height={37}
                    className="absolute"
                    style={{ left: `${idx * 8}px` }}
                  />
                ))}
              </div>
              <span>{op.pair}</span>
            </div>
            <span className="pl-2.5">{op.entries}</span>
            <span className="pl-2.5">{formatCurrency(op.investment)}</span>
            <span className="text-[#16c784] flex items-center gap-1 pl-2.5">
              {formatCurrency(op.profit)}
              <Image src="/assets/arrow-up.svg" alt="Up" width={12} height={12} />
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
