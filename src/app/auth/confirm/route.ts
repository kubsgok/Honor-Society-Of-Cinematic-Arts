import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import { getChapterNumber, setChapterNumber } from '@/lib/lists/chapters'

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
            console.log("Found temp user:", tempUser);
            if (tempUser.user_type == "Chapter Director") {
        
              const { data: tempChapter, error: tempChapterError } = await supabase
                .from("temp_chapters")
                .select("*")
                .eq("director_id", tempUser.id)
                .single();
              if (tempChapterError || !tempChapter) {
                console.error('Error finding temp chapter:', tempUser.id, tempChapterError);
                redirect(`/error?msg=${encodeURIComponent(`Could not find temp chapter: ${tempUser.id}`)}`);
              }

              // insert into users table and return the new user's id
              const { data: newUser, error: insertUserError } = await supabase
                .from("users")
                .insert({
                  email: tempUser.email,
                  full_name: tempUser.full_name,
                  dob: tempUser.dob,
                  user_type: 'Chapter Director',
                  in_good_standing: true
                })
                .select('id')
                .single();

              if (insertUserError || !newUser) {
                console.error("Error inserting into users table:", insertUserError);
                redirect(`/error?msg=${encodeURIComponent(`Could not insert user into users table: ${insertUserError?.message ?? 'unknown'}`)}`);
              }

              const chapterNo = getChapterNumber();

              // insert into chapters table using the newly created user's id as director_id
              const { data: newChapter, error: insertChapterError } = await supabase
                .from("chapters")
                .insert({
                  chapter_number: chapterNo,
                  director_id: newUser.id,
                  school: tempChapter.school,
                  address: tempChapter.address,
                  city: tempChapter.city,
                  state: tempChapter.state,
                  country: tempChapter.country,
                  first_month_school: tempChapter.first_month_school,
                  grad_month: tempChapter.grad_month,
                  official: false,
                })
                .select('chapter_id, director_id')
                .single();

              if (insertChapterError || !newChapter) {
                console.error('Error inserting new chapter:', insertChapterError);
                // rollback the created user (best-effort)
                await supabase.from('users').delete().eq('id', newUser.id);
                redirect(`/error?msg=${encodeURIComponent(`Could not insert new chapter: ${insertChapterError?.message ?? 'unknown'}`)}`);
              }

              // update the user record to set chapter_id FK to the inserted chapter.chapter_id
              const { error: updateUserError } = await supabase
                .from('users')
                .update({ chapter_id: newChapter.chapter_id })
                .eq('id', newUser.id);

              if (updateUserError) {
                console.error('Error updating user with chapter_id:', updateUserError);
                redirect(`/error?msg=${encodeURIComponent(`Could not link user to chapter: ${updateUserError.message}`)}`);
              }

              // cleanup temp tables (best-effort)
              const { error: deleteTempUserErr } = await supabase.from("temp_users").delete().eq("email", tempUser.email);
              if (deleteTempUserErr) console.error('Failed to delete temp_users record:', deleteTempUserErr);

              const { error: deleteTempChapterErr } = await supabase.from("temp_chapters").delete().eq("director_id", tempUser.id);
              if (deleteTempChapterErr) console.error('Failed to delete temp_chapters record:', deleteTempChapterErr);

              setChapterNumber(chapterNo + 1);

            } else {
              // Associate flow: find an existing chapters record for the provided school
              const { data: chapterData, error: chapterError } = await supabase
                .from('chapters')
                .select('*')
                .eq('school', tempUser.school)
                .maybeSingle();

              if (chapterError || !chapterData) {
                console.error('Error finding chapter for school:', tempUser.school, chapterError);
                redirect(`/error?msg=${encodeURIComponent(`Could not find chapter for school: ${tempUser.school}`)}`);
              }

              // Insert into users table (associate) and set chapter_id to the found chapter.chapter_id
              const { data: newAssociate, error: insertError } = await supabase
                .from('users')
                .insert({
                  email: tempUser.email,
                  full_name: tempUser.full_name,
                  dob: tempUser.dob,
                  grad_month: tempUser.grad_month,
                  grad_year: tempUser.grad_year,
                  chapter_id: chapterData.chapter_id,
                  user_type: 'Associate',
                  in_good_standing: true
                })
                .select('id')
                .single();
            
              if (insertError || !newAssociate) {
                console.error("Error inserting associate into users table:", insertError);
                redirect(`/error?msg=${encodeURIComponent(`Could not insert user into users table: ${insertError?.message ?? 'unknown'}`)}`);
              }

              console.log("Successfully inserted associate user:", newAssociate.id);
            }
          } else {
            console.error("Temp user not found for email:", user.email);
            redirect(`/error?msg=${encodeURIComponent('Temp user not found for this email.')}`);
          }
          // Delete the temp user record
            const { error: deleteError } = await supabase.from("temp_users").delete().eq("email", user.email);
            if (deleteError) {
              console.error("Error deleting temp user record:", deleteError);
              // Not critical, so don't redirect
            }
        } else {
          console.error("User email not found after OTP verification.");
          redirect(`/error?msg=${encodeURIComponent('User email not found after OTP verification.')}`);
        }
      } catch (error) {
        console.error("Error during user confirmation:", error);
        redirect(`/error?msg=${encodeURIComponent(`Unexpected error during user confirmation: ${error instanceof Error ? error.message : 'Unknown error'}`)}`);
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