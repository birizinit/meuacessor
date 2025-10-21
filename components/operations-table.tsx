"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type Operation = {
  id: string
  pair: string
  date: string // dd/MM/yyyy
  time: string // HH:mm:ss
  contributionBRL: number
  resultBRL: number // positive for profit, negative for loss
  icon?: string
}

const INITIAL_OPERATIONS: Operation[] = [
  {
    id: "1",
    pair: "BTC/ETH",
    date: "15/08/2025",
    time: "11:48:00",
    contributionBRL: 10000,
    resultBRL: 20000,
    icon: "/assets/BTCECA.svg", // fallback icon
  },
  {
    id: "2",
    pair: "BNB/BTC",
    date: "13/08/2025",
    time: "13:40:00",
    contributionBRL: 5000,
    resultBRL: 10000,
    icon: "/assets/BNBBTC.svg",
  },
  {
    id: "3",
    pair: "BTC/ECA",
    date: "08/08/2025",
    time: "12:28:08",
    contributionBRL: 2000,
    resultBRL: -5000,
    icon: "/assets/BTCECA.svg",
  },
  {
    id: "4",
    pair: "BTC/ECA",
    date: "05/08/2025",
    time: "01:25:05",
    contributionBRL: 2000,
    resultBRL: 5000,
    icon: "/assets/BTCECA.svg",
  },
  {
    id: "5",
    pair: "Bitcoin",
    date: "03/08/2025",
    time: "12:28:08",
    contributionBRL: 2000,
    resultBRL: -3000,
    icon: "/assets/btcb.svg",
  },
  {
    id: "6",
    pair: "Ethereum",
    date: "01/08/2025",
    time: "01:25:05",
    contributionBRL: 2000,
    resultBRL: 5000,
    icon: "/assets/ETC.svg",
  },
]

type FilterType = "all" | "positive" | "negative"

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function toCsv(operations: Operation[]): string {
  const header = ["Moedas", "Data", "Hora", "Aporte", "Resultado"]
  const rows = operations.map((op) => [
    op.pair,
    op.date,
    op.time,
    formatBRL(op.contributionBRL),
    formatBRL(op.resultBRL),
  ])
  return [header, ...rows].map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(";"))
    .join("\n")
}

export function OperationsTable() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [operations] = useState<Operation[]>(INITIAL_OPERATIONS)
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const filteredOperations = useMemo(() => {
    if (filter === "positive") return operations.filter((o) => o.resultBRL > 0)
    if (filter === "negative") return operations.filter((o) => o.resultBRL < 0)
    return operations
  }, [filter, operations])

  const totalItems = filteredOperations.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    // Garante que a página atual sempre esteja dentro do range válido
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedOperations = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredOperations.slice(start, start + pageSize)
  }, [filteredOperations, currentPage, pageSize])

  function getPageItems(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total]
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "...", current - 1, current, current + 1, "...", total]
  }

  const handleExport = () => {
    const csv = toCsv(filteredOperations)
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "operacoes.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="mt-4">
      <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-white">
            <h4 className="text-lg font-semibold">Operações</h4>
            <div className="flex items-center gap-2 bg-[#27264e] rounded-full p-1 border border-[rgba(174,171,216,0.25)]">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFilter("all")}
                className={`rounded-full px-3 py-1 text-xs ${filter === "all" ? "bg-[#845bf6] text-white" : "text-[#aeabd8] hover:bg-[#845bf6]/20"}`}
              >
                Todas
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFilter("positive")}
                className={`rounded-full px-3 py-1 text-xs ${filter === "positive" ? "bg-[#845bf6] text-white" : "text-[#aeabd8] hover:bg-[#845bf6]/20"}`}
              >
                + Lucrativas
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFilter("negative")}
                className={`rounded-full px-3 py-1 text-xs ${filter === "negative" ? "bg-[#845bf6] text-white" : "text-[#aeabd8] hover:bg-[#845bf6]/20"}`}
              >
                - Lucrativas
              </Button>
            </div>
          </div>
          <Button onClick={handleExport} className="bg-[#27264e] text-white border border-[rgba(174,171,216,0.35)] hover:bg-[#2f2e5a]">
            Exportar lista
          </Button>
        </div>

        <Table className="text-[#aeabd8]">
          <TableHeader>
            <TableRow className="border-[#2a2959]">
              <TableHead className="text-[#aeabd8]">Moedas</TableHead>
              <TableHead className="text-[#aeabd8]">Data</TableHead>
              <TableHead className="text-[#aeabd8]">Hora</TableHead>
              <TableHead className="text-[#aeabd8]">Aporte</TableHead>
              <TableHead className="text-[#aeabd8]">Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOperations.map((op) => {
              const isPositive = op.resultBRL >= 0
              return (
                <TableRow key={op.id} className="border-[#2a2959]">
                  <TableCell>
                    <div className="flex items-center gap-2 text-white">
                      {op.icon ? (
                        <Image src={op.icon} alt={op.pair} width={20} height={20} />
                      ) : null}
                      <span className="text-white">{op.pair}</span>
                    </div>
                  </TableCell>
                  <TableCell>{op.date}</TableCell>
                  <TableCell>{op.time}</TableCell>
                  <TableCell>{formatBRL(op.contributionBRL)}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      <Image
                        src={isPositive ? "/assets/arrow-up.svg" : "/assets/ARROWDOWN.svg"}
                        alt={isPositive ? "Aumento" : "Queda"}
                        width={12}
                        height={12}
                      />
                      <span>{formatBRL(Math.abs(op.resultBRL))}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-4">
          <div className="flex items-center gap-2 text-[#aeabd8]">
            <span className="text-sm">Itens por página</span>
            <Select
              defaultValue={String(pageSize)}
              onValueChange={(v) => {
                const newSize = parseInt(v, 10)
                setPageSize(newSize)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger size="sm" className="min-w-[88px] bg-[#27264e] text-white border border-[rgba(174,171,216,0.35)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1d1d41] text-white border border-[rgba(174,171,216,0.35)]">
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  href="#"
                />
              </PaginationItem>
              {getPageItems(currentPage, totalPages).map((p, idx) => (
                <PaginationItem key={`${p}-${idx}`}>
                  {p === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={p === currentPage}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(Number(p))
                      }}
                    >
                      {p}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  href="#"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </section>
  )
}
