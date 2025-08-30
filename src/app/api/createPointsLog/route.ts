import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const pointsLogData = await request.json();
    const { userIds, modifiedBy, modification, description } = pointsLogData;
    
    if (!userIds || !modifiedBy || !modification || !description) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    for (const userId of userIds) {
    await supabase.from('points_logs').insert({
        user_id: userId,
        modified_by: modifiedBy,
        modification: modification,
        description: description
        })
    }
    return NextResponse.json({ message: "Points log created successfully" }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}