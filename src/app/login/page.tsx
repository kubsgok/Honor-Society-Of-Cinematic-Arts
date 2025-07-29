import { login, signup } from './actions'
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/2 flex-col">
        <Image 
        width={50}
        height={50}
        src="/images/hscaLogoWhiteBackground.jpeg" 
        alt="HSCA Logo" 
        className="p-5 w-1/4"/>
        <h1 className="text-black text-4xl font-bold">
          Welcome!
        </h1>
        <h1>Left side content</h1>
      </div>
      <div className="w-1/2 bg-[#520392]">
      </div>
    </div>
  )
}