import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, full_name, email, chapter_id, user_type, rank, induction_status, in_good_standing, points, minutes, seconds, grad_month, grad_year, license_paid')
            .order('full_name', { ascending: true })

            return NextResponse.json(userData);
        }

        return NextResponse.json({ error: "User not found" }, { status: 404 });
      } catch (error) {
        console.error("Error fetching user info: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
}