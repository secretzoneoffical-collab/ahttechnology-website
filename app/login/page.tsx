"use client";

import { Suspense, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setLoading(false);
    if (signInError) {
      setError("تعذر تسجيل الدخول. راجع البريد الإلكتروني وكلمة المرور.");
      return;
    }

    const requestedNext = searchParams.get("next") || "/dashboard";
    const safeNext = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";
    router.replace(safeNext);
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="email">البريد الإلكتروني</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">كلمة المرور</label>
      <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button-primary auth-submit" type="submit" disabled={loading}>{loading ? "جارٍ تسجيل الدخول..." : "دخول"}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card">
        <Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link>
        <span className="eyebrow">بوابة العملاء</span>
        <h1>تسجيل الدخول</h1>
        <p className="auth-muted">سجّل الدخول للوصول إلى حسابك وخدمات AHT.</p>
        <Suspense fallback={<p className="auth-muted">جارٍ تحميل نموذج الدخول...</p>}>
          <LoginForm />
        </Suspense>
        <Link className="auth-link" href="/forgot-password">نسيت كلمة المرور؟</Link>
        <Link className="auth-back" href="/">العودة إلى الموقع الرئيسي</Link>
      </section>
    </main>
  );
}
