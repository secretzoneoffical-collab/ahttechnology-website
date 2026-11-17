"use client";

import { Suspense, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/language-switcher";
import { useSiteLanguage } from "@/components/language-provider";

function LoginForm() {
  const router = useRouter();
  const { language } = useSiteLanguage();
  const isArabic = language === "ar";
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    let timeoutId: number | undefined;
    try {
      const supabase = createClient();
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      const { error: signInError } = await Promise.race([
        signInPromise,
        new Promise<never>((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error("LOGIN_TIMEOUT")), 20000);
        })
      ]);

      if (signInError) {
        setError(isArabic ? "تعذر تسجيل الدخول. راجع البريد الإلكتروني وكلمة المرور، أو حاول مرة أخرى." : "Unable to sign in. Check your email and password, or try again.");
        return;
      }

      const requestedNext = searchParams.get("next") || "/dashboard";
      const safeNext = requestedNext.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.includes("\\")
        ? requestedNext
        : "/dashboard";
      router.replace(safeNext);
      router.refresh();
    } catch (error) {
      const timedOut = error instanceof Error && error.message === "LOGIN_TIMEOUT";
      setError(
        timedOut
          ? (isArabic ? "الاتصال بخدمة تسجيل الدخول استغرق وقتًا طويلًا. تحقق من الاتصال وحاول مرة أخرى." : "The sign-in request timed out. Check your connection and try again.")
          : (isArabic ? "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى، وإذا استمرت المشكلة تواصل مع AHT." : "An unexpected sign-in error occurred. Please try again.")
      );
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email address"}</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">{isArabic ? "كلمة المرور" : "Password"}</label>
      <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button-primary auth-submit" type="submit" disabled={loading}>{loading ? (isArabic ? "جارٍ تسجيل الدخول..." : "Signing in...") : (isArabic ? "دخول" : "Sign in")}</button>
    </form>
  );
}

export default function LoginPage() {
  const { language } = useSiteLanguage();
  const isArabic = language === "ar";
  return (
    <main className="auth-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="auth-card">
        <div style={{ display: "flex", justifyContent: "flex-end" }}><LanguageSwitcher /></div>
        <Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link>
        <span className="eyebrow">{isArabic ? "بوابة العملاء" : "CLIENT PORTAL"}</span>
        <h1>{isArabic ? "تسجيل الدخول" : "Sign in"}</h1>
        <p className="auth-muted">{isArabic ? "سجّل الدخول للوصول إلى حسابك وخدمات AHT." : "Sign in to access your AHT account and services."}</p>
        <Suspense fallback={<p className="auth-muted">{isArabic ? "جارٍ تحميل نموذج الدخول..." : "Loading sign-in form..." }</p>}>
          <LoginForm />
        </Suspense>
        <Link className="auth-link" href="/forgot-password">{isArabic ? "نسيت كلمة المرور؟" : "Forgot your password?"}</Link>
        <Link className="auth-link" href="/signup">{isArabic ? "ليس لديك حساب؟ إنشاء حساب جديد" : "New to AHT? Create an account"}</Link>
        <Link className="auth-back" href="/">{isArabic ? "العودة إلى الموقع الرئيسي" : "Back to website"}</Link>
      </section>
    </main>
  );
}
