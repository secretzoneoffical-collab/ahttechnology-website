"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/language-switcher";
import { useSiteLanguage } from "@/components/language-provider";

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
      setError(isArabic ? "تعذر إرسال رابط الاستعادة. حاول مرة أخرى لاحقًا." : "Unable to send the recovery link. Please try again later.");
      return;
    }
    setMessage(isArabic ? "لو البريد مسجل عندنا، هيوصلك رابط استعادة كلمة المرور." : "If the email is registered, a password reset link will be sent.");
  }

  return (
    <main className="auth-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="auth-card">
        <div style={{ display: "flex", justifyContent: "flex-end" }}><LanguageSwitcher /></div>
        <Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link>
        <span className="eyebrow">{isArabic ? "استعادة الحساب" : "ACCOUNT RECOVERY"}</span>
        <h1>{isArabic ? "نسيت كلمة المرور؟" : "Forgot your password?"}</h1>
        <p className="auth-muted">{isArabic ? "اكتب البريد الإلكتروني المرتبط بحسابك لإرسال رابط الاستعادة." : "Enter the email address associated with your account to receive a reset link."}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email address"}</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="button-primary auth-submit" type="submit" disabled={loading}>{loading ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : (isArabic ? "إرسال رابط الاستعادة" : "Send reset link")}</button>
        </form>
        <Link className="auth-back" href="/login">{isArabic ? "العودة لتسجيل الدخول" : "Back to sign in"}</Link>
      </section>
    </main>
  );
}
