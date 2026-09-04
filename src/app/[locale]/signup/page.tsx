"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import type { Locale } from "@/lib/types";

export default function SignupPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { signUp, error } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) {
      setFormError(isRtl ? translateError(error) : error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center rounded-3xl bg-[#141414] border border-[#1e1e1e] p-8">
          <span className="text-5xl block mb-4">✅</span>
          <h1 className="text-xl font-black text-[#faf5e4] mb-2">
            {isRtl ? "ثبت‌نام تقریباً تمام شد" : "Almost done"}
          </h1>
          <p className="text-sm text-[#888] mb-6">
            {isRtl
              ? "لینک تأیید به ایمیلت ارسال شد. لطفاً ایمیل را چک کن."
              : "A confirmation link has been sent to your email. Please check your inbox."}
          </p>
          <Link
            href={`/${locale}/login`}
            className="inline-block rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400"
          >
            {isRtl ? "برو به ورود" : "Go to login"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl block mb-3">✨</span>
          <h1 className="text-2xl font-black text-[#faf5e4] mb-1">
            {isRtl ? "ساخت حساب جدید" : "Create account"}
          </h1>
          <p className="text-sm text-[#888]">
            {isRtl ? "عضو چاشنی شو" : "Join CHASHNI"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl bg-[#141414] border border-[#1e1e1e] p-6"
        >
          {formError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {formError}
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
              {isRtl ? "ایمیل" : "Email"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              minLength={6}
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
  if (e.includes("already registered")) return "این ایمیل قبلاً ثبت شده است";
  if (e.includes("password should be")) return "رمز عبور باید حداقل ۶ کاراکتر باشد";
  return err;
}
