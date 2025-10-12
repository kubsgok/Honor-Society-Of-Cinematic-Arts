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

    // Use the correct v2 method to send email change confirmation
    const { data: updatedAuthUser, error: updateError } = await supabase.auth.updateUser({ email });
    if (updateError) {
      console.error("Auth update error:", updateError);
      return NextResponse.json({ 
        error: "Failed to send email change confirmation", 
        details: updateError.message 
      }, { status: 500 });
    }

    // Do NOT update users table here - it will be updated after email confirmation
    console.log("Email change confirmation sent to:", email);

    return NextResponse.json({ 
      message: "Email change confirmation sent. Please check your new email inbox and click the confirmation link.",
      pendingEmail: email,
      note: "Your profile will be updated automatically after you confirm the new email address."
    }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}