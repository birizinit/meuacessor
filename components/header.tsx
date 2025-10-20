"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"

export function Header() {
  const [activeNav, setActiveNav] = useState("Home")
  const [notificationCount] = useState(4)
  const router = useRouter()

  const navItems = ["Home", "Operações", "Tutoriais", "Meu perfil", "Sair"]

  const handleNavClick = (item: string) => {
    setActiveNav(item)
    if (item === "Sair") {
      localStorage.removeItem("isAuthenticated")
      router.push("/login")
    }
  }

  return (
    <header className="py-7">
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
                <h2 className="font-semibold text-[20.8px] text-white">Bom dia, Pedro!</h2>
                <Image src="/assets/hands.png" alt="👋" width={22} height={22} />
              </div>
              <p className="text-[13.9px] text-[#aeabd8]">Suas operações vão muito bem, continue assim!</p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <nav className="hidden lg:block">
              <ul className="flex gap-8">
                {navItems.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`font-[Poppins] text-[17px] transition-colors ${
                        activeNav === item ? "text-[#845bf6] font-bold" : "text-[#aeabd8] hover:text-[#845bf6]"
                      }`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-6">
              <div className="relative">
                <button className="p-2 bg-transparent border-none cursor-pointer hover:bg-[#27264e]/50 rounded-lg transition-colors">
                  <Bell className="w-6 h-6 text-gray-400" />
                </button>
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#f2474a] text-white rounded-full w-[14.5px] h-[14.5px] flex items-center justify-center text-[8.7px]">
                    {notificationCount}
                  </span>
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
