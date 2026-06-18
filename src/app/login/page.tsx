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
import { Loader2, UserPlus, Mail, Lock, ShieldCheck, Phone, Sparkles, AlertCircle } from "lucide-react";
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
        
        toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في عالم XMOOD STORE." });
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
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-900/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 pb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-xl"
        >
          <Card className="emerald-glass rounded-[2.5rem] md:rounded-[3rem] border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 md:p-12 text-center border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
               <h2 className="handwritten-logo text-2xl md:text-4xl mb-2 tracking-widest uppercase">XMOOD <span>STORE</span></h2>
               <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] opacity-60">Sovereign Identity Portal</p>
            </div>

            <CardContent className="p-6 md:p-10 space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 md:mb-10 p-1 bg-black/40 rounded-xl md:rounded-2xl border border-white/10 h-14 md:h-18">
                  <TabsTrigger value="login" className="rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase py-2 md:py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all shadow-lg">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase py-2 md:py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all shadow-lg">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {activeTab === 'login' ? (
                      <div className="space-y-8">
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <Label className="text-[9px] md:text-[10px] font-black uppercase text-primary/70 pr-4 tracking-widest flex items-center gap-2">
                                <Mail size={12} /> البريد الإلكتروني
                              </Label>
                              <Input 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                type="email" 
                                placeholder="user@xmood.pro" 
                                className="h-14 md:h-16 text-center text-base bg-zinc-950/50 border-primary/20 gold-glow-border" 
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[9px] md:text-[10px] font-black uppercase text-primary/70 pr-4 tracking-widest flex items-center gap-2">
                                <Lock size={12} /> كلمة المرور
                              </Label>
                              <Input 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                type="password" 
                                placeholder="••••••••" 
                                className="h-14 md:h-16 text-center text-base bg-zinc-950/50 border-primary/20 gold-glow-border" 
                              />
                           </div>
                        </div>
                        <Button 
                          onClick={() => handleAuth('login')} 
                          disabled={loading} 
                          className="w-full h-16 md:h-18 rounded-xl md:rounded-2xl bg-primary text-black font-black text-base md:text-lg shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} className="ml-3" /> تأمين الدخول</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label className="text-[8px] md:text-[9px] font-black text-primary/70 pr-4 uppercase">الاسم الكامل</Label>
                               <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-12 md:h-14 text-sm bg-zinc-950/50 border-primary/20" placeholder="Elite Member Name" />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[8px] md:text-[9px] font-black text-primary/70 pr-4 uppercase">رقم الهاتف</Label>
                               <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-12 md:h-14 text-sm font-mono bg-zinc-950/50 border-primary/20" placeholder="+966..." />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[8px] md:text-[9px] font-black text-primary/70 pr-4 uppercase">البريد الإلكتروني</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-12 md:h-14 text-sm bg-zinc-950/50 border-primary/20" placeholder="user@sovereign.pro" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[8px] md:text-[9px] font-black text-primary/70 pr-4 uppercase">كلمة المرور</Label>
                            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-12 md:h-14 text-sm bg-zinc-950/50 border-primary/20" placeholder="••••••••" />
                         </div>
                         
                         <div className="p-4 md:p-5 bg-primary/5 border border-primary/10 rounded-xl md:rounded-2xl flex gap-3 items-start">
                            <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                            <p className="text-[9px] font-bold text-zinc-400 leading-relaxed">
                               تنبيه: ستصلك رسالة تفعيل. إذا لم تجدها، تحقق فوراً من مجلد <b>Spam</b> أو <b>Junk</b>.
                            </p>
                         </div>

                         <Button 
                           onClick={() => handleAuth('signup')} 
                           disabled={loading} 
                           className="w-full h-16 md:h-18 rounded-xl md:rounded-2xl bg-primary text-black font-black text-base md:text-lg mt-2 shadow-xl shadow-primary/10"
                         >
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={20} className="ml-3" /> إنشاء عضوية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8 space-y-2 opacity-40">
             <p className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">
               Precision Secure Access Engine
             </p>
             <div className="text-[7px] md:text-[8px] font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2">
               <Sparkles size={10} /> Powered by XMOOD Cloud Intelligence <Sparkles size={10} />
             </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}