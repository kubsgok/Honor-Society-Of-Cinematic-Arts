import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Ensure user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Use the correct v2 method to update the current user's auth attributes
    const { data: updatedAuthUser, error: updateError } = await supabase.auth.updateUser({ email });
    if (updateError) {
      console.error("Auth update error:", updateError);
      return NextResponse.json({ error: "Failed to update auth email" }, { status: 500 });
    }

    // Sync users table email
    const { error: dbError } = await supabase
      .from("users")
      .update({ email })
      .eq("id", user.id);

    if (dbError) {
      console.error("Users table update error:", dbError);
      return NextResponse.json({ error: "Failed to update profile email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Email updated successfully", user: updatedAuthUser }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}