
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
import { Loader2, UserPlus, Mail, Lock, ShieldCheck, Phone, Sparkles, AlertCircle, Info } from "lucide-react";
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
  const { user, isVerified, profile } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
    // نظام التوجيه الذكي
    if (user) {
      if (user.emailVerified) {
        router.replace("/wallet");
      } else {
        router.replace("/verify-email?waiting=true");
      }
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
      let msg = "تأكد من البيانات والمحاولة مجدداً.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة.";
      if (error.code === 'auth/user-not-found') msg = "هذا البريد غير مسجل لدينا.";
      toast({ variant: "destructive", title: "فشل العملية", description: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-28 pb-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card className="luxury-card border-none overflow-hidden bg-card/60 backdrop-blur-3xl shadow-2xl">
            <div className="p-8 text-center border-b border-white/5 flex flex-col items-center bg-muted/10">
               {config?.appearance?.logoUrl ? (
                 <img src={config.appearance.logoUrl} className="h-16 md:h-20 w-auto object-contain mb-4 rounded-xl" alt="Logo" />
               ) : (
                 <h2 className="handwritten-logo text-3xl mb-1">XMOOD STORE</h2>
               )}
               <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20 uppercase tracking-[0.4em] px-4 py-1">Sovereign Identity Portal</Badge>
            </div>

            <CardContent className="p-6 md:p-10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-10 p-1 bg-muted/40 rounded-2xl border border-border/50 h-14">
                  <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-black">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-black">إنشاء حساب</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab} 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    {activeTab === 'login' ? (
                      <div className="space-y-8">
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-primary/70 pr-4 flex items-center gap-2"><Mail size={14} /> البريد الإلكتروني</Label>
                              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="user@xmood.pro" className="h-16 bg-background border-primary/20 text-center font-bold" />
                           </div>
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-primary/70 pr-4 flex items-center gap-2"><Lock size={14} /> كلمة المرور</Label>
                              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-16 bg-background border-primary/20 text-center font-bold" />
                           </div>
                        </div>
                        <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full h-18 royal-button text-lg shadow-xl">
                          {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} className="ml-3" /> تأمين الدخول الملكي</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label className="text-[9px] font-black text-primary/70 pr-4">الاسم الكامل</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 bg-background" /></div>
                            <div className="space-y-2"><Label className="text-[9px] font-black text-primary/70 pr-4">رقم الهاتف</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="h-14 bg-background" /></div>
                         </div>
                         <div className="space-y-2"><Label className="text-[9px] font-black text-primary/70 pr-4">البريد الإلكتروني</Label><Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-14 bg-background" /></div>
                         <div className="space-y-2"><Label className="text-[9px] font-black text-primary/70 pr-4">كلمة المرور</Label><Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-14 bg-background" /></div>
                         
                         <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
                            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-1" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">تنبيه حرج للتحقق</p>
                               <p className="text-[9px] font-bold text-zinc-400 leading-relaxed">ستصلك رسالة تفعيل فوراً. إذا لم تجدها في الوارد، يرجى فحص مجلد <b>Spam</b> أو <b>الرسائل غير المرغوب فيها</b> حتماً.</p>
                            </div>
                         </div>

                         <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full h-18 royal-button text-lg mt-4 shadow-xl">
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={20} className="ml-3" /> إنشاء عضوية سيادية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="text-center mt-10 space-y-4 opacity-40">
             <div className="flex items-center justify-center gap-6">
                <ShieldCheck size={20} className="text-primary" />
                <Lock size={20} className="text-primary" />
                <Info size={20} className="text-primary" />
             </div>
             <p className="text-[8px] font-black text-primary uppercase tracking-[0.5em] flex items-center justify-center gap-3">
               <Sparkles size={10} /> Powered by XMOOD Cloud Intelligence <Sparkles size={10} />
             </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
