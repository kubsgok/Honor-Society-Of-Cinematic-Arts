import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface MinutesFilmLog {
    created_at: Date
    modified_by: string
    modification: number
    description: string
    role: string
    member: string
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get userId from query parameters
        const targetUserId = request.nextUrl.searchParams.get('userId');
        
        if (!targetUserId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        
        if (user?.email) {
         let minutesFilmData: MinutesFilmLog[] = [];
         
         const { data } = await supabase
             .from('film_logs')
             .select('created_at, modified_by, modification, description')
             .eq('user_id', targetUserId);
         
         minutesFilmData = (data || []).map(log => ({
             ...log,
             role: '',
             member: ''
         }));
         
          for(const minutesLog of minutesFilmData) {
             const { data: modifierData } = await supabase
             .from('users')
             .select('user_type, full_name')
             .eq('id', minutesLog.modified_by)
             .single();

             if (modifierData) {
               minutesLog.modified_by = modifierData.full_name;
               minutesLog.role = modifierData.user_type;
             }
             
             // Get the member's name (the user this log entry is for)
             const { data: memberData } = await supabase
             .from('users')
             .select('full_name')
             .eq('id', targetUserId)
             .single();
             
             if (memberData) {
               minutesLog.member = memberData.full_name;
             }
          }
         
         return NextResponse.json({ minutesFilmData });
        }

        return NextResponse.json({ error: "User not found" }, { status: 404 });
      } catch (error) {
        console.error("Error fetching user info: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
}