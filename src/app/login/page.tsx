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
import { Loader2, CheckCircle2, UserPlus, Mail, Lock, User, Phone, KeyRound } from "lucide-react";
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
      
      <div className="fixed inset-0 pointer-events-none">
         <motion.div 
           animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
           transition={{ duration: 12, repeat: Infinity }}
           className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/20 blur-[180px] rounded-full" 
         />
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
           transition={{ duration: 18, repeat: Infinity, delay: 3 }}
           className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-amber-500/10 blur-[150px] rounded-full" 
         />
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-xl"
        >
          <Card className="luxury-card border-white/5 bg-zinc-900/80 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)] rounded-[3.5rem] overflow-hidden">
            <div className="p-12 text-center relative border-b border-white/5">
               <div className="w-28 h-28 bg-primary/10 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/20 group hover:scale-110 transition-transform duration-500">
                  <KeyRound size={48} className="text-primary group-hover:rotate-12 transition-transform" />
               </div>
               <h2 className="text-5xl md:text-7xl font-headline font-black gold-text mb-2 tracking-tighter">بوابة النخبة</h2>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em] mt-3">Identity & Secure Access</p>
            </div>

            <CardContent className="px-8 md:px-16 pb-16 pt-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-12 p-2 bg-black/50 rounded-[2rem] border border-white/10 shadow-2xl">
                  <TabsTrigger value="login" className="rounded-[1.5rem] font-black text-[10px] uppercase py-5 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-[1.5rem] font-black text-[10px] uppercase py-5 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-10"
                  >
                    {activeTab === 'login' ? (
                      <div className="space-y-10">
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <Label className="text-[11px] font-black uppercase text-primary/80 pr-6 flex items-center gap-3"><Mail size={16} /> البريد الإلكتروني</Label>
                              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="example@xmood.com" className="h-18 text-center bg-zinc-950/80 border-primary/20 text-white placeholder:text-zinc-700 shadow-2xl text-lg" />
                           </div>
                           <div className="space-y-3">
                              <Label className="text-[11px] font-black uppercase text-primary/80 pr-6 flex items-center gap-3"><Lock size={16} /> كلمة المرور</Label>
                              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-18 text-center bg-zinc-950/80 border-primary/20 text-white placeholder:text-zinc-700 shadow-2xl text-lg" />
                           </div>
                        </div>
                        <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full royal-button h-24 text-2xl shadow-primary/40 rounded-[2rem]">
                          {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={32} className="ml-4" /> دخول آمن للنظام</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <Label className="text-[11px] font-black uppercase text-primary/80 pr-6"><User size={16} className="inline ml-2" /> الاسم الكامل</Label>
                               <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="h-16 bg-zinc-950/80 border-primary/10 text-white shadow-xl" />
                            </div>
                            <div className="space-y-3">
                               <Label className="text-[11px] font-black uppercase text-primary/80 pr-6"><Phone size={16} className="inline ml-2" /> رقم الهاتف</Label>
                               <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." className="h-16 bg-zinc-950/80 border-primary/10 text-white shadow-xl" />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase text-primary/80 pr-6"><Mail size={16} className="inline ml-2" /> البريد الإلكتروني</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@example.com" className="h-16 bg-zinc-950/80 border-primary/10 text-white shadow-xl" />
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase text-primary/80 pr-6"><Lock size={16} className="inline ml-2" /> كلمة المرور</Label>
                            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-16 bg-zinc-950/80 border-primary/10 text-white shadow-xl" />
                         </div>
                         <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full royal-button h-24 text-2xl mt-6 shadow-primary/30 rounded-[2rem]">
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={32} className="ml-4" /> إنشاء العضوية السيادية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          <p className="text-center mt-12 text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] opacity-40">Precision Security by XMOOD Cloud Intelligence</p>
        </motion.div>
      </div>
    </main>
  );
}