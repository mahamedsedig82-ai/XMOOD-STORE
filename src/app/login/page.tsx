"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { loginEmail, registerEmail, sendAccountVerification } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function LoginPage() {
  // 🛡️ Separate States to prevent tab-switching corruption
  const [loginEmailVal, setLoginEmailVal] = useState("");
  const [loginPassVal, setLoginPassVal] = useState("");
  
  const [signupEmailVal, setSignupEmailVal] = useState("");
  const [signupPassVal, setSignupPassVal] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const { user, profile, loading: authLoading, authSettled } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🛡️ Safe Redirect Orchestration
  useEffect(() => {
    if (isMounted && authSettled && !authLoading && user && profile) {
      if (user.emailVerified || profile.isVerified) {
        router.replace("/wallet");
      } else {
        router.replace("/verify-email?waiting=true");
      }
    }
  }, [user, profile, authLoading, authSettled, isMounted, router]);

  const validateEmail = (emailStr: string) => {
    return String(emailStr)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleAuth = async (type: 'login' | 'signup') => {
    const currentEmail = type === 'signup' ? signupEmailVal.trim() : loginEmailVal.trim();
    const currentPass = type === 'signup' ? signupPassVal : loginPassVal;

    if (!currentEmail || !currentPass) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة البريد وكلمة المرور." });
    }

    if (!validateEmail(currentEmail)) {
      return toast({ variant: "destructive", title: "تنسيق خاطئ", description: "يرجى إدخال بريد إلكتروني صالح." });
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        if (!fullName.trim() || !phone.trim()) {
          toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة حقول الاشتراك." });
          setLoading(false);
          return;
        }
        
        const res = await registerEmail(currentEmail, currentPass, fullName);
        // Sync phone number after initial creation
        const { syncUserProfile } = await import("@/lib/auth");
        await syncUserProfile(res.user, { phoneNumber: phone });
        
        await sendAccountVerification(res.user);
        toast({ title: "تم إنشاء العضوية", description: "يرجى تفعيل بريدك الإلكتروني الآن." });
      } else {
        await loginEmail(currentEmail, currentPass);
        toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في عالم XMOOD." });
      }
    } catch (error: any) {
      console.error("[AUTH_ERROR]", error);
      let msg = "فشل في المصادقة. تأكد من صحة البيانات.";
      if (error.code === 'auth/invalid-email') msg = "تنسيق البريد الإلكتروني غير صالح.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل مسبقاً.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') msg = "البيانات غير صحيحة.";
      toast({ variant: "destructive", title: "تنبيه أمني", description: msg });
      setLoading(false);
    }
  };

  // 🛡️ Consistent Loader Structure to prevent Hydration Mismatch
  if (!isMounted) return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4" dir="rtl">
      <Loader2 className="animate-spin text-primary" size={60} />
      <p className="text-[10px] font-black uppercase tracking-widest gold-text">Initializing Sovereign Portal...</p>
    </main>
  );

  // Still Loading Auth State
  if (authLoading && !user) return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4" dir="rtl">
      <Loader2 className="animate-spin text-primary" size={60} />
      <p className="text-[10px] font-black uppercase tracking-widest gold-text">Securing Node Access...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      <Navbar />
      <div className="container min-h-screen flex items-center justify-center pt-24 pb-12 relative z-10 px-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl">
            <div className="p-8 text-center border-b border-white/5 flex flex-col items-center bg-muted/10 gap-5">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full scale-125 opacity-30" />
                  {config?.appearance?.logoUrl ? (
                    <img src={config.appearance.logoUrl} className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-2 border-primary/20 shadow-xl relative z-10" alt="Logo" />
                  ) : (
                    <h2 className="handwritten-logo !text-2xl relative z-10" style={{ direction: 'ltr' }}>XMOOD STORE</h2>
                  )}
               </div>
               <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20 uppercase tracking-widest px-4 py-1 rounded-full bg-primary/5">Sovereign Identity Access</Badge>
            </div>

            <CardContent className="p-6 md:p-10">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/40 rounded-xl h-12 border">
                  <TabsTrigger value="login" className="rounded-lg font-black text-[9px] uppercase">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg font-black text-[9px] uppercase">إنشاء حساب</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-primary/80 pr-3">البريد الإلكتروني</Label>
                      <Input 
                        id="login-email"
                        autoComplete="email"
                        value={loginEmailVal} 
                        onChange={e => setLoginEmailVal(e.target.value)} 
                        type="email" 
                        placeholder="user@xmood.pro" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-primary/80 pr-3">مفتاح المرور</Label>
                      <Input 
                        id="login-password"
                        autoComplete="current-password"
                        value={loginPassVal} 
                        onChange={e => setLoginPassVal(e.target.value)} 
                        type="password" 
                        placeholder="••••••••" 
                      />
                   </div>
                  <Button onClick={() => handleAuth('login')} disabled={loading} className="royal-button w-full h-14 text-[10px] mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} className="ml-2" /> تأمين الدخول</>}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black text-primary/80 pr-3">الاسم الكامل</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="الاسم الرباعي" /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-black text-primary/80 pr-3">رقم الجوال</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." /></div>
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-primary/80 pr-3">البريد الإلكتروني</Label>
                      <Input 
                        id="signup-email"
                        autoComplete="email"
                        value={signupEmailVal} 
                        onChange={e => setSignupEmailVal(e.target.value)} 
                        type="email" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-primary/80 pr-3">كلمة المرور</Label>
                      <Input 
                        id="signup-password"
                        autoComplete="new-password"
                        value={signupPassVal} 
                        onChange={e => setSignupPassVal(e.target.value)} 
                        type="password" 
                      />
                   </div>
                   <Button onClick={() => handleAuth('signup')} disabled={loading} className="royal-button w-full h-14 text-[10px] mt-2">
                     {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} className="ml-2" /> إنشاء العضوية</>}
                   </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
