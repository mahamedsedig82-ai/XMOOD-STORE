"use client";

import { useEffect, useState } from "react";
import { completeMagicLinkSignIn, syncUserProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, XCircle, Home, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { onAuthStateChanged, applyActionCode } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // 🛡️ التحصين ضد أخطاء SSR: استخدام واجهات المتصفح فقط بداخل useEffect
    if (typeof window === 'undefined' || !auth) return;

    const verify = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const oobCode = urlParams.get('oobCode');
      const mode = urlParams.get('mode');

      try {
        // 1. بروتوكول توثيق الرابط التقليدي (Email Verification)
        if (oobCode && mode === 'verifyEmail') {
           await applyActionCode(auth, oobCode);
           if (auth.currentUser) {
              await auth.currentUser.reload();
              await syncUserProfile(auth.currentUser);
              setStatus('success');
              toast({ title: "تم توثيق الهوية السيادية" });
              // توجيه تلقائي وفوري ومباشر للمحفظة
              setTimeout(() => router.replace("/wallet"), 500);
              return;
           }
        }

        // 2. بروتوكول الرابط السحري (Magic Link)
        const userFromMagic = await completeMagicLinkSignIn();
        if (userFromMagic) {
          setStatus('success');
          toast({ title: "تم الدخول بنجاح" });
          setTimeout(() => router.replace("/wallet"), 500);
          return;
        }

        // 3. مراقب الحالة النشط (في حال تم التحقق في نافذة أخرى)
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            await firebaseUser.reload();
            if (firebaseUser.emailVerified) {
              await syncUserProfile(firebaseUser);
              setStatus('success');
              router.replace("/wallet");
            }
          }
        });
        
        // مهلة زمنية للفشل إذا لم يتم رصد كود
        const timeout = setTimeout(() => {
           if (status === 'verifying' && !oobCode) setStatus('error');
        }, 15000);

        return () => {
          unsubscribe();
          clearTimeout(timeout);
        };

      } catch (e: any) {
        console.error("Verification Error:", e);
        setStatus('error');
      }
    };
    verify();
  }, [auth, router, status]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <Card className="w-full max-w-lg p-10 md:p-16 text-center luxury-card border-none bg-card shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
        
        {status === 'verifying' && (
          <div className="space-y-10 relative z-10">
            <div className="relative inline-block">
               <Loader2 className="w-24 h-24 text-primary animate-spin mx-auto" />
               <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black gold-text uppercase tracking-tighter">جاري التوثيق السيادي</h2>
              <p className="text-muted-foreground font-medium text-sm">يتم الآن تأمين وصولك المباشر للمحفظة الرقمية...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-10 animate-fade-in relative z-10">
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-green-500/20 shadow-xl">
               <ShieldCheck className="w-14 h-14" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black gold-text">تم التوثيق بنجاح!</h2>
              <p className="text-muted-foreground font-bold">مرحباً بك في عالم XMOOD. جاري توجيهك لمحفظتك...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-10 animate-fade-in relative z-10">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-red-500/20 shadow-xl">
               <XCircle className="w-14 h-14" />
            </div>
            <h2 className="text-3xl font-black text-red-500">فشل في توثيق الرابط</h2>
            <p className="text-muted-foreground text-sm font-medium">ربما انتهت صلاحية الرابط أو تم استخدامه مسبقاً.</p>
            <div className="pt-8 flex flex-col gap-4">
               <Button asChild className="royal-button w-full h-16"><a href="/login">العودة لصفحة الدخول</a></Button>
               <Button asChild variant="ghost" className="w-full h-14"><a href="/"><Home className="ml-2" size={16} /> الرئيسية</a></Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}