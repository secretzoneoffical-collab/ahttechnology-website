"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSiteLanguage } from "@/components/language-provider";

const serviceOptions = [
  "مراجعة أنظمة الأعمال",
  "تجهيز وتطوير POS و ERP",
  "ربط الأنظمة",
  "أتمتة الأعمال",
  "إدارة المخزون والتشغيل",
  "تشغيل IT والحلول التقنية",
  "الدعم الفني وحل المشكلات",
  "الشبكات وأنظمة المراقبة",
  "أخرى"
];

export default function ContactRequestForm() {
  const { language } = useSiteLanguage();
  const isArabic = language === "ar";
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const form = event.currentTarget;
    const values = new FormData(form);
    const payload = {
      full_name: String(values.get("full_name") ?? "").trim(),
      email: String(values.get("email") ?? "").trim(),
      phone: String(values.get("phone") ?? "").trim(),
      company: String(values.get("company") ?? "").trim() || null,
      service_type: String(values.get("service_type") ?? ""),
      message: String(values.get("message") ?? "").trim()
    };

    if (payload.full_name.length < 2 || payload.phone.length < 7 || payload.message.length < 10) {
      setError(isArabic ? "راجع البيانات: الاسم ورقم الهاتف والرسالة مطلوبين، والرسالة 10 أحرف على الأقل." : "Please check the required name, phone, and message fields. The message must contain at least 10 characters.");
      setStatus("error");
      return;
    }

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("service_requests").insert(payload);
      if (insertError) throw insertError;
      form.reset();
      setStatus("success");
    } catch {
      setError(isArabic ? "حصلت مشكلة أثناء إرسال الطلب. حاول مرة تانية أو تواصل معنا عبر واتساب." : "We could not send your request. Please try again or contact us on WhatsApp.");
      setStatus("error");
    }
  }

  return (
    <form className="auth-form contact-request-form" onSubmit={handleSubmit}>
      <label htmlFor="request-name">{isArabic ? "الاسم بالكامل *" : "Full name *"}</label>
      <input id="request-name" name="full_name" autoComplete="name" minLength={2} maxLength={120} required />
      <label htmlFor="request-email">{isArabic ? "البريد الإلكتروني *" : "Email address *"}</label>
      <input id="request-email" name="email" type="email" autoComplete="email" maxLength={254} required />
      <label htmlFor="request-phone">{isArabic ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}</label>
      <input id="request-phone" name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} required />
      <label htmlFor="request-company">{isArabic ? "اسم الشركة (اختياري)" : "Company name (optional)"}</label>
      <input id="request-company" name="company" autoComplete="organization" maxLength={160} />
      <label htmlFor="request-service">{isArabic ? "الخدمة المطلوبة *" : "Service required *"}</label>
      <select id="request-service" name="service_type" required defaultValue="">
        <option value="" disabled>{isArabic ? "اختر الخدمة" : "Select a service"}</option>
        {serviceOptions.map((service) => <option key={service} value={service}>{isArabic ? service : ({ "مراجعة أنظمة الأعمال": "Business Systems Audit", "تجهيز وتطوير POS و ERP": "POS / ERP Setup & Optimization", "ربط الأنظمة": "Systems Integration", "أتمتة الأعمال": "Business Automation", "إدارة المخزون والتشغيل": "Inventory & Operations Management", "تشغيل IT والحلول التقنية": "IT Operations & Technical Solutions", "الدعم الفني وحل المشكلات": "Technical Support & Troubleshooting", "الشبكات وأنظمة المراقبة": "Networking & CCTV Solutions", "أخرى": "Other" } as Record<string, string>)[service] || service}</option>)}
      </select>
      <label htmlFor="request-message">{isArabic ? "اشرح لنا احتياجك *" : "Tell us what you need *"}</label>
      <textarea id="request-message" name="message" rows={5} minLength={10} maxLength={3000} required />
      {status === "success" && <p className="auth-success" role="status">{isArabic ? "وصلنا طلبك بنجاح. فريق AHT هيراجعه ويتواصل معاك." : "Your request has been received. The AHT team will review it and get back to you."}</p>}
      {status === "error" && <p className="auth-error" role="alert">{error}</p>}
      <button className="button-primary auth-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "{isArabic ? "جارٍ إرسال الطلب..." : "Sending request..."}" : "{isArabic ? "إرسال طلب الخدمة" : "Send service request"}"}
      </button>
      <p className="auth-muted">{isArabic ? "إرسال الطلب لا يعني قبول عرض أو تحديد سعر؛ هنراجع التفاصيل ونتواصل معاك." : "Submitting a request does not confirm a quote or price. We will review the details and contact you."}</p>
    </form>
  );
}
