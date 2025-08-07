"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import Image from "next/image";

export const NavBar = () => {
    const [currentPath, setCurrentPath] = useState(false);

    return (
        <div className="relative w-full h-[90px] bg-[#520392] flex items-center shadow-xl">
          {/* Logo Section */}
          <div className="flex-shrink-0 mr-8 cursor-pointer" onClick={() => console.log("push to default page, maybe the front end?")}>
            <Image 
            width={112}
            height={91}
            src="/images/hscaLogoWhiteBackground.jpeg" 
            alt="HSCA Logo" />
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-10">
            <button
              className={`text-[21px] font-crimson font-bold text-white px-6 py-3 rounded-xl ${
                currentPath
                  ? "bg-[#D9D9D9] hover:bg-opacity-90 bg-opacity-30"
                  : "bg-transparent hover:bg-[#D9D9D9] hover:bg-opacity-30"
              }`}
              onClick={() => console.log("push to dashboard page")}
            >
              Dashboard
            </button>
            <button
              className={`text-[21px] font-crimson font-bold text-white px-6 py-3 rounded-xl ${
                currentPath
                  ? "bg-[#D9D9D9] hover:bg-opacity-90 bg-opacity-30"
                  : "bg-transparent hover:bg-[#D9D9D9] hover:bg-opacity-30"
              }`}
              onClick={() => console.log("push to educational resources page")}
            >
              Educational Resources
            </button>
          </div>

          <div className="absolute right-10 flex items-center space-x-4">
            {/* User Name and Dropdown */}
            <div className="relative">
              <button
                onClick={() => console.log("push to my profile page")}
                className="flex items-center text-[21px] font-crimson font-bold text-white"
              >
                <CircleUserRound />
              </button>
              {/* Dropdown Menu */}
            </div>
          </div>
        </div>
    )
}
  