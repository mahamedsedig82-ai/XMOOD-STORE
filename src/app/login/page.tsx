"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { loginEmail, registerEmail, syncUserProfile, sendAccountVerification } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, Shield, CheckCircle2, UserPlus, Zap, Mail, Lock, User, Phone, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الحقول المطلوبة." });
    }

    if (type === 'signup' && (!fullName || !phone)) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال اسمك وهاتفك للتواصل." });
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await registerEmail(email, password, fullName);
        await syncUserProfile(res.user, { displayName: fullName, phoneNumber: phone });
        await sendAccountVerification(res.user);
        toast({ title: "تم إنشاء العضوية", description: "يرجى تفعيل بريدك الإلكتروني عبر الرابط المرسل." });
        router.push("/verify-email?waiting=true");
      } else {
        const res = await loginEmail(email, password);
        if (!res.user.emailVerified) {
          toast({ variant: "destructive", title: "الحساب قيد التفعيل", description: "يرجى النقر على الرابط المرسل لبريدك." });
          router.push("/verify-email?waiting=true");
          return;
        }
        await syncUserProfile(res.user);
        toast({ title: "مرحباً بك مجدداً", description: "تم الدخول الآمن لنظام XMOOD." });
        router.replace("/wallet");
      }
    } catch (error: any) {
      let msg = "تأكد من صحة البيانات والمحاولة مجدداً.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل لدينا بالفعل.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة.";
      if (error.code === 'auth/user-not-found') msg = "لا يوجد حساب بهذا البريد.";
      toast({ variant: "destructive", title: "فشل الدخول", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      <Navbar />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             opacity: [0.1, 0.2, 0.1] 
           }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/20 blur-[180px] rounded-full" 
         />
         <motion.div 
           animate={{ 
             scale: [1, 1.1, 1],
             opacity: [0.05, 0.15, 0.05] 
           }}
           transition={{ duration: 8, repeat: Infinity, delay: 2 }}
           className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full" 
         />
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 pb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <Card className="luxury-card border-none bg-card/60 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]">
            <div className="p-10 text-center relative">
               <div className="absolute top-4 left-4 opacity-20"><Sparkles className="text-primary" /></div>
               <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/20">
                  <Shield size={48} className="text-primary" />
               </div>
               <h2 className="text-4xl md:text-5xl font-headline font-black gold-text mb-2">بوابة النخبة</h2>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Elite Identity & Secure Access</p>
            </div>

            <CardContent className="px-8 md:px-16 pb-16">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-12 p-1.5 bg-muted/40 rounded-2xl border">
                  <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-500">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-500">إنشاء عضوية</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <TabsContent value="login" className="space-y-8 mt-0 border-none outline-none ring-0">
                      <div className="space-y-6">
                        <div className="space-y-2 relative">
                          <Label className="text-[11px] font-black uppercase text-primary pr-4 flex items-center gap-2">
                             <Mail size={14} /> البريد الإلكتروني
                          </Label>
                          <div className="relative">
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email" className="h-18 pr-6 pl-6 text-center lg:text-right" />
                          </div>
                        </div>
                        <div className="space-y-2 relative">
                          <Label className="text-[11px] font-black uppercase text-primary pr-4 flex items-center gap-2">
                             <Lock size={14} /> كلمة المرور
                          </Label>
                          <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-18 text-center" />
                        </div>
                      </div>
                      <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full royal-button h-20 text-xl shadow-xl">
                        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={24} className="ml-3" /> دخول آمن</>}
                      </Button>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-6 mt-0 border-none outline-none ring-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase text-primary pr-4 flex items-center gap-2"><User size={14} /> الاسم الكامل</Label>
                          <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Name" className="h-14 text-center md:text-right" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase text-primary pr-4 flex items-center gap-2"><Phone size={14} /> الهاتف</Label>
                          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." className="h-14 text-center" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-primary pr-4 flex items-center gap-2"><Mail size={14} /> البريد الإلكتروني</Label>
                        <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@example.com" className="h-14 text-center md:text-right" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-primary pr-4 flex items-center gap-2"><Lock size={14} /> كلمة المرور</Label>
                        <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-14 text-center" />
                      </div>
                      <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full royal-button h-20 text-xl shadow-xl mt-4">
                        {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={24} className="ml-3" /> إنشاء العضوية</>}
                      </Button>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
            
            <div className="p-8 border-t border-primary/10 bg-muted/20 text-center opacity-40">
               <p className="text-[8px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-3">
                 <Zap size={10} className="text-primary" /> XMOOD ENCRYPTION SECURED <Zap size={10} className="text-primary" />
               </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
