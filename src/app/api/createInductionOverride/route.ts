import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const pointsLogData = await request.json();
    const { userId, description } = pointsLogData;
    
    if (!userId || !description) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await supabase.from('induction_overrides').insert({
        user_id: userId,
        reason: description
        })

    return NextResponse.json({ message: "Induction override created successfully" }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}