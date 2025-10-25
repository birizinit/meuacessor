"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { createApiClient } from "@/lib/api"

interface Notification {
  id: number
  date: string
  message: string
  unread: boolean
}

export function Header() {
  const pathname = usePathname()
  const [activeNav, setActiveNav] = useState("Home")
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()
  const [userName, setUserName] = useState("Usuário")

  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      const apiClient = createApiClient()
      if (!apiClient) return

      try {
        const userData = await apiClient.getUserInfo()
        setUserName(userData.name || userData.nickname || "Usuário")
      } catch (error) {
        console.error("[v0] Error fetching user data:", error)
      }
    }

    fetchUserData()

    // Load notifications from localStorage or use default
    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    } else {
      const defaultNotifications = [
        {
          id: 1,
          date: "10 de Ago - 13h",
          message: "Você acaba de aportar um valor de R$50 em Bitcoin",
          unread: true,
        },
        {
          id: 2,
          date: "10 de Ago - 13h",
          message: "Você acaba de aportar um valor de R$200 em Bitcoin",
          unread: true,
        },
        {
          id: 3,
          date: "05 de Fev - 15:08h",
          message: "Você acaba de aportar um valor de R$50 em Bitcoin",
          unread: true,
        },
        {
          id: 4,
          date: "01 de Jan - 13:10h",
          message: "Você acaba de mudar de nível! 👋 Muito bom Pedro! Continue assim!",
          unread: true,
        },
      ]
      setNotifications(defaultNotifications)
      localStorage.setItem("notifications", JSON.stringify(defaultNotifications))
    }
  }, [])

  useEffect(() => {
    if (pathname === "/operacoes") {
      setActiveNav("Operações")
    } else if (pathname === "/tutoriais") {
      setActiveNav("Tutoriais")
    } else if (pathname === "/perfil") {
      setActiveNav("Meu perfil")
    } else {
      setActiveNav("Home")
    }
  }, [pathname])

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleNotificationHover = (id: number) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      localStorage.setItem("notifications", JSON.stringify(updated))
      return updated
    })
  }

  const navItems = [
    { key: "Home", label: "Home" },
    { key: "Operações", label: "Operações" },
    { key: "Tutoriais", label: "Tutoriais" },
    { key: "Meu perfil", label: "Meu perfil" },
    { key: "Sair", label: "Sair" },
  ]

  const handleNavClick = (item: string) => {
    setActiveNav(item)
    if (item === "Sair") {
      localStorage.removeItem("isAuthenticated")
      router.push("/login")
      return
    }
    if (item === "Home") {
      router.push("/")
      return
    }
    if (item === "Operações") {
      router.push("/operacoes")
      return
    }
    if (item === "Tutoriais") {
      router.push("/tutoriais")
      return
    }
    if (item === "Meu perfil") {
      router.push("/perfil")
      return
    }
  }

  return (
    <header className="py-7 relative">
      <div className="container mx-auto px-4 md:px-10 lg:px-[124px] max-w-[1920px]">
        <div className="flex flex-wrap justify-between items-center gap-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-[60px]">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/assets/Subtract.svg" alt="Assessor Logo" width={39} height={49} />
              <div className="flex flex-col text-white">
                <span className="font-[Public_Sans] font-extrabold text-[14.7px] leading-none">meu</span>
                <span className="font-[Public_Sans] font-extrabold text-[26.8px] leading-none">assessor</span>
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-[20.8px] text-white">Bom dia, {userName}!</h2>
                <Image src="/assets/hands.png" alt="👋" width={22} height={22} />
              </div>
              <p className="text-[13.9px] text-[#aeabd8]">Suas operações vão muito bem, continue assim!</p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <nav className="hidden lg:block">
              <ul className="flex gap-8">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => handleNavClick(item.key)}
                      className={`font-[Poppins] text-[17px] transition-colors ${
                        activeNav === item.key ? "text-[#845bf6] font-bold" : "text-[#aeabd8] hover:text-[#845bf6]"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-transparent border-none cursor-pointer hover:bg-[#27264e]/50 rounded-lg transition-colors"
                >
                  <Bell className="w-6 h-6 text-gray-400" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#f2474a] text-white rounded-full w-[14.5px] h-[14.5px] flex items-center justify-center text-[8.7px]">
                    {unreadCount}
                  </span>
                )}

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-12 w-[348px] bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-[rgba(174,171,216,0.15)]">
                        <h3 className="text-white font-semibold text-lg">Avisos</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-[#27264e]/50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-[#aeabd8]" />
                        </button>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onMouseEnter={() => handleNotificationHover(notification.id)}
                            className="p-4 border-b border-[rgba(174,171,216,0.15)] hover:bg-[#27264e]/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-[#aeabd8] text-xs mb-2">{notification.date}</p>
                                <p className="text-white text-sm leading-relaxed">{notification.message}</p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-[#7c3aed] rounded-full mt-1 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Image src="/assets/Ellipse.svg" alt="User Avatar" width={44} height={44} className="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
