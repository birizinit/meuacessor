"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

export default function PerfilPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    if (authStatus !== "true") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141332] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141332]">
      <Header />
      <main className="pb-12">
        <div className="container mx-auto px-4 md:px-10 lg:px-[124px] max-w-[1920px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Perfil</h3>
                <div className="flex items-center gap-4">
                  <Image src="/assets/Ellipse.svg" alt="Avatar" width={64} height={64} className="rounded-full" />
                  <div className="text-white">
                    <div className="font-semibold">Pedro Fonseca</div>
                    <div className="text-[#aeabd8] text-sm">Conservador</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
                <div className="text-white font-medium mb-1">Torne-se um operador moderado</div>
                <div className="text-[#aeabd8] text-xs mb-3">Continue operando pelo menos 3% da sua banca</div>
                <div className="bg-[#27264e] rounded-lg p-3">
                  <Progress value={60} className="h-2 bg-[#2a2959]" />
                </div>
              </div>

              <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
                <div className="text-white font-medium mb-1">Torne-se um operador arrojado</div>
                <div className="text-[#aeabd8] text-xs mb-3">Continue operando pelo menos 5% da sua banca</div>
                <div className="bg-[#27264e] rounded-lg p-3">
                  <Progress value={0} className="h-2 bg-[#2a2959]" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
              <h3 className="text-white font-semibold mb-6">Dados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#aeabd8] text-sm">E-mail</label>
                  <Input placeholder="Digite" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Senha</label>
                  <Input placeholder="Digite" type="password" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Nome</label>
                  <Input placeholder="Digite" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Sobrenome</label>
                  <Input placeholder="Digite" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Apelido</label>
                  <Input placeholder="Digite" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">CPF</label>
                  <Input placeholder="0" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">País</label>
                  <Select defaultValue="" >
                    <SelectTrigger className="mt-1 bg-[#141332] border-[#2a2959] text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d1d41] text-white border-[#2a2959]">
                      <SelectItem value="br">Brasil</SelectItem>
                      <SelectItem value="us">Estados Unidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Cidade</label>
                  <Input placeholder="Digite" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Sexo</label>
                  <Select defaultValue="" >
                    <SelectTrigger className="mt-1 bg-[#141332] border-[#2a2959] text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d1d41] text-white border-[#2a2959]">
                      <SelectItem value="m">Masculino</SelectItem>
                      <SelectItem value="f">Feminino</SelectItem>
                      <SelectItem value="o">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Telefone</label>
                  <Input placeholder="(00) 0000-0000" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Data de nascimento</label>
                  <Input placeholder="00/00/0000" className="mt-1 bg-[#141332] border-[#2a2959] text-white" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm">Idioma do sistema</label>
                  <Select defaultValue="pt-br" >
                    <SelectTrigger className="mt-1 bg-[#141332] border-[#2a2959] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d1d41] text-white border-[#2a2959]">
                      <SelectItem value="pt-br">Português - BR</SelectItem>
                      <SelectItem value="en-us">English - US</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
