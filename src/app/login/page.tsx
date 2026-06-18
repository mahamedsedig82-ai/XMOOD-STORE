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
import { Loader2, UserPlus, Mail, Lock, ShieldCheck, Phone, Fingerprint, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/firebase";

const DragonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" className="opacity-20" />
    <path d="M7 10c0-1.657 2.239-3 5-3s5 1.343 5 3" />
    <path d="M12 7v14" />
    <path d="M9 14l3 3 3-3" />
    <path d="M17 10c1.105 0 2 .895 2 2s-.895 2-2 2" />
    <path d="M7 10c-1.105 0-2 .895-2 2s.895 2 2 2" />
  </svg>
);

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
        
        toast({ 
          title: "تم إنشاء العضوية بنجاح", 
          description: "يرجى فحص بريدك (بما في ذلك Spam) لتفعيل الحساب.",
          duration: 8000
        });
        
        router.push("/verify-email?waiting=true");
      } else {
        const res = await loginEmail(email, password);
        await syncUserProfile(res.user);
        
        if (!res.user.emailVerified) {
          await sendAccountVerification(res.user);
          toast({ 
            variant: "destructive", 
            title: "الحساب غير موثق", 
            description: "تم إعادة إرسال رابط التفعيل. يرجى مراجعة صندوق الرسائل المزعجة (Spam)." 
          });
          router.push("/verify-email?waiting=true");
          return;
        }
        
        toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في نظام النخبة XMOOD STORE." });
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
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-900/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-32 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-2xl"
        >
          <Card className="emerald-glass rounded-[3.5rem] border-white/5 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <div className="p-10 md:p-14 text-center border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
               <motion.div 
                 initial={{ scale: 0.8, rotate: -20 }} 
                 animate={{ scale: 1, rotate: 0 }} 
                 className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-primary/20"
               >
                  <DragonIcon className="w-12 h-12 text-primary" />
               </motion.div>
               <h2 className="text-4xl md:text-5xl font-headline font-black gold-text mb-2 tracking-tighter uppercase">XMOOD STORE</h2>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] opacity-80">Sovereign Identity Access</p>
            </div>

            <CardContent className="p-8 md:p-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-12 p-1.5 bg-black/40 rounded-[2rem] border border-white/10 h-16 md:h-20">
                  <TabsTrigger value="login" className="rounded-[1.5rem] font-black text-[11px] uppercase py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all shadow-xl">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-[1.5rem] font-black text-[11px] uppercase py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all shadow-xl">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-10"
                  >
                    {activeTab === 'login' ? (
                      <div className="space-y-10">
                        <div className="space-y-8">
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-primary/70 pr-4 tracking-widest flex items-center gap-2">
                                <Mail size={14} /> البريد الإلكتروني المعتمد
                              </Label>
                              <Input 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                type="email" 
                                placeholder="email@xmood.pro" 
                                className="h-20 text-center text-xl bg-zinc-950/50 border-primary/30 gold-glow-border" 
                              />
                           </div>
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-primary/70 pr-4 tracking-widest flex items-center gap-2">
                                <Lock size={14} /> كلمة المرور السيادية
                              </Label>
                              <Input 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                type="password" 
                                placeholder="••••••••" 
                                className="h-20 text-center text-xl bg-zinc-950/50 border-primary/30 gold-glow-border" 
                              />
                           </div>
                        </div>
                        <Button 
                          onClick={() => handleAuth('login')} 
                          disabled={loading} 
                          className="w-full h-20 rounded-[2rem] bg-primary text-black font-black text-xl shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={28} className="ml-3" /> تأمين الدخول</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black text-primary/70 pr-4 uppercase">الاسم الكامل</Label>
                               <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-16 text-base bg-zinc-950/50 border-primary/20" placeholder="Elite Member Name" />
                            </div>
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black text-primary/70 pr-4 uppercase">رقم الهاتف</Label>
                               <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-16 text-base font-mono bg-zinc-950/50 border-primary/20" placeholder="+966..." />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary/70 pr-4 uppercase">البريد الإلكتروني الرسمي</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-16 text-base bg-zinc-950/50 border-primary/20" placeholder="user@sovereign.pro" />
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary/70 pr-4 uppercase">كلمة المرور</Label>
                            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-16 text-base bg-zinc-950/50 border-primary/20" placeholder="••••••••" />
                         </div>
                         
                         <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex gap-4 items-start">
                            <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-zinc-400 leading-relaxed">
                               تنبيه: ستصلك رسالة تفعيل. إذا لم تجدها في صندوق الوارد، تحقق فوراً من مجلد <b>Spam</b> أو <b>Junk</b>.
                            </p>
                         </div>

                         <Button 
                           onClick={() => handleAuth('signup')} 
                           disabled={loading} 
                           className="w-full h-20 rounded-[2rem] bg-primary text-black font-black text-xl mt-6 shadow-[0_20px_50px_rgba(212,175,55,0.2)]"
                         >
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={28} className="ml-3" /> إنشاء عضوية تنينية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="text-center mt-12 space-y-2 opacity-50">
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em]">
               Precision Secure Access Engine
             </p>
             <p className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-3">
               <Sparkles size={12} /> Powered by XMOOD Cloud Intelligence <Sparkles size={12} />
             </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}