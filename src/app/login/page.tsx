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
import { Loader2, Shield, CheckCircle2, UserPlus, Mail, Lock, User, Phone, Sparkles, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();
  const { user, isVerified } = useUser();

  useEffect(() => {
    if (user && isVerified) {
      router.replace("/wallet");
    }
  }, [user, isVerified, router]);

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
        await syncUserProfile(res.user);
        if (!res.user.emailVerified) {
          toast({ variant: "destructive", title: "الحساب قيد التفعيل", description: "يرجى النقر على الرابط المرسل لبريدك." });
          router.push("/verify-email?waiting=true");
          return;
        }
        toast({ title: "مرحباً بك مجدداً", description: "تم الدخول الآمن لنظام XMOOD." });
        router.replace("/wallet");
      }
    } catch (error: any) {
      let msg = "تأكد من صحة البيانات والمحاولة مجدداً.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل لدينا بالفعل.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة.";
      if (error.code === 'auth/user-not-found') msg = "لا يوجد حساب بهذا البريد.";
      toast({ variant: "destructive", title: "فشل العملية", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 relative overflow-hidden" dir="rtl">
      <Navbar />
      
      {/* 🌌 Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
         <motion.div 
           animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full" 
         />
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
           transition={{ duration: 15, repeat: Infinity, delay: 2 }}
           className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full" 
         />
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-xl"
        >
          <Card className="luxury-card border-white/5 bg-zinc-900/60 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-12 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
               <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/20 group hover:scale-110 transition-transform duration-500">
                  <KeyRound size={44} className="text-primary group-hover:rotate-12 transition-transform" />
               </div>
               <h2 className="text-4xl md:text-6xl font-headline font-black gold-text mb-2">بوابة النخبة</h2>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mt-2">Identity & Secure Access</p>
            </div>

            <CardContent className="px-8 md:px-16 pb-16">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-12 p-1.5 bg-black/40 rounded-[1.5rem] border border-white/5">
                  <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {activeTab === 'login' ? (
                      <div className="space-y-8">
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <Label className="text-[11px] font-black uppercase text-primary/80 pr-4 flex items-center gap-2"><Mail size={14} /> البريد الإلكتروني</Label>
                              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="example@xmood.com" className="h-16 text-center bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-700" />
                           </div>
                           <div className="space-y-3">
                              <Label className="text-[11px] font-black uppercase text-primary/80 pr-4 flex items-center gap-2"><Lock size={14} /> كلمة المرور</Label>
                              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-16 text-center bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-700" />
                           </div>
                        </div>
                        <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full royal-button h-20 text-xl shadow-xl shadow-primary/20">
                          {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={24} className="ml-3" /> دخول آمن</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <Label className="text-[11px] font-black uppercase text-primary/80 pr-4"><User size={14} className="inline ml-2" /> الاسم</Label>
                               <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Name" className="h-14 bg-zinc-950/50 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[11px] font-black uppercase text-primary/80 pr-4"><Phone size={14} className="inline ml-2" /> الهاتف</Label>
                               <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." className="h-14 bg-zinc-950/50 border-white/10 text-white" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase text-primary/80 pr-4"><Mail size={14} className="inline ml-2" /> البريد</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@example.com" className="h-14 bg-zinc-950/50 border-white/10 text-white" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase text-primary/80 pr-4"><Lock size={14} className="inline ml-2" /> كلمة المرور</Label>
                            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-14 bg-zinc-950/50 border-white/10 text-white" />
                         </div>
                         <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full royal-button h-20 text-xl mt-4 shadow-xl">
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={24} className="ml-3" /> إنشاء العضوية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          <p className="text-center mt-10 text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Precision Security by XMOOD Cloud Engine</p>
        </motion.div>
      </div>
    </main>
  );
}