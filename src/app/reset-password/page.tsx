"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createClient } from '../../utils/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;
    
    return hasUpperCase && hasNumber && hasSymbol && hasMinLength;
  };

  useEffect(() => {
    const validateSession = async () => {
      const supabase = createClient();
      
      // Check if we have a valid session from the email link
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        toast.error("Invalid or expired reset link. Please request a new password reset.");
        router.push('/forgot-password');
        return;
      }
      
      setIsValidating(false);
    };

    validateSession();
  }, [router]);

  const handlePasswordUpdate = async () => {
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error("Password must contain at least 8 characters, one uppercase letter, one number, and one special character");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('Password update error:', error);
        toast.error("Error updating password. Please try again.");
      } else {
        toast.success("Password updated successfully!");
        // Redirect to login after success
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#520392] mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

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
          Reset Your Password
        </h1>
        <p className="text-black text-xl pl-10 pt-2">
          Enter your new password below
        </p>
        <div className="pl-10 pt-4 pb-2">
          <p className="text-gray-600 text-sm">
            Your password must contain:
          </p>
          <ul className="text-gray-600 text-xs mt-1 ml-4">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One number</li>
            <li>• One special character (!@#$%^&*)</li>
          </ul>
        </div>
        
        <p className="text-black pl-10 pt-5 pb-2">New Password</p>
        <div className="pl-10 pb-3">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"
            minLength={8}/>
        </div>
        
        <p className="text-black pl-10 pt-2 pb-2">Confirm Password</p>
        <div className="pl-10 pb-3">
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"
            minLength={8}/>
        </div>
        
        <div className="pl-10 pb-2 pt-8">
          <button
          onClick={handlePasswordUpdate}
          disabled={isLoading}
          className="bg-[#520392] text-white p-2 rounded-md w-1/2 cursor-pointer hover:bg-[#5f17a0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isLoading ? "Updating..." : "Update Password"}
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