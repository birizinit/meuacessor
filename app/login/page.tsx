"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "criar">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    cpf: "",
    telefone: "",
    nascimento: "",
  })
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login - in production, validate credentials
    if (email && password) {
      localStorage.setItem("isAuthenticated", "true")
      router.push("/")
    }
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate account creation
    if (formData.nome && formData.email) {
      localStorage.setItem("isAuthenticated", "true")
      router.push("/")
    }
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  return (
    <div className="min-h-screen bg-[#0E0C28] flex items-center justify-center p-5 relative overflow-auto">
      <div
        className="fixed inset-0 opacity-50 z-0"
        style={{
          backgroundImage: "url(/assets/wave-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(11px)",
        }}
      />

      <div className="w-full max-w-md z-10 my-10">
        <div className="bg-[#1D1D41] rounded-2xl p-10 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Image src="/assets/logo.png" alt="Meu Assessor" width={150} height={45} className="w-[150px]" />
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`px-4 py-2 text-base font-bold transition-all border-b-2 ${
                activeTab === "login" ? "text-[#845BF6] border-[#845BF6]" : "text-[#AEABD8] border-transparent"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("criar")}
              className={`px-4 py-2 text-base font-bold transition-all border-b-2 ${
                activeTab === "criar" ? "text-[#845BF6] border-[#845BF6]" : "text-[#AEABD8] border-transparent"
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm text-[#AEABD8] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e-mail"
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm text-[#AEABD8] mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#845BF6] text-white font-semibold rounded-lg hover:bg-[#6a3fd9] transition-colors"
              >
                Acessar
              </button>
              <a href="#" className="block text-center text-sm text-[#7C8198] hover:underline mt-4">
                Esqueci a senha
              </a>
            </form>
          )}

          {/* Create Account Form */}
          {activeTab === "criar" && (
            <form onSubmit={handleCreateAccount} className="space-y-5">
              <div>
                <label htmlFor="nome" className="block text-sm text-[#AEABD8] mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <div>
                <label htmlFor="sobrenome" className="block text-sm text-[#AEABD8] mb-1">
                  Sobrenome
                </label>
                <input
                  type="text"
                  id="sobrenome"
                  value={formData.sobrenome}
                  onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                  placeholder="Seu sobrenome"
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <div>
                <label htmlFor="email-cadastro" className="block text-sm text-[#AEABD8] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email-cadastro"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Seu email"
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <div>
                <label htmlFor="cpf" className="block text-sm text-[#AEABD8] mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm text-[#AEABD8] mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <div>
                <label htmlFor="nascimento" className="block text-sm text-[#AEABD8] mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="nascimento"
                  value={formData.nascimento}
                  onChange={(e) => setFormData({ ...formData, nascimento: e.target.value })}
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#845BF6] text-white font-semibold rounded-lg hover:bg-[#6a3fd9] transition-colors"
              >
                Criar Conta
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
