"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { restaurantPath, superPath } from "@/lib/routes";

export default function SuperLoginPage() {
  const router = useRouter();
  const { signIn, error, loading, user } = useAuth();
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

  useEffect(() => {
    if (!loading && user) {
      // already signed in — try super home (layout will bounce if not super)
      router.replace(superPath());
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const { error: err } = await signIn(login, password);
    setSubmitting(false);
    if (err) {
      setFormError("نام کاربری یا رمز عبور اشتباه است");
      return;
    }
    router.push(superPath());
  };

  const handleBootstrap = async () => {
    setBootstrapping(true);
    const res = await fetch("/api/auth/bootstrap", { method: "POST" });
    const data = await res.json();
    setBootstrapping(false);
    if (!res.ok) {
      setFormError(data?.error || "خطا در ساخت ادمین");
      return;
    }
    setNeedsBootstrap(false);
    setLogin("admin");
    setPassword("admin");
    const { error: err } = await signIn("admin", "admin");
    if (err) {
      setFormError("ادمین ساخته شد — با admin / admin وارد شو");
      return;
    }
    router.push(superPath());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-[#faf5e4]">ورود سوپر ادمین</h1>
          <p className="mt-2 text-sm text-[#888]">پنل مدیریت کل پلتفرم — جدا از ادمین رستوران</p>
        </div>

        {needsBootstrap && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="mb-3">هنوز سوپرادمینی نیست:</p>
            <button
              type="button"
              onClick={handleBootstrap}
              disabled={bootstrapping}
              className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              {bootstrapping ? (
                <Loader2 size={16} className="mx-auto animate-spin" />
              ) : (
                "ساخت ادمین: admin / admin"
              )}
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-[#1e1e1e] bg-[#141414] p-6"
        >
          {(formError || error) && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError ?? error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm text-[#ccc]">نام کاربری</label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              dir="ltr"
              className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-3 text-sm text-[#faf5e4]"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#ccc]">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-3 text-sm text-[#faf5e4]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black disabled:opacity-50"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            ورود به سوپر ادمین
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#666]">
          ادمین رستوران؟{" "}
          <Link href={restaurantPath("/login")} className="text-amber-400 hover:underline">
            ورود رستوران
          </Link>
          {" · "}
          <Link href="/site" className="text-[#888] hover:text-amber-400">
            لندینگ
          </Link>
        </p>
      </div>
    </div>
  );
}
