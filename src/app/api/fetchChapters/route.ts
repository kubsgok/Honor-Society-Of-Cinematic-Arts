import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface Chapters {
    chapter_number: number;
    school: string;
    director_id: string;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        let chaptersData: Chapters[] = [];
        
         const { data, error } = await supabase
             .from('chapters')
             .select('chapter_number, school, director_id, first_month_school, grad_month, created_at')
         
        if (error) {
            console.error("Error fetching chapters: ", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
        chaptersData = data || [];
         
        return NextResponse.json({ chaptersData });
      } catch (error) {
        console.error("Error fetching user info: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
}