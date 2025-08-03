'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(email: string, password: string) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=Invalid email or password');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(email: string, password: string) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect('/signup?error=Signup failed');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}