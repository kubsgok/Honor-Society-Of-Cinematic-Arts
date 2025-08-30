import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const newPointsMod = await request.json();
    
    const { user_ids, full_name, email, user_type, rank, induction_status, in_good_standing, points, minutes_film_produced, modification } = newPointsMod;
    
    if (!user_ids || !points || !modification) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    
    if (modification === 'points') {
      // Update each user individually to add points
      for (const userId of user_ids) {
        // Get current user points
        const { data: currentUser } = await supabase
          .from('users')
          .select('points')
          .eq('id', userId)
          .single()
        
        if (currentUser) {
          // Add the modification to current points
          const newPoints = (currentUser.points || 0) + points
          
          await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', userId)
        
        } else {
          console.log(`API: No current user found for ID: ${userId}`)
        }
      }
      
      return NextResponse.json({ message: "User points info updated successfully" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid user modification" }, { status: 400 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}