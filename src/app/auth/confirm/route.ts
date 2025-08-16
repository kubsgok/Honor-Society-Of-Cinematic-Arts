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

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // insert the user in the database
      try {
        // Get the verified user's email from auth session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          // Find the temp user record for this email
          const { data: tempUser } = await supabase
            .from("temp_users")
            .select("*")
            .eq("email", user.email)
            .single();
            
          if (tempUser) {
            // Insert into users table
            await supabase.from("users").insert({
              email: tempUser.email,
              full_name: tempUser.full_name,
              dob: tempUser.dob,
              grad_month: tempUser.grad_month,
              grad_year: tempUser.grad_year
            });


            // Delete the temp user record
            await supabase.from("temp_users").delete().eq("email", user.email);
          }
        }
      } catch (error) {
        console.error("Error fetching temp user info: ", error)
      }

      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error')
}