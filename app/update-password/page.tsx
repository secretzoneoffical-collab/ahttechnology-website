"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
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
      setError("تعذر تحديث كلمة المرور. افتح رابط الاستعادة مرة أخرى وحاول.");
      return;
    }
    setMessage("تم تحديث كلمة المرور بنجاح.");
    router.refresh();
  }

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card">
        <Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link>
        <span className="eyebrow">أمان الحساب</span>
        <h1>تعيين كلمة مرور جديدة</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="password">كلمة المرور الجديدة</label>
          <input id="password" type="password" minLength={8} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="button-primary auth-submit" type="submit" disabled={loading}>{loading ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}</button>
        </form>
      </section>
    </main>
  );
}
