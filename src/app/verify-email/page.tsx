"use client";

import { useEffect, useState } from "react";
import { syncUserProfile } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, XCircle, Mail, Sparkles, Home, ArrowLeft, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { applyActionCode } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

/**
 * صفحة التحقق والانتظار السيادية.
 * تقوم بمراقبة حالة البريد لحظياً وتوجيه العميل فوراً بمجرد الضغط على الرابط.
 */
export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  useEffect(() => {
    if (!auth) return;

    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    // 🛡️ معالجة الضغط المباشر على الرابط (Verification Action)
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
          console.error("[VERIFY_ERROR]", e);
          setStatus('error');
        }
      }
    };

    handleVerification();

    // 🛡️ نظام المراقبة اللحظي (Auto-Polling Guard)
    // يفحص حالة البريد كل 3 ثوانٍ لتجنب حاجة المستخدم لتحديث الصفحة يدوياً
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
        } catch (e) {
          // خطأ صامت في الخلفية لإكمال المراقبة
        }
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [auth, searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <Card className="w-full max-w-lg p-10 md:p-20 text-center luxury-card border-none bg-card shadow-2xl relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
        
        {status === 'waiting' && (
          <div className="space-y-10 relative z-10">
            <div className="w-28 h-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-primary/20 shadow-2xl">
               <Mail className="w-14 h-14 text-primary animate-pulse" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black gold-text leading-tight">بانتظار تفعيل <br/> الهوية الرقمية</h2>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                أرسلنا رابط التفعيل لبريدك. <br/>
                افتح الرابط في هاتفك الآن وسنقوم بنقلك للمحفظة تلقائياً.
              </p>
            </div>
            <div className="pt-10 border-t border-border/50 flex flex-col items-center gap-4">
               <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">جاري الرصد اللحظي للحالة...</p>
               </div>
               <p className="text-[8px] text-muted-foreground opacity-60">System Auto-Polling Active</p>
            </div>
          </div>
        )}

        {status === 'verifying' && (
          <div className="space-y-10 relative z-10 py-10">
            <div className="relative mx-auto w-24 h-24">
               <Loader2 className="w-full h-full text-primary animate-spin" />
               <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/40" size={32} />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black">جاري معالجة البروتوكول...</h2>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Verifying Security Code</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-10 relative z-10 animate-fade-up py-6">
            <div className="w-28 h-28 bg-green-500/10 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-green-500/20 shadow-inner">
               <ShieldCheck className="w-16 h-14" />
            </div>
            <div className="space-y-2">
               <h2 className="text-3xl md:text-4xl font-black gold-text">تم التوثيق بنجاح!</h2>
               <p className="text-muted-foreground font-bold text-lg">مرحباً بك في الوحدة السيادية XMOOD.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
               <RefreshCw className="animate-spin" size={12} /> جاري فتح المحفظة...
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-10 relative z-10 animate-fade-in py-6">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-red-500/20">
               <XCircle className="w-12 h-12" />
            </div>
            <div className="space-y-3">
               <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter">فشل توثيق الرابط</h2>
               <p className="text-muted-foreground font-medium">ربما انتهت صلاحية الرابط أو تم استخدامه مسبقاً. يرجى طلب رابط جديد من صفحة الدخول.</p>
            </div>
            <div className="flex flex-col gap-4">
               <Button asChild className="royal-button w-full h-16 text-lg"><a href="/login">العودة لبوابة الدخول <ArrowLeft className="mr-3" /></a></Button>
               <Button asChild variant="ghost" className="h-12 rounded-xl text-zinc-500 font-bold"><a href="/">زيارة الرئيسية</a></Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
