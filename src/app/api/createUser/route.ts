import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userData = await request.json();
    const { fullName, email, dob, gradMonth, gradYear, school } = userData;
    
    if (!fullName || !email || !dob || !gradMonth || !gradYear || !school) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
    const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('school', school)
        .single();

    if (chapterError) {
        console.error('Error finding chapter:', chapterError);
        return NextResponse.json({ error: "Chapter not found for this school" }, { status: 404 });
    }

    //ERROR CHECKING
    if (!chapterData) {
        console.error('No chapter data found for school:', school);
        return NextResponse.json({ error: "No chapter data found for this school" }, { status: 404 });
    }

    console.log('Found chapter data:', chapterData);
    console.log('Using chapter_id:', chapterData.chapter_id);
    //ERROR CHECKING
    
    const {error} = await supabase.from('users').insert({
        full_name: fullName,
        email: email,
        dob: dob,
        grad_month: gradMonth,
        grad_year: gradYear,
        chapter_id: chapterData.chapter_id,
        user_type: 'Associate',
        in_good_standing: true,
        minutes_film_produced: 0,
        seconds_film_produced: 0,
    })

    if (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create temp user" }, { status: 500 });
    }

    return NextResponse.json({ message: "Temp user created successfully" }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}