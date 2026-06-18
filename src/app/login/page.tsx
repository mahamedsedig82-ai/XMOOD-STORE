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
import { Loader2, UserPlus, Mail, Lock, KeyRound, Sparkles, ShieldCheck, Phone, User, Fingerprint } from "lucide-react";
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
    <main className="min-h-screen bg-[#020202] relative overflow-hidden" dir="rtl">
      <Navbar />
      
      {/* 🌌 Atmospheric Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-900/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <Card className="emerald-glass rounded-[3.5rem] border-white/5 overflow-hidden">
            <div className="p-12 text-center border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
               <motion.div 
                 initial={{ scale: 0.8 }} 
                 animate={{ scale: 1 }} 
                 className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-primary/20"
               >
                  <Fingerprint size={48} className="text-primary" />
               </motion.div>
               <h2 className="text-5xl font-headline font-black gold-text mb-2 tracking-tighter">بوابة النخبة</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.6em] opacity-80">Sovereign Identity Access</p>
            </div>

            <CardContent className="p-10 md:p-16">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-12 p-2 bg-black/40 rounded-3xl border border-white/10 h-20">
                  <TabsTrigger value="login" className="rounded-2xl font-black text-[11px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all shadow-xl">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-2xl font-black text-[11px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all shadow-xl">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-10"
                  >
                    {activeTab === 'login' ? (
                      <div className="space-y-10">
                        <div className="space-y-8">
                           <div className="space-y-3 group">
                              <Label className="text-[10px] font-black uppercase text-primary/60 pr-6 tracking-widest flex items-center gap-3 transition-colors group-focus-within:text-primary">
                                <Mail size={16} /> البريد الإلكتروني
                              </Label>
                              <div className="gold-glow-border rounded-[1.5rem]">
                                <Input 
                                  value={email} 
                                  onChange={e => setEmail(e.target.value)} 
                                  type="email" 
                                  placeholder="admin@xmood.pro" 
                                  className="h-18 text-center text-xl !bg-transparent border-none shadow-none" 
                                />
                              </div>
                           </div>
                           <div className="space-y-3 group">
                              <Label className="text-[10px] font-black uppercase text-primary/60 pr-6 tracking-widest flex items-center gap-3 transition-colors group-focus-within:text-primary">
                                <Lock size={16} /> كلمة المرور السيادية
                              </Label>
                              <div className="gold-glow-border rounded-[1.5rem]">
                                <Input 
                                  value={password} 
                                  onChange={e => setPassword(e.target.value)} 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="h-18 text-center text-xl !bg-transparent border-none shadow-none" 
                                />
                              </div>
                           </div>
                        </div>
                        <Button 
                          onClick={() => handleAuth('login')} 
                          disabled={loading} 
                          className="w-full h-20 rounded-[2rem] bg-primary text-black font-black text-xl shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={28} className="ml-4" /> تأمين الدخول</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black text-primary/60 pr-6 uppercase">الاسم الكامل</Label>
                               <div className="gold-glow-border rounded-2xl">
                                  <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 text-sm !bg-transparent border-none" placeholder="Elite Member Name" />
                               </div>
                            </div>
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black text-primary/60 pr-6 uppercase">رقم الهاتف</Label>
                               <div className="gold-glow-border rounded-2xl">
                                  <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-14 text-sm font-mono !bg-transparent border-none" placeholder="+966..." />
                               </div>
                            </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary/60 pr-6 uppercase">البريد الإلكتروني المعتمد</Label>
                            <div className="gold-glow-border rounded-2xl">
                               <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-14 text-sm !bg-transparent border-none" placeholder="email@sovereign.pro" />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary/60 pr-6 uppercase">كلمة المرور</Label>
                            <div className="gold-glow-border rounded-2xl">
                               <Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-14 text-sm !bg-transparent border-none" placeholder="••••••••" />
                            </div>
                         </div>
                         <Button 
                           onClick={() => handleAuth('signup')} 
                           disabled={loading} 
                           className="w-full h-20 rounded-[2rem] bg-primary text-black font-black text-xl mt-6 shadow-[0_20px_50px_rgba(212,175,55,0.2)]"
                         >
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={28} className="ml-4" /> إنشاء عضوية نُخبوية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          <div className="text-center mt-12 space-y-2 opacity-50">
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.8em]">
               Precision Secure Access Engine
             </p>
             <p className="text-[8px] font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-3">
               <Sparkles size={10} /> Powered by XMOOD Cloud Intelligence <Sparkles size={10} />
             </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}