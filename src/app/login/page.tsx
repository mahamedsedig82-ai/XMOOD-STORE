"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { loginEmail, registerEmail, sendAccountVerification, syncUserProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function LoginPage() {
  // 🛡️ Login State
  const [loginEmailVal, setLoginEmailVal] = useState("");
  const [loginPassVal, setLoginPassVal] = useState("");
  
  // 🛡️ Signup State
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

  useEffect(() => {
    if (isMounted && authSettled && !authLoading && user && profile) {
      if (user.emailVerified || profile.isVerified) {
        router.replace("/wallet");
      } else {
        router.replace("/verify-email?waiting=true");
      }
    }
  }, [user, profile, authLoading, authSettled, isMounted, router]);

  // 🛡️ Enhanced Validation for maximum compatibility
  const isBasicEmail = (email: string) => {
    const clean = email.replace(/\s/g, '');
    return clean.length > 5 && clean.includes('@') && clean.includes('.');
  };

  const handleLogin = async () => {
    const email = loginEmailVal.trim();
    if (!email || !loginPassVal) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة البريد وكلمة المرور." });
    }

    setLoading(true);
    try {
      await loginEmail(email, loginPassVal);
      toast({ title: "تم الدخول بنجاح" });
    } catch (error: any) {
      console.error("[LOGIN_ERROR]", error);
      let msg = "بيانات الدخول غير صحيحة.";
      if (error.code === 'auth/invalid-email') msg = "تنسيق البريد الإلكتروني غير صالح.";
      if (error.code === 'auth/user-not-found') msg = "المستخدم غير موجود.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة.";
      
      toast({ variant: "destructive", title: "تنبيه أمني", description: msg });
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const email = signupEmailVal.replace(/\s/g, ''); // Remove all spaces immediately
    const pass = signupPassVal;
    const name = fullName.trim();
    const ph = phone.trim();

    if (!email || !pass || !name || !ph) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة حقول الاشتراك." });
    }

    if (!isBasicEmail(email)) {
      return toast({ variant: "destructive", title: "تنسيق غير مقبول", description: "يرجى التأكد من كتابة البريد الإلكتروني بشكل صحيح (مثال: user@domain.com)." });
    }

    setLoading(true);
    try {
      // 1. Create Auth & Sync Profile
      await registerEmail(email, pass, name);
      
      // 2. Extra sync for phone
      if (auth.currentUser) {
        await syncUserProfile(auth.currentUser, { phoneNumber: ph });
        await sendAccountVerification(auth.currentUser);
      }
      
      toast({ title: "تم إنشاء العضوية بنجاح", description: "يرجى تفعيل بريدك الإلكتروني الآن." });
    } catch (error: any) {
      console.error("[SIGNUP_ERROR]", error);
      let msg = "فشل إنشاء الحساب.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل مسبقاً لدينا.";
      if (error.code === 'auth/invalid-email') msg = "Firebase: تنسيق البريد الإلكتروني المرفوع غير صالح.";
      if (error.code === 'auth/weak-password') msg = "كلمة المرور ضعيفة جداً (6 رموز كحد أدنى).";
      
      toast({ variant: "destructive", title: "تنبيه", description: msg });
      setLoading(false);
    }
  };

  if (!isMounted) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="animate-spin text-primary" size={60} />
      <p className="text-[10px] font-black uppercase tracking-widest gold-text">Securing Entry Node...</p>
    </div>
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
                        id="login-email-field"
                        name="login-email"
                        autoComplete="email"
                        spellCheck={false}
                        value={loginEmailVal} 
                        onChange={e => setLoginEmailVal(e.target.value)} 
                        type="email" 
                        placeholder="user@xmood.pro" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-primary/80 pr-3">مفتاح المرور</Label>
                      <Input 
                        id="login-pass-field"
                        name="login-password"
                        autoComplete="current-password"
                        value={loginPassVal} 
                        onChange={e => setLoginPassVal(e.target.value)} 
                        type="password" 
                        placeholder="••••••••" 
                      />
                   </div>
                  <Button onClick={handleLogin} disabled={loading} className="royal-button w-full h-14 text-[10px] mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} className="ml-2" /> تأمين الدخول</>}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-primary/80 pr-3">الاسم الكامل</Label>
                        <Input id="signup-name-field" name="full-name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="الاسم الرباعي" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-primary/80 pr-3">رقم الجوال</Label>
                        <Input id="signup-phone-field" name="phone-number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-primary/80 pr-3">البريد الإلكتروني</Label>
                      <Input 
                        id="signup-email-field"
                        name="signup-email"
                        autoComplete="email"
                        spellCheck={false}
                        value={signupEmailVal} 
                        onChange={e => setSignupEmailVal(e.target.value)} 
                        type="email" 
                        placeholder="new-user@xmood.pro"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-primary/80 pr-3">كلمة المرور</Label>
                      <Input 
                        id="signup-pass-field"
                        name="signup-password"
                        autoComplete="new-password"
                        value={signupPassVal} 
                        onChange={e => setSignupPassVal(e.target.value)} 
                        type="password" 
                        placeholder="••••••••"
                      />
                   </div>
                   <Button onClick={handleSignup} disabled={loading} className="royal-button w-full h-14 text-[10px] mt-2">
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
