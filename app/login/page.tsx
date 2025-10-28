"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "criar">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    api_token: "",
    senha: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { signIn, signUp, signOut } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError("Email ou senha incorretos")
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      // Fazer logout primeiro para garantir que não há sessão ativa interferindo
      console.log('🚪 Fazendo logout antes do cadastro para evitar interferência')
      await signOut()
      
      // Usar a senha definida pelo usuário
      const userPassword = formData.senha || "senha123" // Senha padrão fixa para evitar problemas de hidratação
      
      console.log('📝 Dados do formulário de cadastro:', formData)
      console.log('🔑 API Token no formulário:', formData.api_token)
      
      const { error } = await signUp(formData.email, userPassword, {
        nome: "Usuário", // Nome padrão
        sobrenome: "Usuário", // Sobrenome padrão
        cpf: "000.000.000-00", // CPF padrão
        telefone: "(00) 00000-0000", // Telefone padrão
        nascimento: "1990-01-01", // Data padrão
        api_token: formData.api_token || undefined,
      })
      
      // Sempre desativar loading após tentativa de cadastro
      setLoading(false)
      
      if (error) {
        setError("Erro ao criar conta: " + error.message)
      } else {
        setSuccess("Conta criada com sucesso! Verifique seu email para confirmar a conta.")
        
        // Limpar formulário
        const emailCadastro = formData.email // Guardar email antes de limpar
        setFormData({
          email: "",
          api_token: "",
          senha: "",
        })
        // Redirecionar para a aba de login após 2 segundos
        setTimeout(() => {
          setActiveTab("login")
          setEmail(emailCadastro) // Preencher o email automaticamente
        }, 2000)
      }
    } catch (err) {
      setError("Erro ao criar conta")
      setLoading(false) // Garantir que o loading seja desativado em caso de erro
    }
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
                disabled={loading}
                className="w-full py-3 bg-[#845BF6] text-white font-semibold rounded-lg hover:bg-[#6a3fd9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Entrando..." : "Acessar"}
              </button>
              <a href="#" className="block text-center text-sm text-[#7C8198] hover:underline mt-4">
                Esqueci a senha
              </a>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Create Account Form */}
          {activeTab === "criar" && (
            <form onSubmit={handleCreateAccount} className="space-y-5">
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
                <label htmlFor="senha-cadastro" className="block text-sm text-[#AEABD8] mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  id="senha-cadastro"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Digite sua senha"
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                  required
                />
              </div>
              <div>
                <label htmlFor="api_token" className="block text-sm text-[#AEABD8] mb-1">
                  API Token (Opcional)
                </label>
                <input
                  type="text"
                  id="api_token"
                  value={formData.api_token}
                  onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                  placeholder="Seu API token para integração"
                  className="w-full px-3 py-3 bg-[#141332] border border-[#2E2D55] rounded-lg text-white placeholder:text-[#7C8198] focus:outline-none focus:border-[#845BF6]"
                />
                <p className="text-xs text-[#7C8198] mt-1">
                  Token para integração com APIs externas (ex: Binance, Coinbase)
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#845BF6] text-white font-semibold rounded-lg hover:bg-[#6a3fd9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Criando conta..." : "Criar Conta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
