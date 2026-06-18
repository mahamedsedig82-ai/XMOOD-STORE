
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, ShieldCheck, XCircle, Zap, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { applyActionCode, sendEmailVerification } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { syncUserProfile } from "@/lib/auth";
import Link from "next/link";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const [isResending, setIsResending] = useState(false);
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
          setTimeout(() => router.replace("/wallet"), 2000);
        })
        .catch((err) => {
          console.error("Verification Error:", err);
          setStatus('error');
        });
    }

    // المراقب اللحظي للحالة
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          await syncUserProfile(auth.currentUser);
          setStatus('success');
          setTimeout(() => router.replace("/wallet"), 1500);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router, searchParams]);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast({ title: "تم إعادة إرسال الرابط", description: "تأكد من فحص مجلد Spam." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: "يرجى المحاولة بعد قليل." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-xl p-10 md:p-16 text-center luxury-card border-none shadow-2xl relative overflow-hidden bg-card/60 backdrop-blur-3xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
      
      {status === 'waiting' && (
        <div className="space-y-10 animate-fade-in relative z-10">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-primary/20">
             <Mail className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-4">
             <h2 className="text-3xl md:text-4xl font-headline font-black gold-text">بانتظار التوثيق</h2>
             <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed px-4">
               لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. يرجى النقر عليه لتنشيط عضويتك السيادية.
             </p>
          </div>

          <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col gap-3">
             <div className="flex items-center gap-3 justify-center text-amber-500 font-black text-xs uppercase tracking-widest">
                <AlertCircle size={16} /> تنبيه هام جداً
             </div>
             <p className="text-xs text-zinc-400 font-bold leading-relaxed">
               إذا لم تجد الرسالة في صندوق الوارد، يرجى التحقق فوراً من مجلد <b>الرسائل غير المرغوب فيها (Spam)</b> أو <b>Junk</b>.
             </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-center gap-4 border border-primary/5">
               <Loader2 className="animate-spin text-primary" size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">جاري فحص الحالة لحظياً...</span>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleResend} 
              disabled={isResending}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5"
            >
              {isResending ? <RefreshCw className="animate-spin mr-2" size={14} /> : "لم تصلك الرسالة؟ إعادة الإرسال"}
            </Button>
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
           <p className="text-3xl font-black gold-text">جاري توثيق الهوية السيادية...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-10 animate-fade-in">
          <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
             <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-headline font-black text-green-500 uppercase">تم التوثيق بنجاح</h2>
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
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6" dir="rtl">
      <Navbar />
      <Suspense fallback={<div className="flex flex-col items-center gap-6"><Loader2 className="animate-spin text-primary" size={64} /><p className="font-black text-xs uppercase tracking-widest gold-text">Loading Sovereign Portal...</p></div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
