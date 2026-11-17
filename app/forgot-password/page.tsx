"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`
    });

    setLoading(false);
    if (resetError) {
      setError("تعذر إرسال رابط الاستعادة. حاول مرة أخرى لاحقًا.");
      return;
    }
    setMessage("لو البريد مسجل عندنا، هيوصلك رابط استعادة كلمة المرور.");
  }

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card">
        <Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link>
        <span className="eyebrow">استعادة الحساب</span>
        <h1>نسيت كلمة المرور؟</h1>
        <p className="auth-muted">اكتب البريد الإلكتروني المرتبط بحسابك لإرسال رابط الاستعادة.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="button-primary auth-submit" type="submit" disabled={loading}>{loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}</button>
        </form>
        <Link className="auth-back" href="/login">العودة لتسجيل الدخول</Link>
      </section>
    </main>
  );
}
