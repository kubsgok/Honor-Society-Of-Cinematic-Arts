"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { NavBar } from './components/NavBar'

interface User {
  id: string
  full_name: string
  email: string
  dob: Date
  user_type: string
  grad_month: string
  grad_year: number
  status: string
}

export default function Home() {
  // allow null to represent "not loaded / not signed in"
  const [user, setUser] = useState<any | null>(null);         // auth user shape is different; keep any or appropriate type
  const [userData, setUserData] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUserInfo() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser?.email) {
          setUser(null);
          setUserData(null);
          return; // not signed in
        }
        setUser(authUser);

        const { data: dbUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", authUser.email)
          .single();

        if (error) {
          console.error("Error loading users row:", error);
          setUserData(null);
        } else {
          setUserData(dbUser as User);
        }
      } catch (error) {
        console.error("Error fetching user info: ", error);
        setUser(null);
        setUserData(null);
      }
    }
    getUserInfo();
  }, []);

  const displayName = userData?.full_name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {displayName}!</h1>
          <p className="mt-2 text-gray-600">
            Welcome to the Honor Society of Cinematic Arts portal. Use the navigation bar to access your profile, dashboard,
             and other tools.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm text-gray-500">Role</p>
              <p className="mt-1 text-lg font-medium text-gray-800">{userData?.user_type}</p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm text-gray-500">Expected Graduation</p>
              <p className="mt-1 text-lg font-medium text-gray-800">{userData?.grad_month} {userData?.grad_year}</p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 text-lg font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
