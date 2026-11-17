"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/language-switcher";
import { useSiteLanguage } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const { language } = useSiteLanguage();
  const isArabic = language === "ar";
  const [accountType, setAccountType] = useState<"customer" | "staff">("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError(isArabic ? "كلمة المرور لازم تكون 8 أحرف على الأقل." : "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError(isArabic ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            account_type: accountType
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      });

      if (signupError) {
        setError(isArabic ? "تعذر إنشاء الحساب. راجع البيانات وحاول مرة أخرى." : "Unable to create the account. Check your details and try again.");
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setSuccess(
        accountType === "staff"
          ? (isArabic
              ? "تم استلام طلب انضمامك. لو تأكيد البريد الإلكتروني مفعّل، راجع بريدك أولًا. حساب الموظف سيظل غير نشط لحد مراجعة AHT والموافقة عليه."
              : "Your staff application was received. If email confirmation is enabled, verify your email. Your staff account will remain inactive until AHT reviews and approves it.")
          : (isArabic
              ? "تم إنشاء حساب العميل. لو تأكيد البريد الإلكتروني مفعّل، راجع بريدك لتأكيد الحساب ثم سجّل الدخول."
              : "Your customer account has been created. If email confirmation is enabled, check your inbox to verify it, then sign in.")
      );
    } catch {
      setError(isArabic ? "حدث خطأ غير متوقع أثناء التسجيل. حاول مرة أخرى." : "An unexpected error occurred while signing up. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="auth-card">
        <div style={{ display: "flex", justifyContent: "flex-end" }}><LanguageSwitcher /></div>
        <Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link>
        <span className="eyebrow">{isArabic ? "إنشاء حساب جديد" : "CREATE AN ACCOUNT"}</span>
        <h1>{isArabic ? "انضم إلى AHT" : "Join AHT"}</h1>
        <p className="auth-muted">
          {isArabic ? "اختار نوع الحساب المناسب. حساب العميل يتفعّل تلقائيًا، أما حساب الموظف فيحتاج موافقة الإدارة." : "Choose your account type. Customer accounts activate automatically; staff accounts require administrator approval."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>{isArabic ? "نوع الحساب" : "Account type"}</label>
          <div className="signup-role-options">
            <label className={accountType === "customer" ? "signup-role-option selected" : "signup-role-option"}>
              <input type="radio" name="account_type" value="customer" checked={accountType === "customer"} onChange={() => setAccountType("customer")} />
              <span><strong>{isArabic ? "عميل" : "Customer"}</strong><small>{isArabic ? "متابعة الخدمات والمشاريع الخاصة بي" : "Access my services and projects"}</small></span>
            </label>
            <label className={accountType === "staff" ? "signup-role-option selected" : "signup-role-option"}>
              <input type="radio" name="account_type" value="staff" checked={accountType === "staff"} onChange={() => setAccountType("staff")} />
              <span><strong>{isArabic ? "موظف" : "Staff"}</strong><small>{isArabic ? "طلب انضمام لفريق AHT — يتطلب موافقة" : "Apply to join AHT — approval required"}</small></span>
            </label>
          </div>

          <label htmlFor="full_name">{isArabic ? "الاسم بالكامل" : "Full name"}</label>
          <input id="full_name" type="text" autoComplete="name" minLength={2} maxLength={160} required value={fullName} onChange={(event) => setFullName(event.target.value)} />

          <label htmlFor="signup_email">{isArabic ? "البريد الإلكتروني" : "Email address"}</label>
          <input id="signup_email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />

          <label htmlFor="signup_password">{isArabic ? "كلمة المرور" : "Password"}</label>
          <input id="signup_password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />

          <label htmlFor="confirm_password">{isArabic ? "تأكيد كلمة المرور" : "Confirm password"}</label>
          <input id="confirm_password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />

          {error && <p className="auth-error" role="alert">{error}</p>}
          {success && <p className="auth-success" role="status">{success}</p>}
          <button className="button-primary auth-submit" type="submit" disabled={loading}>
            {loading ? (isArabic ? "جارٍ إنشاء الحساب..." : "Creating account...") : (isArabic ? "إنشاء الحساب" : "Create account")}
          </button>
        </form>

        <p className="auth-muted signup-footnote">
          {isArabic ? "بالتسجيل، أنت تؤكد أن البيانات المدخلة تخصك. اختيار «موظف» لا يمنح صلاحيات قبل موافقة الإدارة." : "By signing up, you confirm the details belong to you. Selecting Staff does not grant access before administrator approval."}
        </p>
        <Link className="auth-link" href="/login">{isArabic ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Already have an account? Sign in"}</Link>
        <Link className="auth-back" href="/">{isArabic ? "العودة إلى الموقع الرئيسي" : "Back to website"}</Link>
      </section>
    </main>
  );
}
