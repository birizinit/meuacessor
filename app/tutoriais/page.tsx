"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

export default function TutoriaisPage() {
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
          <div className="bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6 md:p-10">
            <Empty className="border border-[rgba(174,171,216,0.25)] bg-[#141332]/40 py-12">
              <EmptyHeader>
                <EmptyTitle className="text-white text-xl">Tutoriais</EmptyTitle>
                <EmptyDescription>
                  <span className="text-[#aeabd8]">Em breve você encontrará aqui conteúdos e vídeos para aprimorar suas operações.</span>
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </div>
      </main>
    </div>
  )
}
