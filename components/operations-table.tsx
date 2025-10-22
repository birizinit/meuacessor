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

// Helper types to map broker API trades into our Operation model
type BrokerTrade = {
  id?: string | number
  pair?: string
  symbol?: string
  base?: string
  quote?: string
  executedAt?: string | number | Date
  timestamp?: string | number | Date
  date?: string
  time?: string
  investmentBRL?: number
  amountBRL?: number
  amount?: number
  aport?: number
  resultBRL?: number
  profitBRL?: number
  pnlBRL?: number
  pnl?: number
  profit?: number
  entryValueBRL?: number
  exitValueBRL?: number
  [key: string]: unknown
}

type FilterType = "all" | "positive" | "negative"

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0")
}

function formatDateTimeFromAny(input: string | number | Date | undefined): { date: string; time: string } {
  if (!input) return { date: "--/--/----", time: "--:--:--" }
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return { date: "--/--/----", time: "--:--:--" }
  const day = pad2(d.getDate())
  const month = pad2(d.getMonth() + 1)
  const year = d.getFullYear()
  const hours = pad2(d.getHours())
  const minutes = pad2(d.getMinutes())
  const seconds = pad2(d.getSeconds())
  return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}:${seconds}` }
}

function normalizePair(trade: BrokerTrade): string {
  if (typeof trade.pair === "string" && trade.pair.trim()) return trade.pair
  if (typeof trade.symbol === "string" && trade.symbol.trim()) {
    const s = trade.symbol.replace(/[^A-Za-z]/g, "").toUpperCase()
    // Try to split a merged symbol like BTCUSDT into BTC/USDT heuristically
    const known = ["BTC", "ETH", "BNB", "USDT", "USDC", "ADA", "SOL", "DOT", "XRP", "ECA", "ETC"]
    for (const base of known) {
      if (s.startsWith(base)) {
        const quote = s.slice(base.length)
        if (quote) return `${base}/${quote}`
      }
    }
    return s
  }
  if (trade.base && trade.quote) return `${String(trade.base).toUpperCase()}/${String(trade.quote).toUpperCase()}`
  return "-"
}

function getIconForPair(pair: string): string | undefined {
  const p = pair.toUpperCase()
  // Combined icons first
  if (p.includes("BNB") && p.includes("BTC")) return "/assets/BNBBTC.svg"
  if (p.includes("BTC") && p.includes("ECA")) return "/assets/BTCECA.svg"
  // Single asset icons as fallback
  if (p.includes("BTC")) return "/assets/btclogo.svg"
  if (p.includes("ETH")) return "/assets/ETC.svg" // closest available
  return undefined
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function mapTradeToOperation(trade: BrokerTrade): Operation {
  const pair = normalizePair(trade)
  const id = String(trade.id ?? `${pair}-${String(trade.timestamp ?? trade.executedAt ?? trade.date ?? Math.random()).slice(0, 16)}`)

  const { date, time } = formatDateTimeFromAny(trade.executedAt ?? trade.timestamp ?? trade.date)

  const contribution =
    toNumber(trade.investmentBRL) ??
    toNumber(trade.amountBRL) ??
    toNumber(trade.aport) ??
    toNumber(trade.amount) ??
    toNumber(trade.entryValueBRL) ??
    0

  const explicitResult =
    toNumber(trade.resultBRL) ??
    toNumber(trade.profitBRL) ??
    toNumber(trade.pnlBRL) ??
    toNumber(trade.pnl) ??
    toNumber(trade.profit)

  let result = explicitResult
  if (result === undefined) {
    const exitV = toNumber(trade.exitValueBRL)
    const entryV = toNumber(trade.entryValueBRL)
    if (exitV !== undefined && entryV !== undefined) result = exitV - entryV
  }
  if (result === undefined) result = 0

  return {
    id,
    pair,
    date,
    time,
    contributionBRL: contribution,
    resultBRL: result,
    icon: getIconForPair(pair),
  }
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
  const [operations, setOperations] = useState<Operation[]>([])
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [serverTotalPages, setServerTotalPages] = useState<number | null>(null)

  const filteredOperations = useMemo(() => {
    if (filter === "positive") return operations.filter((o) => o.resultBRL > 0)
    if (filter === "negative") return operations.filter((o) => o.resultBRL < 0)
    return operations
  }, [filter, operations])

  // When using server-side pagination, use server-provided totalPages when present.
  // Otherwise, infer minimally: if we received a full page, allow navigating to next.
  const inferredTotalPages = serverTotalPages ?? (operations.length === pageSize ? currentPage + 1 : currentPage)
  const totalPages = Math.max(1, inferredTotalPages)

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedOperations = filteredOperations

  // Fetch broker trades whenever token/page/pageSize changes
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("brokerApiToken") : null
    if (!token) {
      setErrorMessage("Token da corretora não configurado. Salve-o em Perfil.")
      setOperations([])
      setServerTotalPages(1)
      return
    }
    const controller = new AbortController()
    const load = async () => {
      try {
        setIsLoading(true)
        setErrorMessage("")
        const timestamp = Date.now().toString()
        const url = `https://broker-api.mybroker.dev/token/trades?page=${currentPage}&pageSize=${pageSize}`
        const res = await fetch(url, {
          headers: {
            "api-token": token,
            "x-timestamp": timestamp,
          },
          signal: controller.signal,
        })
        if (!res.ok) {
          const text = await res.text().catch(() => "")
          throw new Error(text || `Erro ${res.status}`)
        }
        const json: unknown = await res.json()
        const root: any = json as any
        const list: BrokerTrade[] = Array.isArray(root)
          ? (root as BrokerTrade[])
          : (root?.data ?? root?.items ?? root?.trades ?? [])
        const mapped = list.map(mapTradeToOperation)
        setOperations(mapped)

        const totalPagesFromApi: number | undefined =
          root?.totalPages ?? root?.meta?.totalPages ?? (root?.total ?? root?.totalCount ? Math.ceil((root?.total ?? root?.totalCount) / pageSize) : undefined)
        setServerTotalPages(totalPagesFromApi ?? null)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Falha ao carregar operações"
        setErrorMessage(msg)
        setOperations([])
        setServerTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [currentPage, pageSize])

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
            {isLoading && (
              <TableRow className="border-[#2a2959]">
                <TableCell colSpan={5} className="text-center text-white">Carregando operações...</TableCell>
              </TableRow>
            )}
            {!isLoading && errorMessage && (
              <TableRow className="border-[#2a2959]">
                <TableCell colSpan={5} className="text-center text-rose-300">{errorMessage}</TableCell>
              </TableRow>
            )}
            {!isLoading && !errorMessage && paginatedOperations.length === 0 && (
              <TableRow className="border-[#2a2959]">
                <TableCell colSpan={5} className="text-center text-white">Nenhuma operação encontrada</TableCell>
              </TableRow>
            )}
            {!isLoading && !errorMessage && paginatedOperations.map((op) => {
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
