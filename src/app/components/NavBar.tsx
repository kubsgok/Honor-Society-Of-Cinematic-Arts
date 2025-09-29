"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { Mail } from "lucide-react";
import Image from "next/image";

declare global {
  interface Window {
    preventNavigation?: boolean;
  }
}

export const NavBar = () => {
    const router = useRouter();
    const [currentPath, setCurrentPath] = useState("");

    useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

    return (
  <div className="relative w-full h-[90px] bg-[#520392] flex items-center shadow-md">
          {/* Logo Section */}
          <div className="flex-shrink-0 mr-8 cursor-pointer" onClick={() => console.log("push to default page, maybe the front end?")}>
            <Image 
            width={75}
            height={65}
            src="/images/hscaLogoTransparentBg.png" 
            alt="HSCA Logo"
            className="ml-3 p-1" />
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <button
              className={`group relative text-[21px] font-bold text-white px-5 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                currentPath == '/dashboard' ? 'bg-white/15' : 'bg-transparent hover:bg-white/10'
              } hover:-translate-y-0.5 active:translate-y-0`}
              onClick={() => router.push("/dashboard")}
            >
              <span className="relative z-10">Dashboard</span>
              <span
                className={`pointer-events-none absolute left-5 right-5 -bottom-1 h-[2px] rounded bg-white/70 transition-all duration-300 ease-out ${
                  currentPath == '/dashboard' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                }`}
              />
            </button>
            <button
              className={`group relative text-[21px] font-bold text-white px-5 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                currentPath == '/educational-resources' ? 'bg-white/15' : 'bg-transparent hover:bg-white/10'
              } hover:-translate-y-0.5 active:translate-y-0`}
              onClick={() => console.log("push to educational resources page")}
            >
              <span className="relative z-10">Educational Resources</span>
              <span
                className={`pointer-events-none absolute left-5 right-5 -bottom-1 h-[2px] rounded bg-white/70 transition-all duration-300 ease-out ${
                  currentPath == '/educational-resources' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                }`}
              />
            </button>
            <button
              className={`group relative text-[21px] font-bold text-white px-5 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                currentPath == '/educational-resources' ? 'bg-white/15' : 'bg-transparent hover:bg-white/10'
              } hover:-translate-y-0.5 active:translate-y-0`}
              onClick={() => router.push("/staff-interface")}
            >
              <span className="relative z-10">Staff Interface</span>
              <span
                className={`pointer-events-none absolute left-5 right-5 -bottom-1 h-[2px] rounded bg-white/70 transition-all duration-300 ease-out ${
                  currentPath == '/educational-resources' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                }`}
              />
            </button>
            <button
              className={`group relative text-[21px] font-bold text-white px-5 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                currentPath == '/educational-resources' ? 'bg-white/15' : 'bg-transparent hover:bg-white/10'
              } hover:-translate-y-0.5 active:translate-y-0`}
              onClick={() => router.push("/billing")}
            >
              <span className="relative z-10">Billing</span>
              <span
                className={`pointer-events-none absolute left-5 right-5 -bottom-1 h-[2px] rounded bg-white/70 transition-all duration-300 ease-out ${
                  currentPath == '/educational-resources' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                }`}
              />
            </button>
          </div>

          <div className="absolute right-10 flex items-center space-x-4">
            {/* Mail Icon */}
            <div className="relative">
              <button
                onClick={() => router.push('/inbox')}
                className={`group relative flex items-center justify-center aspect-square w-16 h-16 text-[21px] font-bold rounded-xl text-white cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    currentPath == '/inbox' ? 'bg-white/15' : 'bg-transparent hover:bg-white/10'
                  } hover:-translate-y-0.5 active:translate-y-0`}
              >
                <Mail size={40} className="transition-transform duration-200 group-hover:scale-105" />
              </button>
            </div>
            
            {/* Profile Icon */}
            <div className="relative">
              <button
                onClick={() => router.push('/profile')}
                className={`group relative flex items-center justify-center aspect-square w-16 h-16 text-[21px] font-bold rounded-xl text-white cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    currentPath == '/profile' ? 'bg-white/15' : 'bg-transparent hover:bg-white/10'
                  } hover:-translate-y-0.5 active:translate-y-0`}
              >
                <CircleUserRound size={40} className="transition-transform duration-200 group-hover:scale-105" />
              </button>
            </div>
          </div>
        </div>
    )
}
  