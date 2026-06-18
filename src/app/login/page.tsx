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
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { user, isVerified } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
    if (user && isVerified) {
      router.replace("/wallet");
    } else if (user && !isVerified) {
      router.replace("/verify-email?waiting=true");
    }
  }, [user, isVerified, router]);

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الحقول المطلوبة." });
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        if (!fullName || !phone) {
          toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال اسمك وهاتفك." });
          setLoading(false);
          return;
        }
        const res = await registerEmail(email, password, fullName);
        await syncUserProfile(res.user, { displayName: fullName, phoneNumber: phone });
        await sendAccountVerification(res.user);
        
        toast({ 
          title: "تم إنشاء العضوية بنجاح", 
          description: "يرجى مراجعة بريدك (ومجلد Spam) لتفعيل الحساب.",
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
            description: "تم إعادة إرسال رابط التفعيل. تحقق من مجلد الـ Spam." 
          });
          router.push("/verify-email?waiting=true");
          return;
        }
        
        toast({ title: "تم الدخول بنجاح" });
        router.replace("/wallet");
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل العملية", description: "تأكد من البيانات والمحاولة مجدداً." });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#020202] relative overflow-hidden" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 pb-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card className="emerald-glass rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 text-center border-b border-white/5 flex flex-col items-center">
               {config?.appearance?.logoUrl ? (
                 <img src={config.appearance.logoUrl} className="h-16 w-auto object-contain mb-2" alt="Logo" />
               ) : (
                 <h2 className="handwritten-logo text-2xl md:text-3xl mb-1">XMOOD STORE</h2>
               )}
               <p className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.4em]">Sovereign Identity Portal</p>
            </div>

            <CardContent className="p-6 md:p-10 space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-10 p-1 bg-black/40 rounded-2xl border border-white/10 h-14">
                  <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-black">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-black">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    {activeTab === 'login' ? (
                      <div className="space-y-8">
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <Label className="text-[9px] font-black uppercase text-primary/70 pr-4 flex items-center gap-2"><Mail size={12} /> البريد الإلكتروني</Label>
                              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="user@xmood.pro" className="h-16 bg-zinc-950/50 border-primary/20 text-center text-lg" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[9px] font-black uppercase text-primary/70 pr-4 flex items-center gap-2"><Lock size={12} /> كلمة المرور</Label>
                              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-16 bg-zinc-950/50 border-primary/20 text-center text-lg" />
                           </div>
                        </div>
                        <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full h-18 royal-button text-lg shadow-xl shadow-primary/10">
                          {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={22} className="ml-3" /> تأمين الدخول الملكي</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2"><Label className="text-[8px] font-black text-primary/70 pr-4">الاسم الكامل</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 bg-zinc-950/50" /></div>
                            <div className="space-y-2"><Label className="text-[8px] font-black text-primary/70 pr-4">رقم الهاتف</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="h-14 bg-zinc-950/50" /></div>
                         </div>
                         <div className="space-y-2"><Label className="text-[8px] font-black text-primary/70 pr-4">البريد الإلكتروني</Label><Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-14 bg-zinc-950/50" /></div>
                         <div className="space-y-2"><Label className="text-[8px] font-black text-primary/70 pr-4">كلمة المرور</Label><Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-14 bg-zinc-950/50" /></div>
                         
                         <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
                            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[9px] font-bold text-zinc-400 leading-relaxed">تنبيه: ستصلك رسالة تفعيل فوراً. إذا لم تجدها، تحقق من مجلد <b>Spam</b> أو <b>Junk</b> في بريدك.</p>
                         </div>

                         <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full h-18 royal-button text-lg mt-4 shadow-xl shadow-primary/10">
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={22} className="ml-3" /> إنشاء عضوية سيادية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="text-center mt-10 space-y-3 opacity-40">
             <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em]">Precision Secure Access Engine</p>
             <p className="text-[8px] font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2">
               <Sparkles size={10} /> Powered by XMOOD Cloud Intelligence <Sparkles size={10} />
             </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
