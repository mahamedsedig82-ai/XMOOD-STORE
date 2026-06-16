"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "@/lib/auth";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const user = await loginWithGoogle();
      // user will be null if Redirect started
      if (user) {
        toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في عالم XMOOD." });
        router.replace("/");
      }
    } catch (error: any) {
      // Ignore user-closed popup to prevent noisy errors
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Auth Error:", error);
        toast({ 
          variant: "destructive", 
          title: "فشل الدخول", 
          description: "حدث خطأ أثناء المصادقة، يرجى المحاولة لاحقاً." 
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <Button 
      type="button" 
      onClick={handleLogin} 
      disabled={isLoading}
      variant="outline" 
      className="w-full h-16 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 font-black text-[10px] gap-4 tracking-widest transition-all relative overflow-hidden"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin w-5 h-5 text-primary" />
          <span className="animate-pulse">جاري تأمين الاتصال...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.84h2.64c1.66-1.53 2.63-3.79 2.63-6.27z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.64-2.84c-.73.49-1.66.78-2.64.78-2.85 0-5.27-1.92-6.13-4.51H3.18v2.92C5 20.15 8.24 23 12 23z" />
            <path fill="#FBBC05" d="M5.87 13.77c-.22-.66-.35-1.36-.35-2.07s.13-1.41.35-2.07V6.71H3.18C2.42 8.3 2 10.1 2 12s.42 3.7 1.18 5.29l2.69-3.52z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.24 1 5 3.85 3.18 6.71l2.69 2.92c.86-2.59 3.28-4.51 6.13-4.51z" />
          </svg>
          CONTINUE WITH GOOGLE
        </>
      )}
    </Button>
  );
}
