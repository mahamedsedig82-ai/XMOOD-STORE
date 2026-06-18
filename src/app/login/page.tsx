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
import { Loader2, UserPlus, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const { user, profile, loading: authLoading, isVerified } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading && user && profile) {
      if (isVerified) {
        router.replace("/wallet");
      } else {
        router.replace("/verify-email?waiting=true");
      }
    }
  }, [user, profile, authLoading, isVerified, router, isMounted]);

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      return toast({ variant: "destructive", title: "بيانات ناقصة" });
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        if (!fullName || !phone) {
          toast({ variant: "destructive", title: "بيانات ناقصة" });
          setLoading(false);
          return;
        }
        const res = await registerEmail(email, password, fullName);
        await syncUserProfile(res.user, { displayName: fullName, phoneNumber: phone });
        await sendAccountVerification(res.user);
        toast({ title: "تم إنشاء العضوية بنجاح" });
      } else {
        await loginEmail(email, password);
        toast({ title: "جاري تأمين الدخول..." });
      }
    } catch (error: any) {
      let msg = "فشل في المصادقة. تأكد من البيانات.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل مسبقاً.";
      toast({ variant: "destructive", title: "فشل العملية", description: msg });
      setLoading(false);
    }
  };

  // 🛡️ Stable Loader to match SSR and initial client pass
  if (!isMounted || authLoading || (user && !profile)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-primary" size={60} />
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-150 animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest gold-text animate-pulse">Securing Entry Node...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      <Navbar />
      <div className="container min-h-screen flex items-center justify-center pt-24 pb-12 relative z-10 px-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl">
            <div className="p-8 text-center border-b border-white/5 flex flex-col items-center bg-muted/10 gap-5">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full scale-125 opacity-30" />
                  {config?.appearance?.logoUrl ? (
                    <img src={config.appearance.logoUrl} className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-2 border-primary/20 shadow-xl relative z-10" alt="XMOOD" />
                  ) : (
                    <h2 className="handwritten-logo !text-2xl relative z-10" style={{ direction: 'ltr' }}>XMOOD STORE</h2>
                  )}
               </div>
               <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20 uppercase tracking-widest px-4 py-1 rounded-full bg-primary/5">Sovereign Identity Access</Badge>
            </div>

            <CardContent className="p-6 md:p-10">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/40 rounded-xl h-12 border">
                  <TabsTrigger value="login" className="rounded-lg font-black text-[9px] uppercase">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg font-black text-[9px] uppercase">إنشاء حساب</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-primary/80 pr-3">البريد الإلكتروني</Label>
                      <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="user@xmood.pro" />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-primary/80 pr-3">مفتاح المرور</Label>
                      <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
                   </div>
                  <Button onClick={() => handleAuth('login')} disabled={loading} className="royal-button w-full h-14 text-[10px] mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} className="ml-2" /> تأمين الدخول</>}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black text-primary/80 pr-3">الاسم الكامل</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="عضو جديد" /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-black text-primary/80 pr-3">رقم الجوال</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." /></div>
                   </div>
                   <div className="space-y-1.5"><Label className="text-[10px] font-black text-primary/80 pr-3">البريد الإلكتروني</Label><Input value={email} onChange={e => setEmail(e.target.value)} type="email" /></div>
                   <div className="space-y-1.5"><Label className="text-[10px] font-black text-primary/80 pr-3">كلمة المرور</Label><Input value={password} onChange={e => setPassword(e.target.value)} type="password" /></div>
                   <Button onClick={() => handleAuth('signup')} disabled={loading} className="royal-button w-full h-14 text-[10px] mt-2">
                     {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} className="ml-2" /> إنشاء العضوية</>}
                   </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
