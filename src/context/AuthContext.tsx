"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { BodyMeasurements, SizeProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  sizeProfile: SizeProfile | null;
  saveSizeProfile: (measurements: BodyMeasurements) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signUp: AuthContextValue["signUp"] = async (email, password, fullName) => {
    if (!supabase) {
      return { error: "Store is running in demo mode — connect Supabase to enable accounts." };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    if (!supabase) {
      return { error: "Store is running in demo mode — connect Supabase to enable accounts." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  /**
   * Persists the customer's measurements to their Supabase profile
   * (stored in auth user_metadata, so no extra table is required for the
   * demo). Only available once signed in with Supabase configured.
   */
  const saveSizeProfile: AuthContextValue["saveSizeProfile"] = async (measurements) => {
    if (!supabase || !user) {
      return { error: "Sign in to save your measurements to your profile." };
    }
    const size_profile: SizeProfile = { ...measurements, updatedAt: new Date().toISOString() };
    const { data, error } = await supabase.auth.updateUser({ data: { size_profile } });
    if (error) return { error: error.message };
    if (data.user) setUser(data.user);
    return { error: null };
  };

  const sizeProfile = (user?.user_metadata?.size_profile as SizeProfile | undefined) ?? null;

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    sizeProfile,
    saveSizeProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
