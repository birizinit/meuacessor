"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/header"
import { Clock, BookOpen, Video, Users, Star } from "lucide-react"

export default function TutoriaisPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141332] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#141332] flex items-center justify-center">
        <div className="text-white">Redirecionando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141332]">
      <Header />
      <main className="pb-12">
        <div className="container mx-auto px-4 md:px-10 lg:px-[124px] max-w-[1920px]">
          {/* Hero Section */}
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full mb-8">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Centro de Tutoriais
            </h1>
            
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-lg blur opacity-75"></div>
              <div className="relative bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-lg px-8 py-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#7c3aed]" />
                  <span className="text-2xl font-semibold text-white">Em Breve...</span>
                </div>
              </div>
            </div>
            
            <p className="text-[#aeabd8] text-lg mt-6 max-w-2xl mx-auto">
              Estamos preparando uma biblioteca completa de tutoriais para ajudar você a dominar 
              todas as funcionalidades da plataforma.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-[#7c3aed]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Vídeos Tutoriais</h3>
              <p className="text-[#aeabd8] text-sm">
                Aprenda com vídeos passo a passo sobre como usar cada funcionalidade
              </p>
            </div>

            <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-[#7c3aed]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Guias Detalhados</h3>
              <p className="text-[#aeabd8] text-sm">
                Documentação completa com exemplos práticos e dicas profissionais
              </p>
            </div>

            <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#7c3aed]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Suporte Especializado</h3>
              <p className="text-[#aeabd8] text-sm">
                Equipe de especialistas pronta para ajudar com suas dúvidas
              </p>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="mt-16 bg-gradient-to-r from-[#7c3aed]/10 to-[#a855f7]/10 border border-[rgba(174,171,216,0.25)] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              O que você pode esperar
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                  <span className="text-[#aeabd8]">Tutoriais de configuração inicial</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                  <span className="text-[#aeabd8]">Como fazer operações básicas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                  <span className="text-[#aeabd8]">Estratégias avançadas de investimento</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                  <span className="text-[#aeabd8]">Análise de mercado e tendências</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                  <span className="text-[#aeabd8]">Gestão de portfólio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                  <span className="text-[#aeabd8]">Configuração de alertas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                  <span className="text-[#aeabd8]">Relatórios e análises</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                  <span className="text-[#aeabd8]">Integração com APIs externas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 bg-[#7c3aed]/20 text-[#7c3aed] px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              <span>Seja notificado quando estiver disponível</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}