"use client";

import { useEffect, useState, Suspense } from "react";
import { syncUserProfile } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, XCircle, Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { applyActionCode } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";

/**
 * 🛡️ محرك التحقق السيادي (Instant Redirection Core).
 * تم تغليفه بـ Suspense لمتطلبات Next.js 15 وتحصينه ضد أخطاء الـ SSR.
 */
function VerifyEmailContent() {
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!auth) return;

    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    const handleVerification = async () => {
      if (oobCode && mode === 'verifyEmail') {
        setStatus('verifying');
        try {
          await applyActionCode(auth, oobCode);
          if (auth.currentUser) {
            await auth.currentUser.reload();
            await syncUserProfile(auth.currentUser);
          }
          setStatus('success');
          toast({ title: "تم التوثيق السيادي", description: "مرحباً بك في عالم XMOOD." });
          setTimeout(() => router.replace("/wallet"), 1500);
        } catch (e) {
          console.error("[AUTH_VERIFY] Error:", e);
          setStatus('error');
        }
      }
    };

    handleVerification();

    // 🛡️ نظام الرصد اللحظي (Auto-Polling)
    const checkInterval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            clearInterval(checkInterval);
            await syncUserProfile(auth.currentUser);
            setStatus('success');
            setTimeout(() => router.replace("/wallet"), 1000);
          }
        } catch (e) {}
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [searchParams, router]);

  return (
    <Card className="w-full max-w-lg p-10 md:p-20 text-center luxury-card border-none bg-card shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
      
      {status === 'waiting' && (
        <div className="space-y-10 relative z-10">
          <div className="w-28 h-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-primary/20 shadow-2xl">
             <Mail className="w-14 h-14 text-primary animate-pulse" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black gold-text">بانتظار تفعيل <br/> الهوية الرقمية</h2>
            <p className="text-muted-foreground font-medium text-lg">
              أرسلنا رابط التفعيل لبريدك. افتح الرابط في هاتفك وسنقوم بنقلك للمحفظة تلقائياً.
            </p>
          </div>
          <div className="pt-10 flex flex-col items-center gap-4">
             <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">جاري الرصد اللحظي...</p>
             </div>
          </div>
        </div>
      )}

      {status === 'verifying' && (
        <div className="space-y-10 relative z-10 py-10">
          <Loader2 className="w-24 h-24 text-primary animate-spin mx-auto" />
          <h2 className="text-2xl font-black">جاري معالجة التوثيق...</h2>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-10 relative z-10 animate-fade-up py-6">
          <div className="w-28 h-28 bg-green-500/10 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-green-500/20 shadow-inner">
             <ShieldCheck className="w-16 h-14" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black gold-text">تم التوثيق بنجاح!</h2>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-green-600 uppercase">
             <RefreshCw className="animate-spin" size={12} /> جاري فتح المحفظة...
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-10 relative z-10 animate-fade-in py-6">
          <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-red-500/20">
             <XCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-red-500">فشل توثيق الرابط</h2>
          <Button asChild className="royal-button w-full h-16"><a href="/login">العودة لبوابة الدخول <ArrowLeft className="mr-3" /></a></Button>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <Navbar />
      <Suspense fallback={<Loader2 className="animate-spin text-primary" size={60} />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
