"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound } from "lucide-react";
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
        <div className="relative w-full h-[90px] bg-[#520392] flex items-center shadow-xl">
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
          <div className="flex space-x-10">
            <button
              className={`text-[21px] font-bold text-white px-6 py-3 rounded-xl cursor-pointer ${
                currentPath == '/dashboard'
                  ? "bg-[#D9D9D9] hover:bg-opacity-90 bg-opacity-30"
                  : "bg-transparent hover:bg-[#D9D9D9] hover:bg-opacity-30"
              }`}
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`text-[21px] font-bold text-white px-6 py-3 rounded-xl cursor-pointer ${
                currentPath == '/educational-resources'
                  ? "bg-[#D9D9D9] hover:bg-opacity-90 bg-opacity-30"
                  : "bg-transparent hover:bg-[#D9D9D9] hover:bg-opacity-30"
              }`}
              onClick={() => console.log("push to educational resources page")}
            >
              Educational Resources
            </button>
          </div>

          <div className="absolute right-10 flex items-center space-x-4">
            {/* User Icon */}
            <div className="relative">
              <button
                onClick={() => console.log("push to my profile page")}
                className={`flex items-center justify-center aspect-square w-16 h-16 text-[21px] font-bold rounded-xl text-white cursor-pointer ${
                    currentPath == '/profile'
                      ? "bg-[#D9D9D9] hover:bg-opacity-90 bg-opacity-30"
                      : "bg-transparent hover:bg-[#D9D9D9] hover:bg-opacity-30"
                  }`}
              >
                <CircleUserRound size={40} />
              </button>
            </div>
          </div>
        </div>
    )
}
  