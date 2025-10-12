import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const chapterData = await request.json();
    
    const { director_id, schoolName, street, city, state, country, schoolFirstMonth, schoolGradMonth, official} = chapterData;
    if (!director_id || !schoolName || !street || !city || !state || !country || !schoolFirstMonth || !schoolGradMonth) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

  const {error} = await supabase.from('temp_chapters').insert({
        chapter_number: 302,
        director_id: director_id,
        school: schoolName,
        address: street,
        city: city,
        state: state,
        country: country,
        first_month_school: schoolFirstMonth,
        grad_month: schoolGradMonth,
        official: official,
    })
    if (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create a chapter" }, { status: 500 });
    }

    return NextResponse.json({ message: "Temp user created successfully" }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}