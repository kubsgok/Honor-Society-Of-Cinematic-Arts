import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const rankLogData = await request.json();
    const { userId, rank } = rankLogData;
    
    if (!userId || !rank) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await supabase.from('user_ranks').insert({
        user_id: userId,
        rank: rank,
        merch_shipped: false
        })
    return NextResponse.json({ message: "User rank log created successfully" }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}