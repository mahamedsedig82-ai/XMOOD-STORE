"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { loginEmail, registerEmail, syncUserProfile, sendAccountVerification } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, ShieldCheck, AlertCircle } from "lucide-react";
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
  const { user, loading: userLoading, isVerified } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
    if (!userLoading && user) {
      if (isVerified) {
        router.replace("/wallet");
      } else {
        router.replace("/verify-email?waiting=true");
      }
    }
  }, [user, userLoading, isVerified, router]);

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      return toast({ variant: "destructive", title: "بيانات ناقصة" });
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        if (!fullName || !phone) {
          toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء كافة الخانات المطلوبة." });
          setLoading(false);
          return;
        }
        const res = await registerEmail(email, password, fullName);
        await syncUserProfile(res.user, { displayName: fullName, phoneNumber: phone });
        await sendAccountVerification(res.user);
        toast({ title: "تم إنشاء العضوية"، description: "يرجى مراجعة بريدك الإلكتروني (بما في ذلك مجلد Spam) لتفعيل الحساب." });
        router.push("/verify-email?waiting=true");
      } else {
        const res = await loginEmail(email, password);
        await syncUserProfile(res.user);
        if (!res.user.emailVerified) {
          await sendAccountVerification(res.user);
          router.push("/verify-email?waiting=true");
          return;
        }
        toast({ title: "تم الدخول بنجاح" });
        router.replace("/wallet");
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      let msg = "فشل في عملية المصادقة. يرجى التأكد من البيانات.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل مسبقاً.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة.";
      toast({ variant: "destructive", title: "فشل العملية", description: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center pt-32 pb-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card className="luxury-card border-none overflow-hidden bg-card/60 backdrop-blur-3xl shadow-2xl">
            <div className="p-8 text-center border-b border-white/5 flex flex-col items-center bg-muted/10 gap-6">
               <div className="logo-glow-container">
                 {config?.appearance?.logoUrl ? (
                   <img 
                    src={config.appearance.logoUrl} 
                    className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow-2xl relative z-10" 
                    alt="Logo" 
                   />
                 ) : (
                   <h2 className="handwritten-logo text-3xl mb-1" style={{ direction: 'ltr' }}>XMOOD STORE</h2>
                 )}
               </div>
               <Badge variant="outline" className="text-[9px] font-black text-primary border-primary/30 uppercase tracking-[0.4em] px-5 py-1 rounded-full bg-primary/5">
                 Sovereign Identity Portal
               </Badge>
            </div>

            <CardContent className="p-6 md:p-10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-2xl h-14 border">
                  <TabsTrigger value="login" className="rounded-xl font-black text-[9px] uppercase transition-all">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-black text-[9px] uppercase transition-all">إنشاء حساب</TabsTrigger>
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
                      <div className="space-y-5">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-primary/80 pr-3">البريد الإلكتروني</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="user@xmood.pro" className="h-12" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-primary/80 pr-3">مفتاح المرور</Label>
                            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-12" />
                         </div>
                        <Button onClick={() => handleAuth('login')} disabled={loading} className="royal-button w-full h-16 text-base mt-4">
                          {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} className="ml-2" /> تأمين الدخول الملكي</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label className="text-[10px] font-black text-primary/80 pr-3">الاسم الكامل</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-12" placeholder="عضو النخبة" /></div>
                            <div className="space-y-2"><Label className="text-[10px] font-black text-primary/80 pr-3">رقم الجوال</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="h-12" placeholder="+966..." /></div>
                         </div>
                         <div className="space-y-2"><Label className="text-[10px] font-black text-primary/80 pr-3">البريد الإلكتروني</Label><Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-12" /></div>
                         <div className="space-y-2"><Label className="text-[10px] font-black text-primary/80 pr-3">كلمة المرور</Label><Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-12" /></div>
                         
                         <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
                            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-1" />
                            <p className="text-[10px] font-bold text-zinc-400 leading-relaxed">تنبيه أمني: يرجى فحص مجلد <b>Spam</b> للعثور على رابط تفعيل العضوية بعد التسجيل.</p>
                         </div>

                         <Button onClick={() => handleAuth('signup')} disabled={loading} className="royal-button w-full h-16 text-base mt-2">
                           {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={20} className="ml-2" /> إنشاء عضوية سيادية</>}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
