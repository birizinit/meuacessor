"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"

interface TopOperationsCardProps {
  dateRange: { start: string; end: string }
}

const traders = [
  {
    rank: 1,
    name: "Carlos Alberto",
    investment: 122158.2,
    profit: 879230.05,
    avatar: "/assets/trader-avatar-1.jpg",
  },
  {
    rank: 2,
    name: "Alan Victor",
    investment: 898080.32,
    profit: 565230.09,
    avatar: "/assets/trader-avatar-2.jpg",
  },
  {
    rank: 3,
    name: "Rosana Lima",
    investment: 989250.08,
    profit: 889230.25,
    avatar: "/assets/trader-avatar-3.jpg",
  },
  {
    rank: 4,
    name: "Maria Souza",
    investment: 985240.07,
    profit: 848300.18,
    avatar: "/assets/trader-avatar-4.jpg",
  },
]

export function TopOperationsCard({ dateRange }: TopOperationsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getRankImage = (rank: number) => {
    if (rank <= 3) {
      return `/assets/rank${rank}.png`
    }
    return null
  }

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
        <h4 className="text-lg font-semibold text-white">Top Traders</h4>
        <p className="text-base text-[#8c89b4]">
          {dateRange.start.split("/")[0]} de ago. - {dateRange.end.split("/")[0]} de ago
        </p>
      </div>
      <div className="flex flex-col gap-px bg-[rgba(174,171,216,0.1)] py-px">
        <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr] items-center px-2.5 py-2.5 bg-[#1d1d41] text-[#aeabd8] text-xs">
          <span>Rank</span>
          <span>Nome</span>
          <span>Aporte</span>
          <span>Lucro</span>
        </div>
        {traders.map((trader) => (
          <div
            key={trader.rank}
            className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr] items-center px-2.5 py-4 bg-[#1d1d41] text-sm text-white"
          >
            <span className="flex justify-center">
              {getRankImage(trader.rank) ? (
                <Image
                  src={getRankImage(trader.rank)! || "/placeholder.svg"}
                  alt={`Rank ${trader.rank}`}
                  width={34}
                  height={34}
                />
              ) : (
                <span className="font-bold text-[15px]">{trader.rank}</span>
              )}
            </span>
            <div className="flex items-center gap-2.5 pl-2.5">
              <img
                src={trader.avatar || "/placeholder.svg"}
                alt={trader.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span>{trader.name}</span>
            </div>
            <span className="pl-2.5">{formatCurrency(trader.investment)}</span>
            <span className="text-[#16c784] flex items-center gap-1 pl-2.5">
              {formatCurrency(trader.profit)}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 2L6 10M6 2L2 6M6 2L10 6"
                  stroke="#16c784"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
