"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { isValidUsername } from "@/lib/auth/identity";
import type { Locale } from "@/lib/types";

export default function SignupPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { signUp, signIn, error } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUsername(username)) {
      setFormError(
        isRtl
          ? "نام کاربری باید ۳ تا ۳۲ کاراکتر انگلیسی (حروف، عدد، . _ -) باشد"
          : "Username must be 3–32 chars: a-z, 0-9, . _ -",
      );
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const { error: upErr } = await signUp(username, password, fullName);
    if (upErr) {
      setSubmitting(false);
      setFormError(isRtl ? translateError(upErr) : upErr);
      return;
    }
    // Username accounts are auto-confirmed via local domain; try sign-in
    const { error: inErr } = await signIn(username, password);
    setSubmitting(false);
    if (inErr) {
      router.push(`/${locale}/login`);
      return;
    }
    router.push(`/${locale}/account`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-[#faf5e4] mb-1">
            {isRtl ? "ساخت حساب جدید" : "Create account"}
          </h1>
          <p className="text-sm text-[#888]">
            {isRtl ? "با نام کاربری و رمز عبور عضو شو" : "Join with username and password"}
          </p>
        </div>

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
              {isRtl ? "نام کامل" : "Full name"}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isRtl ? "نام و نام خانوادگی" : "Your name"}
              className="w-full rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 text-sm text-[#faf5e4] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#ccc]">
              {isRtl ? "نام کاربری" : "Username"}
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
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
              minLength={4}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              className="w-full rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 text-sm text-[#faf5e4] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {isRtl ? "ثبت‌نام" : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#888]">
          {isRtl ? "از قبل حساب داری؟" : "Already have an account?"}{" "}
          <Link href={`/${locale}/login`} className="text-amber-400 hover:underline">
            {isRtl ? "وارد شو" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function translateError(err: string): string {
  const e = err.toLowerCase();
  if (e.includes("already registered")) return "این نام کاربری قبلاً ثبت شده است";
  if (e.includes("password")) return "رمز عبور نامعتبر است";
  return err;
}
