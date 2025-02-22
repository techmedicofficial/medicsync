import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, role: string, userData: any) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    });

    if (authError) throw authError;

    if (role === 'doctor' && authData.user) {
      const { error: profileError } = await supabase.from('doctors').insert([
        {
          id: authData.user.id,
          ...userData,
        },
      ]);

      if (profileError) throw profileError;
    }

    return { data: authData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(user: User | null): Promise<string | null> {
  if (!user) return null;
  return user.user_metadata.role || null;
}