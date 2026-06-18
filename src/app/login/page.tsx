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
import { Loader2, UserPlus, Mail, Lock, KeyRound, Sparkles, ShieldCheck, Phone, User } from "lucide-react";
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
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-xl"
        >
          <Card className="luxury-card border-white/5 bg-zinc-950/80 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div className="p-10 text-center border-b border-white/5 bg-white/[0.02]">
               <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-primary/20">
                  <KeyRound size={40} className="text-primary" />
               </div>
               <h2 className="text-4xl font-headline font-black gold-text mb-1">بوابة النخبة</h2>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-60">Identity & Secure Access</p>
            </div>

            <CardContent className="p-8 md:p-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-10 p-1.5 bg-black/60 rounded-2xl border border-white/10">
                  <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {activeTab === 'login' ? (
                      <div className="space-y-8">
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-primary/70 pr-4 flex items-center gap-2"><Mail size={14} /> البريد الإلكتروني</Label>
                              <Input 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                type="email" 
                                placeholder="name@example.com" 
                                className="h-16 text-center text-lg rounded-2xl" 
                              />
                           </div>
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-primary/70 pr-4 flex items-center gap-2"><Lock size={14} /> كلمة المرور</Label>
                              <Input 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                type="password" 
                                placeholder="••••••••" 
                                className="h-16 text-center text-lg rounded-2xl" 
                              />
                           </div>
                        </div>
                        <Button 
                          onClick={() => handleAuth('login')} 
                          disabled={loading} 
                          className="w-full royal-button h-18 text-lg shadow-primary/20"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24} className="ml-3" /> دخول آمن</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black text-primary/70 pr-4">الاسم بالكامل</Label>
                               <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 text-sm" placeholder="Full Name" />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black text-primary/70 pr-4">رقم الهاتف</Label>
                               <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-14 text-sm font-mono" placeholder="+966..." />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary/70 pr-4">البريد الإلكتروني</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-14 text-sm" placeholder="email@example.com" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary/70 pr-4">كلمة المرور</Label>
                            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-14 text-sm" placeholder="••••••••" />
                         </div>
                         <Button 
                           onClick={() => handleAuth('signup')} 
                           disabled={loading} 
                           className="w-full royal-button h-18 text-lg mt-4 shadow-primary/20"
                         >
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={24} className="ml-3" /> إنشاء عضوية سيادية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          <p className="text-center mt-10 text-[9px] font-black text-zinc-600 uppercase tracking-[0.6em] opacity-40">
            <Sparkles size={10} className="inline mr-2 text-primary" /> 
            Powered by XMOOD Cloud Intelligence
          </p>
        </motion.div>
      </div>
    </main>
  );
}