
"use client";

import { useEffect, useState } from "react";
import { completeMagicLinkSignIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, XCircle, Home, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      try {
        const user = await completeMagicLinkSignIn();
        if (user) {
          setStatus('success');
          setTimeout(() => router.push("/wallet"), 2500);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <Card className="w-full max-w-lg p-10 md:p-16 text-center luxury-card border-none bg-card shadow-2xl">
        {status === 'verifying' && (
          <div className="space-y-8">
            <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto" />
            <div className="space-y-2">
              <h2 className="text-3xl font-black gold-text">جاري التحقق السيادي</h2>
              <p className="text-muted-foreground font-medium">نحن نوثق هويتك الرقمية الآن، يرجى الانتظار...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-8 animate-fade-in">
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
               <ShieldCheck className="w-14 h-14" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black gold-text">تم التوثيق بنجاح!</h2>
              <p className="text-muted-foreground font-medium">مرحباً بك في مجتمع XMOOD، يتم توجيهك للمحفظة الآن.</p>
            </div>
            <div className="pt-6">
               <Button asChild className="royal-button w-full h-14">
                  <a href="/wallet"><Wallet className="ml-2" size={18} /> فتح المحفظة فوراً</a>
               </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-8 animate-fade-in">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
               <XCircle className="w-14 h-14" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-red-500">فشل في التوثيق</h2>
              <p className="text-muted-foreground font-medium">عذراً، هذا الرابط قديم أو تم استخدامه مسبقاً.</p>
            </div>
            <div className="pt-6 flex flex-col gap-4">
               <Button asChild className="royal-button w-full h-14">
                  <a href="/login">العودة لصفحة الدخول</a>
               </Button>
               <Button asChild variant="ghost" className="w-full h-14 font-black uppercase text-[10px] tracking-widest">
                  <a href="/"><Home className="ml-2" size={16} /> العودة للرئيسية</a>
               </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
