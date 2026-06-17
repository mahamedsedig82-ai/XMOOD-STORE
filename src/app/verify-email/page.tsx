
"use client";

import { useEffect, useState } from "react";
import { completeMagicLinkSignIn, syncUserProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, XCircle, Home, Wallet, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    const verify = async () => {
      try {
        // First try magic link
        const user = await completeMagicLinkSignIn();
        if (user) {
          setStatus('success');
          setTimeout(() => router.push("/wallet"), 3000);
          return;
        }

        // If not magic link, check if user is already logged in and verified
        if (auth) {
          onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser?.emailVerified) {
              await syncUserProfile(firebaseUser);
              setStatus('success');
              setTimeout(() => router.push("/wallet"), 3000);
            } else if (firebaseUser && !firebaseUser.emailVerified) {
              // Reload user to check verification status if they just clicked the link
              await firebaseUser.reload();
              if (firebaseUser.emailVerified) {
                await syncUserProfile(firebaseUser);
                setStatus('success');
                setTimeout(() => router.push("/wallet"), 3000);
              }
            }
          });
        }
      } catch (e) {
        console.error("Verification Error:", e);
        setStatus('error');
      }
    };
    verify();
  }, [router, auth]);

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
              <h2 className="text-3xl md:text-4xl font-black gold-text">جاري التحقق السيادي</h2>
              <p className="text-muted-foreground font-medium text-sm md:text-base">نحن نوثق هويتك الرقمية ونؤمن اتصالك الآن، يرجى الانتظار...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-10 animate-fade-in relative z-10">
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-green-500/20 shadow-xl shadow-green-500/10">
               <ShieldCheck className="w-14 h-14" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black gold-text">تم التوثيق بنجاح!</h2>
              <p className="text-muted-foreground font-medium">مرحباً بك في مجتمع XMOOD النُخبوي. يتم توجيهك للمحفظة السيادية الآن...</p>
            </div>
            <div className="pt-6">
               <Button asChild className="royal-button w-full h-16 text-lg shadow-2xl">
                  <a href="/wallet"><Wallet className="ml-3" size={20} /> فتح المحفظة فوراً</a>
               </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-10 animate-fade-in relative z-10">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-red-500/20 shadow-xl shadow-green-500/10">
               <XCircle className="w-14 h-14" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-red-500">فشل في التوثيق</h2>
              <p className="text-muted-foreground font-medium">عذراً، هذا الرابط قديم، تم استخدامه، أو انتهت صلاحيته الأمنية.</p>
            </div>
            <div className="pt-8 flex flex-col gap-4">
               <Button asChild className="royal-button w-full h-16 text-lg">
                  <a href="/login">العودة لصفحة الدخول</a>
               </Button>
               <Button asChild variant="ghost" className="w-full h-14 font-black uppercase text-[10px] tracking-[0.3em] opacity-60">
                  <a href="/"><Home className="ml-2" size={16} /> العودة للمنصة الرئيسية</a>
               </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
