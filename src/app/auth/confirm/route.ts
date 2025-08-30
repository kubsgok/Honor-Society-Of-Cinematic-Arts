import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient();

    const { error: otpError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!otpError) {
      // insert the user in the database
      try {
        // Get the verified user's email from auth session
        const { data: { user }, error: userFetchError } = await supabase.auth.getUser();
        if (userFetchError) {
          console.error("Error fetching user after OTP verification:", userFetchError);
          redirect(`/error?msg=${encodeURIComponent('Could not fetch user after OTP verification.')}`);
        }
        if (user?.email) {
          // Find the temp user record for this email
          const { data: tempUser, error: tempUserError } = await supabase
            .from("temp_users")
            .select("*")
            .eq("email", user.email)
            .single();
          if (tempUserError) {
            console.error("Error fetching temp user record:", tempUserError);
            redirect(`/error?msg=${encodeURIComponent('Could not find temp user record.')}`);
          }
          if (tempUser) {
            // Insert into users table
            const { error: insertError } = await supabase.from("users").insert({
              email: tempUser.email,
              full_name: tempUser.full_name,
              dob: tempUser.dob,
              grad_month: tempUser.grad_month,
              grad_year: tempUser.grad_year
            });
            if (insertError) {
              console.error("Error inserting into users table:", insertError);
              redirect(`/error?msg=${encodeURIComponent('Could not insert user into users table.')}`);
            }
            // Delete the temp user record
            const { error: deleteError } = await supabase.from("temp_users").delete().eq("email", user.email);
            if (deleteError) {
              console.error("Error deleting temp user record:", deleteError);
              // Not critical, so don't redirect
            }
          } else {
            console.error("Temp user not found for email:", user.email);
            redirect(`/error?msg=${encodeURIComponent('Temp user not found for this email.')}`);
          }
        } else {
          console.error("User email not found after OTP verification.");
          redirect(`/error?msg=${encodeURIComponent('User email not found after OTP verification.')}`);
        }
      } catch (error) {
        console.error("Error during user confirmation:", error);
        redirect(`/error?msg=${encodeURIComponent('Unexpected error during user confirmation.')}`);
      }

      // redirect user to specified redirect URL or root of app
      redirect(next)
    } else {
      console.error("OTP verification error:", otpError);
      redirect(`/error?msg=${encodeURIComponent('OTP verification failed.')}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error?msg=Invalid confirmation link or missing parameters.')
}