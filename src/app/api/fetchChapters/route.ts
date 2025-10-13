import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface Chapters {
    chapter_id: string;
    chapter_number: number;
    school: string;
    director_id: string;
    director_name?: string;
    director_email?: string;
    first_month_school: string;
    grad_month: string;
    created_at: string;
    country: string;
    address: string;
    state: string;
    rejected: boolean;
    official: boolean;
    member_count?: number;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        let chaptersData: Chapters[] = [];
        
         const { data, error } = await supabase
             .from('chapters')
             .select(`
                chapter_id, 
                chapter_number, 
                school, 
                director_id, 
                first_month_school, 
                grad_month, 
                created_at, 
                country, 
                address, 
                state, 
                rejected, 
                official,
                director:users!director_id(full_name, email)
             `)
         
        if (error) {
            console.error("Error fetching chapters: ", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        const rawData = data || [];
        
        // Get user counts for each chapter
        const { data: userCounts, error: userCountError } = await supabase
            .from('users')
            .select('chapter_id')
            .not('chapter_id', 'is', null);

        if (userCountError) {
            console.error('Error fetching user counts:', userCountError);
            return NextResponse.json({ error: 'Failed to fetch user counts' }, { status: 500 });
        }

        // Count users by chapter_id
        const chapterUserCounts: { [key: string]: number } = {};
        userCounts?.forEach((user: any) => {
            if (user.chapter_id) {
                chapterUserCounts[user.chapter_id] = (chapterUserCounts[user.chapter_id] || 0) + 1;
            }
        });
        
        // Transform data to include director information and member count
        chaptersData = rawData
          .filter((chapter: any) => 
            chapter.rejected === false && chapter.official === true
          )
          .map((chapter: any) => ({
            chapter_id: chapter.chapter_id,
            chapter_number: chapter.chapter_number,
            school: chapter.school,
            director_id: chapter.director_id,
            director_name: chapter.director?.full_name || null,
            director_email: chapter.director?.email || null,
            first_month_school: chapter.first_month_school,
            grad_month: chapter.grad_month,
            created_at: chapter.created_at,
            country: chapter.country,
            address: chapter.address,
            state: chapter.state,
            rejected: chapter.rejected,
            official: chapter.official,
            member_count: chapterUserCounts[chapter.chapter_id] || 0
          }));
         
        return NextResponse.json({ chaptersData });
      } catch (error) {
        console.error("Error fetching user info: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
}