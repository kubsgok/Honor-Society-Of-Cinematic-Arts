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
  redirect('/dashboard');
}

export async function signup(email: string, password: string) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const { data, error } = await supabase.auth.signUp({ email, password });
  console.log('signup response:', { data, error })

  if (error) {
    // Log the actual error to the terminal for debugging
    console.error('Supabase signup error:', error.message || error);
    redirect(`/signup?error=${encodeURIComponent(error.message || 'Signup failed')}`);
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut('local');
  if (error) {
    console.error('Supabase logout error:', error.message || error);
  }
  redirect('/login');
}