"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toAuthEmail } from "@/lib/auth/identity";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  /** Username or email + password */
  signIn: (login: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    login: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(
    async (login: string, password: string) => {
      setError(null);
      const supabase = createClient();
      const email = toAuthEmail(login);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return { error: error.message };
      }
      router.refresh();
      return { error: null };
    },
    [router],
  );

  const signUp = useCallback(
    async (login: string, password: string, fullName?: string) => {
      setError(null);
      const supabase = createClient();
      const trimmed = login.trim();
      const email = toAuthEmail(trimmed);
      const username = trimmed.includes("@")
        ? undefined
        : trimmed.toLowerCase();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...(fullName ? { full_name: fullName } : {}),
            ...(username ? { username } : {}),
            role: "customer",
          },
        },
      });
      if (error) {
        setError(error.message);
        return { error: error.message };
      }
      router.refresh();
      return { error: null };
    },
    [router],
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, error, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
