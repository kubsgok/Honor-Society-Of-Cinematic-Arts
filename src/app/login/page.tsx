"use client"

import { login} from '../../utils/login-signup/actions'
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const error = useSearchParams().get("error");

  const handleLogin = async () => {
    if(!email || !(email.includes("@")) || email === "") {
      toast.error("Please enter a valid email");
      return;
    }
    if (!password || password === "") {
      toast.error("Please enter a valid password");
      return;
    }
    await login(email, password);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      // Clear the error parameter from URL
      router.replace('/login');
    }
  }, [error, router]);

  const resetPassword = async () => {

  }

  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/2 flex-col">
        <Image 
        width={50}
        height={50}
        src="/images/hscaLogoWhiteBackground.jpeg" 
        alt="HSCA Logo" 
        className="p-10 w-1/3"/>
        <h1 className="text-black text-4xl font-extrabold pl-10">
          Welcome!
        </h1>
        <p className="text-black text-xl pl-10 pt-2">
          Sign in to access your HSCA account
        </p>
        <p className="text-black pl-10 pt-5 pb-2">Email</p>
        <div className="pl-10 pb-3">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"/>
        </div>
        <p className="text-black pl-10 pt-5 pb-2">Password</p>
        <div className="pl-10 pb-2">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"/>
        </div>
        <span 
        onClick={() => {console.log("manage forgot password")}} 
        className="text-[#520392] text-sm text-right block w-1/2 ml-5 cursor-pointer hover:underline">
          Forgot password?
        </span>
        <div className="pl-10 pb-2 pt-8">
          <button
          onClick={handleLogin}
          className="bg-[#520392] text-white p-2 rounded-md w-1/2 cursor-pointer">
            Login
          </button>
        </div>
        <div className="pl-10 pb-2 w-1/2">
          <p className="text-black text-sm text-center">
            Don't have an account? 
            <span 
            onClick={() => router.push("/signup")}
            className="text-[#520392] text-sm text-center cursor-pointer hover:underline ml-1">
              Sign up
            </span>
          </p>
        </div>
        </div>
      <div className="w-1/2 bg-[#520392]">
      </div>
    </div>
  )
}