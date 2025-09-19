import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const newUserInfo = await request.json();
    
    const { user_ids, user_id, full_name, email, user_type, rank, induction_status, in_good_standing, points, minutes_film_produced, modification } = newUserInfo;
    
    if (!modification) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    
    if (modification === 'points') {

      if (!user_ids) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
      }

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

    if (modification === 'minutes_film_produced') {

      if (!user_ids) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
      }

      // Update each user individually to add minutes of film produced
      for (const userId of user_ids) {
        // Get current user minutes of film produced
        const { data: currentUser } = await supabase
          .from('users')
          .select('minutes_film_produced')
          .eq('id', userId)
          .single()
        
        if (currentUser) {
          // Add the modification to current minutes of film produced
          const newMinutes = (currentUser.minutes_film_produced || 0) + minutes_film_produced
          
          await supabase
            .from('users')
            .update({ minutes_film_produced: newMinutes })
            .eq('id', userId)
        
        } else {
          console.log(`API: No current user found for ID: ${userId}`)
        }
      }
      
      return NextResponse.json({ message: "User minutes of film produced info updated successfully" }, { status: 200 });
    }

    if (modification === 'in_good_standing') {
      if (!user_id) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
      }
      
      // Get current user good standing
        const { data: currentUser } = await supabase
        .from('users')
        .select('in_good_standing')
        .eq('id', user_id)
        .single()
      
      if (currentUser) {
        await supabase
          .from('users')
          .update({ in_good_standing: false })
          .eq('id', user_id)
      
      } else {
        console.log(`API: No current user found for ID: ${user_id}`)
      }
      return NextResponse.json({ message: "User in good standing info updated successfully" }, { status: 200 });
    }

    if (modification === "email") {
      if (!email || !user_id) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
      }

      // Get current user good standing
      const { data: currentUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', user_id)
      .single()

      if (currentUser) {
        await supabase
          .from('users')
          .update({ email: email })
          .eq('id', user_id)
      
      } else {
        console.log(`API: No current user found for ID: ${user_id}`)
      }
      return NextResponse.json({ message: "User email updated successfully" }, { status: 200 });

    }

    return NextResponse.json({ error: "Invalid user modification" }, { status: 400 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}