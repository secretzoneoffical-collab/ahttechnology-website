"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/language-switcher";
import { useSiteLanguage } from "@/components/language-provider";

export default function UpdatePasswordPage() {
  const { language } = useSiteLanguage();
  const isArabic = language === "ar";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(isArabic ? "تعذر تحديث كلمة المرور. افتح رابط الاستعادة مرة أخرى وحاول." : "Unable to update the password. Reopen the reset link and try again.");
      return;
    }
    setMessage(isArabic ? "تم تحديث كلمة المرور بنجاح." : "Your password has been updated successfully.");
    router.refresh();
  }

  return (
    <main className="auth-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="auth-card">
        <div style={{ display: "flex", justifyContent: "flex-end" }}><LanguageSwitcher /></div>
        <Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link>
        <span className="eyebrow">{isArabic ? "أمان الحساب" : "ACCOUNT SECURITY"}</span>
        <h1>{isArabic ? "تعيين كلمة مرور جديدة" : "Set a new password"}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="password">{isArabic ? "كلمة المرور الجديدة" : "New password"}</label>
          <input id="password" type="password" minLength={8} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="button-primary auth-submit" type="submit" disabled={loading}>{loading ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ كلمة المرور" : "Save password")}</button>
        </form>
      </section>
    </main>
  );
}
