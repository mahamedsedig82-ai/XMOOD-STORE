"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, ShieldCheck, XCircle, ArrowRight, Zap, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { applyActionCode } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { syncUserProfile } from "@/lib/auth";
import Link from "next/link";

function VerifyEmailContent() {
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !auth) return;

    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (oobCode && mode === 'verifyEmail') {
      setStatus('verifying');
      applyActionCode(auth, oobCode)
        .then(async () => {
          if (auth.currentUser) {
            await auth.currentUser.reload();
            await syncUserProfile(auth.currentUser);
          }
          setStatus('success');
          toast({ title: "تم تفعيل حسابك بنجاح" });
          setTimeout(() => router.replace("/wallet"), 1500);
        })
        .catch((err) => {
          console.error("Verification Error:", err);
          setStatus('error');
        });
    }

    // Auto-polling to detect verification from another device/tab
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          await syncUserProfile(auth.currentUser);
          setStatus('success');
          setTimeout(() => router.replace("/wallet"), 1000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router, searchParams]);

  return (
    <Card className="w-full max-w-xl p-12 md:p-20 text-center luxury-card border-none shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
      
      {status === 'waiting' && (
        <div className="space-y-10 animate-fade-in relative z-10">
          <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-primary/20">
             <Mail className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-headline font-black gold-text">بانتظار التوثيق</h2>
             <p className="text-muted-foreground text-lg font-medium leading-relaxed">أرسلنا رابط التفعيل الرسمي لبريدك الإلكتروني، يرجى النقر عليه لتنشيط محفظتك.</p>
          </div>
          <div className="p-6 bg-muted/30 rounded-2xl flex items-center justify-center gap-4 border border-primary/10">
             <Loader2 className="animate-spin text-primary" size={24} />
             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">جاري فحص الحالة لحظياً...</span>
          </div>
        </div>
      )}

      {status === 'verifying' && (
        <div className="py-20 animate-fade-in">
           <div className="relative w-24 h-24 mx-auto mb-10">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-full h-full bg-primary rounded-full flex items-center justify-center shadow-xl">
                 <Zap className="text-white fill-white" size={40} />
              </div>
           </div>
           <p className="text-3xl font-black gold-text">جاري توثيق الهوية...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-10 animate-fade-in">
          <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
             <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-headline font-black text-green-500 uppercase">تم التوثيق</h2>
             <p className="text-lg font-bold text-muted-foreground">جاري تحضير محفظتك الرقمية الآن...</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-10 animate-fade-in">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-red-500/20">
             <XCircle className="w-14 h-14 text-red-500" />
          </div>
          <div className="space-y-4">
             <h2 className="text-3xl font-black text-red-500">فشل التحقق</h2>
             <p className="text-muted-foreground font-medium">الرابط منتهي الصلاحية أو تم استخدامه مسبقاً.</p>
          </div>
          <Button asChild className="royal-button w-full h-16 text-lg"><Link href="/login">العودة للدخول</Link></Button>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <Navbar />
      <Suspense fallback={<div className="flex flex-col items-center gap-6"><Loader2 className="animate-spin text-primary" size={64} /><p className="font-black text-xs uppercase tracking-widest gold-text">Loading Security...</p></div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}