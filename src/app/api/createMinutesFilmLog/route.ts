import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const minutesFilmLogData = await request.json();
    const { userIds, modifiedBy, modification, description, crewMin, screened, goodEffort } = minutesFilmLogData;
    
    if (!userIds || !modifiedBy || !modification || !description || !crewMin || !screened || !goodEffort) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    for (const userId of userIds) {
    await supabase.from('film_logs').insert({
        user_id: userId,
        modified_by: modifiedBy,
        modification: modification,
        description: description,
        crew_min: crewMin,
        screened: screened,
        effort_valid: goodEffort
        })
    }
    return NextResponse.json({ message: "Film minutes log created successfully" }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}