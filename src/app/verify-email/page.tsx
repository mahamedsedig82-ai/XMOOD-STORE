"use client";

import { useEffect, useState } from "react";
import { syncUserProfile } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, XCircle, Mail, Sparkles, Home, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { applyActionCode, onAuthStateChanged } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  useEffect(() => {
    if (!auth) return;

    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');
    const waiting = searchParams.get('waiting');

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
          toast({ title: "تم التوثيق بنجاح" });
          setTimeout(() => router.replace("/wallet"), 2000);
        } catch (e) {
          setStatus('error');
        }
      } else if (waiting === 'true') {
        setStatus('waiting');
      }
    };

    handleVerification();

    // 🛡️ نظام المراقبة اللحظي (Auto-Polling)
    const checkInterval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(checkInterval);
          await syncUserProfile(auth.currentUser);
          setStatus('success');
          setTimeout(() => router.replace("/wallet"), 1500);
        }
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [auth, searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <Card className="w-full max-w-lg p-10 md:p-16 text-center luxury-card border-none bg-card shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
        
        {status === 'waiting' && (
          <div className="space-y-8 relative z-10 animate-fade-in">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/20">
               <Mail className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black gold-text">بانتظار توثيق الهوية</h2>
              <p className="text-muted-foreground font-medium">أرسلنا رابط التحقق لبريدك الإلكتروني. الصفحة ستقوم بتوجيهك تلقائياً بمجرد ضغطك على الرابط.</p>
            </div>
            <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
               <p className="text-[10px] font-black uppercase text-zinc-500">جاري فحص حالة البريد لحظياً...</p>
               <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
            </div>
          </div>
        )}

        {status === 'verifying' && (
          <div className="space-y-8 relative z-10">
            <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-black">جاري معالجة كود التوثيق...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-8 relative z-10 animate-fade-in">
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-green-500/20">
               <ShieldCheck className="w-14 h-14" />
            </div>
            <h2 className="text-3xl font-black gold-text">تم التوثيق السيادي بنجاح!</h2>
            <p className="text-muted-foreground font-bold">مرحباً بك في XMOOD. جاري نقلك للمحفظة...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-8 relative z-10 animate-fade-in">
            <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            <h2 className="text-2xl font-black text-red-500">فشل توثيق الرابط</h2>
            <p className="text-muted-foreground">ربما انتهت صلاحية الرابط أو تم استخدامه مسبقاً.</p>
            <Button asChild className="royal-button w-full h-16"><a href="/login">العودة للدخول</a></Button>
          </div>
        )}
      </Card>
    </div>
  );
}
