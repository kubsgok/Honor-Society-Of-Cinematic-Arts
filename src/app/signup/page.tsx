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
  const [gradYear, setGradYear] = useState<number | "">("");
  const [chapters, setChapters] = useState<any>([]);
  const error = useSearchParams().get("error");

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;
    
    return hasUpperCase && hasNumber && hasSymbol && hasMinLength;
  };

  useEffect(() => {
    const fetchChapters = async () => {
      const response = await fetch('/api/fetchChapters');
      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to fetch chapters')
        return;
      }
      const chapters: string[] = [];
      for (const chapter of data.chaptersData) {
        chapters.push(chapter.school);
      }
      const schools = (data.chaptersData || [])
        .filter((c: any) => c.official === true)
        .map((c: any) => c.school);
      setChapters(schools);
    }
    fetchChapters();
  }, [])

  const handleSignup = async () => {
    console.log('Chapters:', chapters);
    console.log('School:', school);
    if (!firstName || !lastName) {
      toast.error("Please enter your first and last name");
      return;
    }
    if(!email || !(email.includes("@")) || email === "") {
      toast.error("Please enter a valid email");
      return;
    }
    if (!password || password === "") {
      toast.error("Please enter a valid password");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Password must contain at least 8 characters, one uppercase letter, one number, and one special character");
      return;
    }
    if (!dateOfBirth) {
      toast.error("Please enter your date of birth");
      return;
    }
    
    // Validate date only when submitting
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      toast.error("Please enter a valid date of birth");
      return;
    }

    if (!gradMonth || !gradYear) {
      toast.error("Please enter a valid graduation month and year");
      return;
    }
    //TODO: add validation to ensure gradYear is valid
    const response = await fetch('/api/createTempUser', {
      method: 'POST',
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        dob: dateOfBirth,
        gradMonth,
        gradYear,
        school
      })
    })
    console.log(response);
    if (!response.ok) {
      console.error('Failed to create temp user')
      return
    }

    // creating a user in the authentication database
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
        width={600}
        height={250}
        src="/images/hscaLogoAndTextTransparentBg.png" 
        alt="HSCA Banner" 
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
            className={`${school ? 'text-black' : 'text-gray-400'} placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-1/2`}
          >
            <option value="" disabled hidden>Select your school</option>
            {chapters.map((school: string) => (
              <option key={school} className="text-black" value={school}>{school}</option>
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
        <div className="pl-10 pb-2 w-1/2">
          <p className="text-gray-600 text-xs">
            Password must contain: 8+ characters, one uppercase letter, one number, and one special character (!@#$%^&*)
          </p>
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
            className={`${gradMonth ? 'text-black' : 'text-gray-400'} placeholder:text-[#535151] p-2 border border-[#535151] rounded-md w-9/40`}
          >
            <option value="" disabled hidden>Select month</option>
            {months.map((month) => (
              <option key={month} className="text-black" value={month}>{month}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value ? Number(e.target.value) : "")}
            placeholder="Year"
            className={`${gradYear ? 'text-black' : 'text-gray-400'} placeholder:text-gray-400 p-2 border border-[#535151] rounded-md w-9/40`}/>
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