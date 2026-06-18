
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { loginEmail, registerEmail, syncUserProfile, sendAccountVerification } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, Shield, CheckCircle2, UserPlus, Zap, Mail, Lock, User, Phone, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الحقول المطلوبة." });
    }

    if (type === 'signup' && (!fullName || !phone)) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء كافة البيانات لإنشاء الحساب." });
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await registerEmail(email, password, fullName);
        await sendAccountVerification(res.user);
        await syncUserProfile(res.user, { fullName, phoneNumber: phone, age: Number(age) || 0 });
        toast({ title: "تم إنشاء الحساب", description: "يرجى تفعيل بريدك الإلكتروني عبر الرابط المرسل." });
        router.push("/verify-email?waiting=true");
      } else {
        const res = await loginEmail(email, password);
        if (!res.user.emailVerified) {
          toast({ variant: "destructive", title: "الحساب غير مفعل", description: "يرجى تفعيل بريدك الإلكتروني أولاً." });
          router.push("/verify-email?waiting=true");
          return;
        }
        await syncUserProfile(res.user);
        toast({ title: "مرحباً بك", description: "تم الدخول بنجاح." });
        router.replace("/wallet");
      }
    } catch (error: any) {
      let msg = "تأكد من صحة البيانات والمحاولة مجدداً.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل مسبقاً.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة.";
      toast({ variant: "destructive", title: "فشل العملية", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 overflow-hidden" dir="rtl">
      <Navbar />
      
      {/* Animated Luxury Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 flex justify-center relative z-10">
        <Card className="w-full max-w-xl luxury-card border-none shadow-2xl bg-card/80 backdrop-blur-2xl overflow-hidden">
          <div className="p-10 text-center border-b border-primary/10 bg-primary/5">
            <div className="w-20 h-20 bg-primary/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/20">
               <Shield size={40} className="text-primary" />
            </div>
            <h2 className="text-4xl font-headline font-black gold-text mb-2">بوابة النخبة</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Elite Identity & Access</p>
          </div>

          <CardContent className="p-8 md:p-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 p-2 bg-muted/30 rounded-2xl border border-border/50">
                <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">عضوية جديدة</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-8 animate-fade-in">
                <div className="space-y-6 text-right">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-primary pr-2 flex items-center gap-2">
                       <Mail size={14} className="text-primary" /> البريد الإلكتروني
                    </Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@example.com" className="h-16" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-primary pr-2 flex items-center gap-2">
                       <Lock size={14} className="text-primary" /> كلمة المرور
                    </Label>
                    <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-16" />
                  </div>
                </div>
                <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full royal-button h-18 text-xl">
                  {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={24} className="ml-3" /> دخول آمن</>}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-primary pr-2 flex items-center gap-2">
                       <User size={14} className="text-primary" /> الاسم الكامل
                    </Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="اسمك..." className="h-14" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-primary pr-2 flex items-center gap-2">
                       <Phone size={14} className="text-primary" /> رقم الهاتف
                    </Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." className="h-14" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-primary pr-2 flex items-center gap-2">
                       <Mail size={14} className="text-primary" /> البريد الإلكتروني
                    </Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-14" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-primary pr-2 flex items-center gap-2">
                       <Calendar size={14} className="text-primary" /> العمر
                    </Label>
                    <Input value={age} onChange={e => setAge(e.target.value)} type="number" className="h-14" />
                  </div>
                  <div className="col-span-full space-y-3">
                    <Label className="text-[11px] font-black uppercase text-primary pr-2 flex items-center gap-2">
                       <Lock size={14} className="text-primary" /> كلمة المرور
                    </Label>
                    <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="h-14" />
                  </div>
                </div>
                <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full royal-button h-18 text-xl">
                  {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={24} className="ml-3" /> إنشاء عضوية فاخرة</>}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <div className="p-8 border-t border-primary/10 bg-muted/10 text-center opacity-40">
             <p className="text-[8px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
               <Zap size={10} className="text-primary" /> XMOOD ENCRYPTION SECURED <Zap size={10} className="text-primary" />
             </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
