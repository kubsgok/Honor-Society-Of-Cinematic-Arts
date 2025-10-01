"use client"

import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createClient } from '../../utils/supabase/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;
    
    return hasUpperCase && hasNumber && hasSymbol && hasMinLength;
  };

  const handlePasswordReset = async () => {
    if(!email || !email.includes("@") || email === "") {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        toast.error("Error sending reset email. Please try again.");
      } else {
        toast.success("Password reset email sent! Check your inbox.");
        // Optional: redirect to login after success
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/2 flex-col">
        <Image 
        width={600}
        height={250}
        src="/images/hscaLogoAndTextTransparentBg.png" 
        alt="HSCA Banner" 
        className="p-10 w-1/3"/>
        <h1 className="text-black text-4xl font-extrabold pl-10">
          Forgot Your Password?
        </h1>
        <p className="text-black text-xl pl-10 pt-2">
          Enter your email to reset your password
        </p>
        <div className="pl-10 pt-4 pb-2">
          <p className="text-gray-600 text-sm">
            Your new password must contain:
          </p>
          <ul className="text-gray-600 text-xs mt-1 ml-4">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One number</li>
            <li>• One special character (!@#$%^&*)</li>
          </ul>
        </div>
        <p className="text-black pl-10 pt-5 pb-2">Email</p>
        <div className="pl-10 pb-3">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"/>
        </div>
        <div className="pl-10 pb-2 pt-8">
          <button
          onClick={handlePasswordReset}
          disabled={isLoading}
          className="bg-[#520392] text-white p-2 rounded-md w-1/2 cursor-pointer hover:bg-[#5f17a0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isLoading ? "Sending..." : "Send Reset Email"}
          </button>
        </div>
        <div className="pl-10 pb-2 w-1/2">
          <p className="text-black text-sm text-center">
            Remember your password? 
            <span 
            onClick={() => router.push("/login")}
            className="text-[#520392] text-sm text-center cursor-pointer hover:underline ml-1">
              Back to Login
            </span>
          </p>
        </div>
        </div>
      <div className="w-1/2 bg-[#520392]">
      </div>
    </div>
  )
}