"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ShieldCheck, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { applyActionCode } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { syncUserProfile } from "@/lib/auth";

function VerifyEmailContent() {
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !auth) return;

    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get('oobCode');
    const mode = params.get('mode');

    if (oobCode && mode === 'verifyEmail') {
      setStatus('verifying');
      applyActionCode(auth, oobCode)
        .then(async () => {
          if (auth.currentUser) {
            await auth.currentUser.reload();
            await syncUserProfile(auth.currentUser);
          }
          setStatus('success');
          toast({ title: "تم التوثيق بنجاح" });
          setTimeout(() => router.replace("/wallet"), 2000);
        })
        .catch(() => setStatus('error'));
    }

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
  }, [router]);

  return (
    <Card className="w-full max-w-md p-10 text-center luxury-card">
      {status === 'waiting' && (
        <div className="space-y-6">
          <Mail className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold">بانتظار التحقق</h2>
          <p className="text-muted-foreground text-sm">أرسلنا رابطاً لبريدك الإلكتروني، يرجى الضغط عليه لتفعيل حسابك.</p>
          <div className="flex items-center justify-center gap-2 pt-4">
             <Loader2 className="animate-spin text-primary" size={16} />
             <span className="text-[10px] font-bold">جاري الفحص التلقائي...</span>
          </div>
        </div>
      )}

      {status === 'verifying' && (
        <div className="py-10"><Loader2 className="animate-spin text-primary mx-auto" size={48} /><p className="mt-4 font-bold">جاري التوثيق...</p></div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <ShieldCheck className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">تم التوثيق!</h2>
          <p className="text-sm">جاري توجيهك للمحفظة الآن...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">خطأ في التوثيق</h2>
          <Button asChild className="royal-button w-full"><Link href="/login">العودة للدخول</Link></Button>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <Navbar />
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}