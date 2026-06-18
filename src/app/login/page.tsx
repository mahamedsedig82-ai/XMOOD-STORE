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
import { Loader2, CheckCircle2, UserPlus, Mail, Lock, User, Phone, KeyRound, Sparkles, ShieldCheck } from "lucide-react";
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
        toast({ title: "تم إنشاء العضوية الأسطورية", description: "يرجى تفعيل بريدك الإلكتروني عبر الرابط المرسل." });
        router.push("/verify-email?waiting=true");
      } else {
        const res = await loginEmail(email, password);
        await syncUserProfile(res.user);
        if (!res.user.emailVerified) {
          toast({ variant: "destructive", title: "الحساب قيد التفعيل", description: "يرجى النقر على الرابط المرسل لبريدك." });
          router.push("/verify-email?waiting=true");
          return;
        }
        toast({ title: "مرحباً بك في عالم XMOOD", description: "تم الدخول الآمن لنظام النخبة." });
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
    <main className="min-h-screen bg-[#050505] relative overflow-hidden" dir="rtl">
      <Navbar />
      
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none">
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
           transition={{ duration: 15, repeat: Infinity }}
           className="absolute top-[-20%] right-[-10%] w-[1200px] h-[1200px] bg-emerald-900/20 blur-[200px] rounded-full" 
         />
         <motion.div 
           animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
           transition={{ duration: 20, repeat: Infinity, delay: 2 }}
           className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-amber-600/10 blur-[180px] rounded-full" 
         />
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <Card className="emerald-glass rounded-[4rem] overflow-hidden border-white/5 relative">
            {/* Animated Glow Border */}
            <div className="absolute inset-0 border-2 border-primary/20 rounded-[4rem] pointer-events-none" />
            
            <div className="p-16 text-center relative border-b border-white/5 bg-white/[0.02]">
               <motion.div 
                 whileHover={{ rotate: 15, scale: 1.1 }}
                 className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(212,175,55,0.2)] border border-primary/30 group"
               >
                  <KeyRound size={56} className="text-primary group-hover:gold-text transition-all" />
               </motion.div>
               <h2 className="text-6xl md:text-8xl font-headline font-black gold-text mb-2 tracking-tighter">بوابة النخبة</h2>
               <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.8em] mt-4 opacity-70">Identity & Secure Access</p>
            </div>

            <CardContent className="px-10 md:px-20 pb-20 pt-16">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-16 p-2 bg-black/60 rounded-[2.5rem] border border-white/10 shadow-2xl">
                  <TabsTrigger value="login" className="rounded-[2rem] font-black text-[11px] uppercase py-6 data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-500">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-[2rem] font-black text-[11px] uppercase py-6 data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-500">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-12"
                  >
                    {activeTab === 'login' ? (
                      <div className="space-y-12">
                        <div className="space-y-8">
                           <div className="space-y-4">
                              <Label className="text-[12px] font-black uppercase text-primary/70 pr-8 flex items-center gap-4">
                                <Mail size={18} /> البريد الإلكتروني
                              </Label>
                              <Input 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                type="email" 
                                placeholder="example@xmood.com" 
                                className="h-20 text-center bg-black/40 border-primary/30 text-white placeholder:text-zinc-700 shadow-2xl text-xl rounded-[2.2rem]" 
                              />
                           </div>
                           <div className="space-y-4">
                              <Label className="text-[12px] font-black uppercase text-primary/70 pr-8 flex items-center gap-4">
                                <Lock size={18} /> كلمة المرور
                              </Label>
                              <Input 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                type="password" 
                                placeholder="••••••••" 
                                className="h-20 text-center bg-black/40 border-primary/30 text-white placeholder:text-zinc-700 shadow-2xl text-xl rounded-[2.2rem]" 
                              />
                           </div>
                        </div>
                        <Button 
                          onClick={() => handleAuth('login')} 
                          disabled={loading} 
                          className="w-full royal-button h-24 text-3xl shadow-[0_20px_50px_rgba(212,175,55,0.3)] rounded-[2.5rem]"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={36} className="ml-5" /> دخول آمن للنظام</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-10">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <Label className="text-[12px] font-black uppercase text-primary/70 pr-8">الاسم الكامل</Label>
                               <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="h-18 bg-black/40 border-white/10 text-white shadow-xl rounded-[2rem] text-lg" />
                            </div>
                            <div className="space-y-4">
                               <Label className="text-[12px] font-black uppercase text-primary/70 pr-8">رقم الهاتف</Label>
                               <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." className="h-18 bg-black/40 border-white/10 text-white shadow-xl rounded-[2rem] text-lg" />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <Label className="text-[12px] font-black uppercase text-primary/70 pr-8">البريد الإلكتروني</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@example.com" className="h-18 bg-black/40 border-white/10 text-white shadow-xl rounded-[2rem] text-lg" />
                         </div>
                         <div className="space-y-4">
                            <Label className="text-[12px] font-black uppercase text-primary/70 pr-8">كلمة المرور</Label>
                            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-18 bg-black/40 border-white/10 text-white shadow-xl rounded-[2rem] text-lg" />
                         </div>
                         <Button 
                           onClick={() => handleAuth('signup')} 
                           disabled={loading} 
                           className="w-full royal-button h-24 text-3xl mt-8 shadow-[0_20px_50px_rgba(212,175,55,0.3)] rounded-[2.5rem]"
                         >
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={36} className="ml-5" /> إنشاء العضوية السيادية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          <p className="text-center mt-16 text-[11px] font-black text-zinc-600 uppercase tracking-[0.6em] opacity-50">
            <Sparkles size={12} className="inline mr-2 text-primary" /> 
            Precision Security by XMOOD Cloud Intelligence
          </p>
        </motion.div>
      </div>
    </main>
  );
}