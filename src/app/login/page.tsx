"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { loginEmail, registerEmail, sendMagicLink, syncUserProfile, isSuspiciousInput, logSecurityEvent, sendAccountVerification } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { 
  Loader2, Mail, Lock, ShieldCheck, Fingerprint, Shield, Sparkles, Send, CheckCircle2, HelpCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function SecurityLoginPage() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaChallenge, setCaptchaChallenge] = useState({ a: 0, b: 0 });
  const [loading, setLoading] = useState(false);
  const [isWaitingVerification, setIsWaitingVerification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setCaptchaChallenge({
      a: Math.floor(Math.random() * 10) + 1,
      b: Math.floor(Math.random() * 10) + 1
    });
    setCaptchaInput("");
  };

  const checkSecurity = (text: string) => {
     const check = isSuspiciousInput(text);
     if (check.isSuspicious) {
        logSecurityEvent('tamper_attempt', `رصد تلاعب في حقل الإدخال: ${check.reason}`, email);
        toast({ variant: "destructive", title: "تنبيه أمني", description: "تم رصد محاولة إدخل رموز غير صالحة." });
        return true;
     }
     return false;
  };

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (checkSecurity(email) || checkSecurity(password)) return;

    if (!cleanEmail || !password) return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء كافة الحقول الإلزامية." });
    
    if (type === 'signup') {
      if (!phone || !securityQuestion || !securityAnswer) {
        return toast({ variant: "destructive", title: "بروتوكول الأمان", description: "رقم الهاتف وسؤال الأمان متطلبات أساسية." });
      }
      if (Number(captchaInput) !== captchaChallenge.a + captchaChallenge.b) {
        toast({ variant: "destructive", title: "فشل التحقق البشري", description: "الإجابة الأمنية غير صحيحة." });
        generateCaptcha();
        return;
      }
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await registerEmail(cleanEmail, password);
        await syncUserProfile(res.user, { 
          fullName, 
          displayName: fullName.split(" ")[0] || "عضو",
          phoneNumber: phone,
          securityQuestion,
          securityAnswer
        });
        await sendAccountVerification(res.user);
        setIsWaitingVerification(true);
        toast({ title: "تم إنشاء الحساب", description: "يرجى التحقق من بريدك الإلكتروني لتنشيط العضوية." });
      } else {
        const res = await loginEmail(cleanEmail, password);
        if (!res.user.emailVerified) {
          setIsWaitingVerification(true);
          toast({ variant: "destructive", title: "الحساب غير موثق", description: "يرجى التحقق من بريدك الإلكتروني أولاً." });
          setLoading(false);
          return;
        }
        toast({ title: "تم تأكيد الدخول", description: "جاري تحميل واجهتك السيادية..." });
        router.replace("/wallet");
      }
    } catch (error: any) {
      let msg = "يرجى التحقق من صحة البيانات.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل مسبقاً.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة.";
      toast({ variant: "destructive", title: "خطأ في المصادقة", description: msg });
    } finally {
      if (!isWaitingVerification) setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return toast({ variant: "destructive", title: "تنبيه بريدي", description: "أدخل بريدك الإلكتروني أولاً." });
    setLoading(true);
    try {
      await sendMagicLink(cleanEmail);
      setIsWaitingVerification(true);
      toast({ title: "تم الإرسال", description: "افحص بريدك الإلكتروني لتسجيل الدخول الفوري." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: "تأكد من صحة البريد والمحاولة لاحقاً." });
    } finally {
      setLoading(false);
    }
  };

  if (isWaitingVerification) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
        <Navbar />
        <Card className="max-w-lg w-full p-10 md:p-16 text-center luxury-card border-none bg-card shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
           <div className="relative z-10 space-y-8">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/20 animate-pulse">
                 <Mail className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-3xl md:text-5xl font-black gold-text leading-tight">بانتظار توثيق الهوية</h2>
                 <p className="text-muted-foreground font-medium text-lg leading-relaxed">أرسلنا رابط التحقق إلى بريدك: <span className="text-primary font-bold">{email}</span></p>
                 <p className="text-sm font-bold text-muted-foreground">افحص صندوق الوارد (أو مجلد الـ Spam) واضغط على الرابط لتفعيل حسابك فوراً.</p>
              </div>
              <Button onClick={() => window.location.reload()} className="royal-button w-full h-16 text-lg">لقد قمت بالتحقق، سجل الدخول الآن</Button>
              <Button variant="ghost" onClick={() => setIsWaitingVerification(false)} className="text-xs font-bold text-muted-foreground uppercase tracking-widest">العودة لتعديل البيانات</Button>
           </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 overflow-x-hidden" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 flex justify-center items-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="hidden lg:flex flex-col space-y-10 animate-fade-up">
             <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">XMOOD SOVEREIGN ACCESS</Badge>
                <h1 className="text-6xl font-headline font-black leading-tight gold-text">{config?.loginPage?.title || "تأمين الهوية الرقمية"}</h1>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">{config?.loginPage?.subtitle || "انضم لنخبة متداولي الخدمات الرقمية عبر نظام دخول مشفر يضمن حماية بياناتك."}</p>
             </div>
          </div>

          <Card className="luxury-card border-none bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden p-1">
             <div className="p-8 text-center border-b bg-muted/10">
                <Shield size={48} className="text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">{config?.loginPage?.cardTitle || "بوابة الوصول المعتمدة"}</h2>
                <p className="text-[8px] text-muted-foreground font-black uppercase mt-1 tracking-[0.4em] opacity-60">{config?.loginPage?.cardSubtitle || "Identity & Trust Management"}</p>
             </div>
             
             <CardContent className="p-6 md:p-10">
                <Tabs defaultValue="login" className="w-full">
                   <TabsList className="grid w-full grid-cols-2 mb-10 bg-muted/50 rounded-2xl p-1.5 h-14 border">
                      <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase tracking-widest">الدخول الآمن</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase tracking-widest">عضوية جديدة</TabsTrigger>
                   </TabsList>

                   <TabsContent value="login" className="space-y-6">
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4">البريد الإلكتروني المعتمد</Label>
                            <Input placeholder="name@example.com" className="h-14" value={email} onChange={e => setEmail(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4">كلمة المرور المشفرة</Label>
                            <Input type="password" placeholder="••••••••" className="h-14" value={password} onChange={e => setPassword(e.target.value)} />
                         </div>
                      </div>
                      <Button onClick={() => handleEmailAuth('login')} disabled={loading} className="w-full royal-button h-16 text-lg">دخول سيادي للمحفظة</Button>
                      <Button onClick={handleMagicLink} variant="outline" className="w-full h-14 rounded-2xl border-primary/20 font-black text-[10px] uppercase">دخول عبر الرابط السحري</Button>
                   </TabsContent>

                   <TabsContent value="signup" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-2"><Label className="text-[9px] font-black text-primary uppercase pr-3">الاسم الكامل</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-12" /></div>
                         <div className="space-y-2"><Label className="text-[9px] font-black text-primary uppercase pr-3">الهاتف الدولي</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="h-12" /></div>
                         <div className="md:col-span-2 space-y-2"><Label className="text-[9px] font-black text-primary uppercase pr-3">البريد الإلكتروني</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" /></div>
                         <div className="md:col-span-2 space-y-2"><Label className="text-[9px] font-black text-primary uppercase pr-3">كلمة المرور</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12" /></div>
                         
                         {/* 🛡️ استعادة سؤال الأمان السيادي */}
                         <div className="md:col-span-2 space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-3 flex items-center gap-2"><HelpCircle size={10}/> اختر سؤال أمان (للطوارئ)</Label>
                            <Select onValueChange={setSecurityQuestion} required>
                               <SelectTrigger className="h-12 border-2 border-primary bg-background rounded-xl">
                                  <SelectValue placeholder="اختر سؤال الأمان..." />
                               </SelectTrigger>
                               <SelectContent className="bg-card border-2 border-primary z-[100]">
                                  <SelectItem value="q1">ما هو اسم أول مدرسة التحقت بها؟</SelectItem>
                                  <SelectItem value="q2">ما هو اسم حيوانك الأليف الأول؟</SelectItem>
                                  <SelectItem value="q3">ما هو اسم مدينتك المفضلة؟</SelectItem>
                                  <SelectItem value="q4">ما هو لقب العائلة القديم؟</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="md:col-span-2 space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-3">إجابة سؤال الأمان</Label>
                            <Input value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="h-12" placeholder="أدخل إجابتك السرية هنا..." required />
                         </div>
                      </div>

                      <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/30 space-y-4 shadow-inner">
                         <div className="flex items-center justify-between"><Label className="text-xs font-black text-primary">تحقق CAPTCHA الذكي</Label><Badge variant="outline" className="text-sm font-black px-4 py-1.5 border-primary">{captchaChallenge.a} + {captchaChallenge.b} = ؟</Badge></div>
                         <Input placeholder="أدخل الناتج..." className="h-14 text-center font-black text-xl text-primary" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} />
                      </div>
                      <Button onClick={() => handleEmailAuth('signup')} disabled={loading} className="w-full royal-button h-16 text-lg">إنشاء العضوية السيادية</Button>
                   </TabsContent>
                </Tabs>
             </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}