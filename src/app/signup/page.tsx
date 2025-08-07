"use client"

import { signup } from '../../utils/login-signup/actions'
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { months } from "../../lib/lists/months";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [school, setSchool] = useState("");
  const [gradMonth, setGradMonth] = useState("");
  const [gradYear, setGradYear] = useState<number>(new Date().getFullYear());
  const error = useSearchParams().get("error");

  // TODO: replace with an endpoint that gets the schools from 'chapters' table in database
  const dummySchools = ["Singapore American School", "International School Bangkok", "International School of Kuala Lumpur", "International School Manila", "Jakarta Intercultural School", "Taipei American School"];

  const handleSignup = async () => {
    if(!email || !(email.includes("@")) || email === "") {
      toast.error("Please enter a valid email");
      return;
    }
    if (!password || password === "") {
      toast.error("Please enter a valid password");
      return;
    }
    // if (!dateOfBirth) {
    //   toast.error("Please enter your date of birth");
    //   return;
    // }
    
    // Validate date only when submitting
    // const date = new Date(dateOfBirth);
    // if (isNaN(date.getTime())) {
    //   toast.error("Please enter a valid date of birth");
    //   return;
    // }
    
    console.log("Submitting signup with:", { email, password });
    await signup(email, password);
  };

  const handleDateChange = (dateString: string) => {
    setDateOfBirth(dateString);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      router.replace('/signup');
    }
  }, [error, router]);

  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/2 flex-col">
        <Image 
        width={50}
        height={50}
        src="/images/hscaLogoAndTextTransparentBg.png" 
        alt="HSCA Logo" 
        className="p-10 w-1/3"/>
        <h1 className="text-black text-4xl font-extrabold pl-10">
          Sign up
        </h1>
        <p className="text-black text-sm pl-10 pt-2">
          All fields are required.
        </p>
        <div className="flex flex-row w-1/2 gap-4">
            <div className="flex-col">
              <p className="text-black pl-10 pt-3 pb-2">First Name</p>
          <div className="pl-10 pb-3">
            <input 
              type="name" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md"/>
            </div>
        </div>
        <div className="flex-col">
            <p className="text-black pl-10 pt-3 pb-2">Last Name</p>
        <div className="pl-10 pb-3">
          <input 
            type="name" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md"/>
            </div>
        </div>
        </div>
        <p className="text-black pl-10 pt-3 pb-2">School</p>
        <div className="pl-10 pb-2">
          <select
            id="school"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"
          >
            {dummySchools.map((school) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>
        <p className="text-black pl-10 pt-3 pb-2">Email</p>
        <div className="pl-10 pb-3">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"/>
        </div>
        <p className="text-black pl-10 pt-3 pb-2">Password</p>
        <div className="pl-10 pb-2">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"/>
        </div>
        <p className="text-black pl-10 pt-3 pb-2">Date of Birth</p>
        <div className="pl-10 pb-2">
          <input 
            type="date" 
            value={dateOfBirth}
            onChange={(e) => handleDateChange(e.target.value)}
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2"/>
        </div>
        <p className="text-black pl-10 pt-3 pb-2">Graduation Month and Year</p>
        <div className="pl-10 pb-2 flex gap-8 justify-start">
          <select
            id="month"
            value={gradMonth}
            onChange={(e) => setGradMonth(e.target.value)}
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-9/40"
          >
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <input 
            type="year" 
            value={gradYear}
            onChange={(e) => setGradYear(Number(e.target.value))}
            className="placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-9/40"/>
        </div>
        <div className="pl-10 pb-2 pt-8">
          <button
          onClick={handleSignup}
          className="bg-[#520392] text-white p-2 rounded-md w-1/2 cursor-pointer">
            Sign up
          </button>
        </div>
        <div className="pl-10 w-1/2 pb-2 pt-2">
            <p className="text-black text-sm text-center pl-4">
              <span 
                className="text-[#520392] font-bold text-sm cursor-pointer hover:underline" 
                onClick={() => router.push("/login")}>
                I have an account
              </span>
            </p>
          </div>
        </div>
      <div className="w-1/2 bg-[#520392]">
      </div>
    </div>
  )
}