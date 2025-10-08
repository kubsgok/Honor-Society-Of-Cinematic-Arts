import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface YearlyRecords {
    id: string
    grade_level: number
    year_start: number
    user_id: string
    rank: string
    induction_status: string
    points: number
    minutes_film_produced: number
    position: string
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
    let userYeardata: YearlyRecords[] = [];
        
        const { data, error } = await supabase
            .from('user_yearly_records')
            .select('*')
         
        if (error) {
            console.error("Error fetching user records: ", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        userYeardata = data || [];
        // userYeardata = userYeardata.filter((chapter) => chapter.rejected === false);
         
        return NextResponse.json({ userYeardata });
      } catch (error) {
        console.error("Error fetching user info: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    }