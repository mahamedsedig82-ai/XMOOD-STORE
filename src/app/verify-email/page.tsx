"use client";

import { useEffect, useState } from "react";
import { completeMagicLinkSignIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      try {
        const user = await completeMagicLinkSignIn();
        if (user) {
          setStatus('success');
          setTimeout(() => router.push("/"), 2000);
        } else {
          setStatus('error');
        }
      } catch (e) {
        setStatus('error');
      }
    };
    verify();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6" dir="rtl">
      <Card className="w-full max-w-md p-12 text-center rounded-[3rem] shadow-2xl border-none bg-white dark:bg-zinc-950">
        {status === 'verifying' && (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-black">جاري تأمين الرابط السحري...</h2>
            <p className="text-sm text-slate-500">نحن نتحقق من هويتك الرقمية الآن.</p>
          </div>
        )}
        {status === 'success' && (
          <div className="space-y-6 animate-fade-in">
            <ShieldCheck className="w-20 h-20 text-green-500 mx-auto" />
            <h2 className="text-3xl font-black gold-text">تم تأكيد الهوية!</h2>
            <p className="text-sm text-slate-500">مرحباً بك في متجر XMOOD، سيتم توجيهك الآن.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-6 animate-fade-in">
            <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            <h2 className="text-2xl font-black">رابط منتهي الصلاحية</h2>
            <p className="text-sm text-slate-500">عذراً، هذا الرابط غير صالح أو تم استخدامه مسبقاً.</p>
            <button onClick={() => router.push("/login")} className="royal-button w-full h-14">العودة لصفحة الدخول</button>
          </div>
        )}
      </Card>
    </div>
  );
}
