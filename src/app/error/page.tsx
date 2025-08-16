'use client'
import Image from "next/image";

export default function ErrorPage() {
  return (
    <>
     <div className="flex flex-row min-h-screen">
      <div className="w-1/2 flex-col">
        <Image 
        width={50}
        height={50}
        src="/images/hscaLogoAndTextTransparentBg.png" 
        alt="HSCA Logo" 
        className="p-10 w-1/3"/>
        <h1 className="text-black text-4xl font-extrabold pl-10 pb-2">
          Error
        </h1>
        <p className="text-black pl-10 pt-2">Sorry, something went wrong. We suggest you try again later.</p>
        <p className="text-black pl-10 pt-2 pb-2">If the problem persists, please contact your chapter administrator.</p>
        <p className="text-black pl-10 pb-2">We are also available at{' '} 
          <a href="mailto:boardofdirectors@honorsocietyofcinematicarts.org" className="text-blue-600 hover:underline">
            boardofdirectors@honorsocietyofcinematicarts.org</a></p>
        </div>
      <div className="w-1/2 bg-[#520392]">
      </div>
    </div>
    </>
  );
}