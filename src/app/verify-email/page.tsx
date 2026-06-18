"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, ShieldCheck, XCircle, Zap, CheckCircle, AlertCircle, RefreshCw, ArrowRight, ShoppingBag } from "lucide-react";
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

  useEffect(() => {
    if (!auth) return;

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
          // 🛡️ Immediate Sovereign Redirect after 2s
          setTimeout(() => {
            router.replace("/store");
          }, 2000);
        })
        .catch((err) => {
          console.error("Verification Error:", err);
          setStatus('error');
        });
    }

    const interval = setInterval(async () => {
      if (auth.currentUser && status === 'waiting') {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          await syncUserProfile(auth.currentUser);
          setStatus('success');
          setTimeout(() => router.replace("/store"), 2000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router, searchParams, status]);

  const handleResend = async () => {
    if (!auth.currentUser) {
      toast({ variant: "destructive", title: "خطأ في الجلسة", description: "يرجى تسجيل الدخول مجدداً." });
      return;
    }
    setIsResending(true);
    try {
      const { sendAccountVerification } = await import("@/lib/auth");
      await sendAccountVerification(auth.currentUser);
      toast({ title: "تم إرسال الرابط بنجاح" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى المحاولة بعد قليل." });
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
            <motion.div 
              key="waiting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 relative z-10"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
                <Mail className="w-10 h-10 text-primary animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-headline font-black gold-text">تأكيد الهوية</h2>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  أرسلنا رابط التفعيل الرسمي إلى بريدك. يرجى النقر عليه لتنشيط صلاحياتك في متجر XMOOD.
                </p>
              </div>

              <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                  <AlertCircle size={14} /> ملاحظة أمنية
                </div>
                <p className="text-[11px] text-zinc-400 font-bold leading-relaxed">
                  إذا لم تجد الرسالة، يرجى التحقق فوراً من مجلد <b>الرسائل المزعجة (Spam)</b>.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase text-primary/40 tracking-widest">
                  <Loader2 className="animate-spin" size={14} /> جاري فحص الحالة تلقائياً
                </div>
                <Button 
                  onClick={handleResend} 
                  disabled={isResending}
                  variant="outline"
                  className="w-full h-14 rounded-xl border-primary/20 text-xs font-black uppercase tracking-widest hover:bg-primary/5"
                >
                  {isResending ? <RefreshCw className="animate-spin mr-2" size={16} /> : "إعادة إرسال الرابط"}
                </Button>
              </div>
            </motion.div>
          )}

          {status === 'verifying' && (
            <motion.div 
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 space-y-6"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative w-full h-full bg-primary rounded-[2rem] flex items-center justify-center shadow-xl">
                  <Zap className="text-black fill-current" size={32} />
                </div>
              </div>
              <p className="text-2xl font-black gold-text uppercase">جاري توثيق البيانات السيادية...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 space-y-8"
            >
              <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-green-500 leading-tight">ممتاز تم التحقق<br/>عد للمتجر للاستمتاع بخدماتنا</h2>
                <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest animate-pulse mt-4">جاري توجيهك الآن...</p>
              </div>
              <Button asChild className="royal-button w-full h-16 shadow-xl mt-4">
                <Link href="/store"><ShoppingBag size={20} className="ml-2" /> الذهاب للمتجر يدوياً</Link>
              </Button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 py-6"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-red-500/20">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-red-500">فشل التحقق</h2>
                <p className="text-muted-foreground text-sm font-medium">الرابط المستخدم غير صالح أو منتهي الصلاحية.</p>
              </div>
              <Button asChild className="royal-button w-full h-16">
                <Link href="/login">العودة لصفحة الدخول</Link>
              </Button>
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03),transparent_70%)] pointer-events-none" />
      <Suspense fallback={<div className="flex flex-col items-center gap-6"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
