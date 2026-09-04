"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import type { Locale } from "@/lib/types";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { signIn, error, loading } = useAuth();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    fetch("/api/auth/bootstrap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.needsBootstrap) setNeedsBootstrap(true);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const { error } = await signIn(login, password);
    setSubmitting(false);
    if (error) {
      setFormError(translateError(error, isRtl));
      return;
    }
    router.push(`/${locale}/account`);
  };

  const handleBootstrap = async () => {
    setBootstrapping(true);
    setFormError(null);
    try {
      const res = await fetch("/api/auth/bootstrap", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data?.error || (isRtl ? "خطا در ساخت ادمین" : "Bootstrap failed"));
        setBootstrapping(false);
        return;
      }
      setNeedsBootstrap(false);
      setLogin(data.username || "admin");
      setPassword(data.password || "admin");
      setFormError(null);
      // Auto sign-in
      const { error: signErr } = await signIn(data.username || "admin", data.password || "admin");
      setBootstrapping(false);
      if (signErr) {
        setFormError(
          isRtl
            ? "ادمین ساخته شد — با admin / admin وارد شو"
            : "Admin created — sign in with admin / admin",
        );
        return;
      }
      router.push(`/${locale}/admin/super`);
    } catch (e) {
      setBootstrapping(false);
      setFormError(String(e));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-[#faf5e4] mb-1">
            {isRtl ? "خوش برگشتی" : "Welcome back"}
          </h1>
          <p className="text-sm text-[#888]">
            {isRtl ? "با نام کاربری و رمز عبور وارد شو" : "Sign in with username and password"}
          </p>
        </div>

        {needsBootstrap && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="mb-3">
              {isRtl
                ? "هنوز سوپرادمینی نیست. می‌توانی ادمین اولیه بسازی:"
                : "No super admin yet. Create the initial admin:"}
            </p>
            <button
              type="button"
              onClick={handleBootstrap}
              disabled={bootstrapping}
              className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              {bootstrapping ? (
                <Loader2 size={16} className="mx-auto animate-spin" />
              ) : isRtl ? (
                "ساخت ادمین: admin / admin"
              ) : (
                "Create admin / admin"
              )}
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl bg-[#141414] border border-[#1e1e1e] p-6"
        >
          {(formError || error) && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {formError ?? error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#ccc]">
              {isRtl ? "نام کاربری" : "Username"}
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder={isRtl ? "مثلاً admin" : "e.g. admin"}
              dir="ltr"
              className="w-full rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 text-sm text-[#faf5e4] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#ccc]">
              {isRtl ? "رمز عبور" : "Password"}
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              className="w-full rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 text-sm text-[#faf5e4] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {isRtl ? "ورود" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#888]">
          {isRtl ? "حساب نداری؟" : "Don't have an account?"}{" "}
          <Link href={`/${locale}/signup`} className="text-amber-400 hover:underline">
            {isRtl ? "ثبت‌نام کن" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function translateError(err: string, isRtl: boolean): string {
  if (!isRtl) return err;
  if (err.toLowerCase().includes("invalid login")) return "نام کاربری یا رمز عبور اشتباه است";
  if (err.toLowerCase().includes("email not confirmed")) return "حساب تأیید نشده است";
  return err;
}
