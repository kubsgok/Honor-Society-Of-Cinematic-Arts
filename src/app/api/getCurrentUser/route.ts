import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

            return NextResponse.json(userData);
        }

        return NextResponse.json({ error: "User not found" }, { status: 404 });
      } catch (error) {
        console.error("Error fetching user info: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
}