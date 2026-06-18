"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { applyActionCode } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { syncUserProfile } from "@/lib/auth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function VerifyEmailContent() {
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActionProcessed = useRef(false);

  useEffect(() => {
    if (!auth) return;

    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    // 1. Process link verification via OOB Code
    if (oobCode && mode === 'verifyEmail' && !isActionProcessed.current) {
      isActionProcessed.current = true;
      setStatus('verifying');
      applyActionCode(auth, oobCode)
        .then(async () => {
          if (auth.currentUser) {
            await auth.currentUser.reload();
            // 🛡️ CRITICAL ATOMIC SYNC
            await syncUserProfile(auth.currentUser);
          }
          setStatus('success');
          setTimeout(() => router.replace("/wallet"), 2500);
        })
        .catch(() => {
          setStatus('error');
        });
      return;
    }

    // 2. Real-time background monitoring for verification (Polled)
    const interval = setInterval(async () => {
      if (auth.currentUser && status === 'waiting') {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          // 🛡️ CRITICAL SYNC: Ensure Firestore profile matches Auth status
          await syncUserProfile(auth.currentUser);
          setStatus('success');
          setTimeout(() => router.replace("/wallet"), 2500);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router, searchParams, status]);

  const handleResend = async () => {
    if (!auth.currentUser) {
      toast({ variant: "destructive", title: "خطأ في الجلسة" });
      return;
    }
    setIsResending(true);
    try {
      const { sendAccountVerification } = await import("@/lib/auth");
      await sendAccountVerification(auth.currentUser);
      toast({ title: "تم إرسال الرابط بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "يرجى المحاولة لاحقاً" });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-lg px-4">
      <Card className="luxury-card border-none bg-card/60 backdrop-blur-3xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <AnimatePresence mode="wait">
          {status === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 relative z-10">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20">
                <Mail className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-headline font-black gold-text">تأكيد الهوية</h2>
                <p className="text-muted-foreground text-sm font-medium">أرسلنا رابط التفعيل لبريدك. يرجى النقر عليه لتنشيط حسابك.</p>
              </div>
              <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <p className="text-[11px] text-zinc-400 font-bold">إذا لم تجد الرسالة، افحص مجلد <b>Spam</b> فوراً.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase text-primary/40 tracking-widest">
                  <Loader2 className="animate-spin" size={14} /> جاري فحص الحالة تلقائياً
                </div>
                <Button onClick={handleResend} disabled={isResending} variant="outline" className="w-full h-14 rounded-xl border-primary/20">
                  {isResending ? <RefreshCw className="animate-spin" size={16} /> : "إعادة إرسال الرابط"}
                </Button>
              </div>
            </motion.div>
          )}

          {status === 'verifying' && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 space-y-6">
              <Loader2 className="animate-spin text-primary mx-auto" size={48} />
              <p className="text-2xl font-black gold-text uppercase">جاري توثيق البيانات السيادية...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 space-y-8">
              <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-green-500 leading-tight">ممتاز تم التحقق<br/>عد للمتجر للاستمتاع بخدماتنا</h2>
              <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest animate-pulse">جاري توجيهك الآن...</p>
              <Button asChild className="royal-button w-full h-16 mt-6"><Link href="/wallet">الانتقال للمحفظة</Link></Button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-6">
              <XCircle className="w-20 h-20 text-red-500 mx-auto" />
              <h2 className="text-2xl font-black text-red-500">فشل التحقق</h2>
              <p className="text-muted-foreground text-sm font-medium">الرابط غير صالح أو منتهي الصلاحية.</p>
              <Button asChild className="royal-button w-full h-16"><Link href="/login">العودة لصفحة الدخول</Link></Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">
      <Navbar />
      <Suspense fallback={<Loader2 className="animate-spin text-primary" size={48} />}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
