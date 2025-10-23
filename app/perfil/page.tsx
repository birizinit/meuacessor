"use client"

import type React from "react"

import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export default function PerfilPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profileImage, setProfileImage] = useState("/assets/Ellipse.svg")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [apiToken, setApiToken] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    if (authStatus !== "true") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }

    const savedImage = localStorage.getItem("profileImage")
    if (savedImage) {
      setProfileImage(savedImage)
    }
  }, [router])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        setProfileImage(imageUrl)
        localStorage.setItem("profileImage", imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConnect = () => {
    if (apiToken.trim()) {
      localStorage.setItem("apiToken", apiToken)
      setShowSuccessModal(true)
    }
  }

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
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6">Perfil</h3>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Image
                      src={profileImage || "/placeholder.svg"}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-6 h-6 bg-[#7c3aed] rounded-full flex items-center justify-center hover:bg-[#6d28d9] transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="text-white font-semibold text-lg">Pedro Fonseca</div>
                  <div className="text-[#aeabd8] text-sm">Conservador</div>
                </div>
              </div>

              {/* Progress Card 1 */}
              <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
                <div className="text-white font-medium mb-2">Torne-se um operador moderado</div>
                <div className="text-[#aeabd8] text-xs mb-4">Continue operando pelo menos 3% da sua banca</div>
                <div className="relative w-full h-2 bg-[#27264e] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full"
                    style={{ width: "44%" }}
                  />
                </div>
                <p className="text-[#7c3aed] text-sm font-semibold mt-2">44%</p>
              </div>

              {/* Progress Card 2 */}
              <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
                <div className="text-white font-medium mb-2">Torne-se um operador arrojado</div>
                <div className="text-[#aeabd8] text-xs mb-4">Continue operando pelo menos 5% da sua banca</div>
                <div className="relative w-full h-2 bg-[#27264e] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full"
                    style={{ width: "6%" }}
                  />
                </div>
                <p className="text-[#7c3aed] text-sm font-semibold mt-2">6%</p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
              <h3 className="text-white font-semibold mb-6">Dados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">E-mail</label>
                  <Input placeholder="Digite" className="bg-[#141332] border-[#2a2959] text-white h-11" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">Senha</label>
                  <Input
                    placeholder="Digite"
                    type="password"
                    className="bg-[#141332] border-[#2a2959] text-white h-11"
                  />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">Nome</label>
                  <Input placeholder="Digite" className="bg-[#141332] border-[#2a2959] text-white h-11" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">Sobrenome</label>
                  <Input placeholder="Digite" className="bg-[#141332] border-[#2a2959] text-white h-11" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">Apelido</label>
                  <Input placeholder="Digite" className="bg-[#141332] border-[#2a2959] text-white h-11" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">CPF</label>
                  <Input placeholder="0" className="bg-[#141332] border-[#2a2959] text-white h-11" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">País</label>
                  <Select defaultValue="">
                    <SelectTrigger className="bg-[#141332] border-[#2a2959] text-white h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d1d41] text-white border-[#2a2959]">
                      <SelectItem value="br">Brasil</SelectItem>
                      <SelectItem value="us">Estados Unidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">Cidade</label>
                  <Input placeholder="Digite" className="bg-[#141332] border-[#2a2959] text-white h-11" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">Telefone</label>
                  <Input placeholder="(00) 0000-0000" className="bg-[#141332] border-[#2a2959] text-white h-11" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">Sexo</label>
                  <Select defaultValue="">
                    <SelectTrigger className="bg-[#141332] border-[#2a2959] text-white h-11">
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
                  <label className="text-[#aeabd8] text-sm block mb-2">Data de nascimento</label>
                  <Input placeholder="00/00/0000" className="bg-[#141332] border-[#2a2959] text-white h-11" />
                </div>
                <div>
                  <label className="text-[#aeabd8] text-sm block mb-2">Idioma do sistema</label>
                  <Select value="pt-br" disabled>
                    <SelectTrigger className="bg-[#141332] border-[#2a2959] text-white h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d1d41] text-white border-[#2a2959]">
                      <SelectItem value="pt-br">Português - BR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[#aeabd8] text-sm block mb-2">API Token</label>
                  <Input
                    placeholder="Digite seu token da API"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="bg-[#141332] border-[#2a2959] text-white h-11"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleConnect}
                    className="w-full h-11 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium"
                  >
                    Conectar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] max-w-sm p-8">
          <DialogTitle className="sr-only">Conta vinculada com sucesso</DialogTitle>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-white text-xl font-semibold">Conta vinculada!</h3>
            <p className="text-[#aeabd8] text-sm">
              Sua conta foi vinculada com sucesso. Agora você pode utilizar a API para sincronizar suas operações.
            </p>
            <div className="flex gap-3 w-full pt-2">
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 h-11 bg-transparent border border-[#2a2959] hover:bg-[#2a2959] text-white"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
