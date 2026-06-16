"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { loginEmail, registerEmail, sendMagicLink, resetPassword, syncUserProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { 
  Loader2, Mail, Lock, ShieldCheck, Fingerprint, Shield
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

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء كافة الحقول الإلزامية." });
    
    if (type === 'signup') {
      if (!phone || !securityQuestion || !securityAnswer) {
        return toast({ variant: "destructive", title: "بروتوكول الأمان", description: "رقم الهاتف وسؤال الأمان متطلبات أساسية لتأمين هويتك." });
      }
      if (Number(captchaInput) !== captchaChallenge.a + captchaChallenge.b) {
        toast({ variant: "destructive", title: "فشل التحقق البشري", description: "الإجابة الأمنية غير صحيحة، حاول مجدداً." });
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
        toast({ title: "تم إنشاء العضوية", description: "مرحباً بك في مجتمع النخبة الرقمي." });
      } else {
        await loginEmail(cleanEmail, password);
        toast({ title: "تم تأكيد الدخول", description: "جاري تحميل واجهتك السيادية..." });
      }
      router.replace("/wallet");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في المصادقة", 
        description: error.code === 'auth/invalid-email' ? "تنسيق البريد الإلكتروني غير صحيح." : "يرجى التحقق من صحة البيانات أو وجود حساب مسبق." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return toast({ variant: "destructive", title: "تنبيه بريدي", description: "أدخل بريدك الإلكتروني لإرسال الرابط السحري." });
    setLoading(true);
    try {
      await sendMagicLink(cleanEmail);
      toast({ title: "تم إرسال المفتاح السحري", description: "تفقد صندوق الوارد لتأمين الدخول الفوري." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return toast({ variant: "destructive", title: "تنبيه أمني", description: "يرجى كتابة البريد الإلكتروني لاستعادة الوصول." });
    try {
      await resetPassword(cleanEmail);
      toast({ title: "بروتوكول استعادة الوصول", description: "تم إرسال تعليمات إعادة ضبط كلمة المرور لبريدك." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ" });
    }
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 overflow-x-hidden" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 flex justify-center items-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="hidden lg:flex flex-col space-y-10 animate-fade-up">
             <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                   XMOOD SOVEREIGN ACCESS
                </Badge>
                <h1 className="text-6xl font-headline font-black leading-tight gold-text">
                   {config?.loginPage?.title || "تأمين الهوية الرقمية"}
                </h1>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">
                   {config?.loginPage?.subtitle || "انضم لنخبة متداولي الخدمات الرقمية عبر نظام دخول مشفر يضمن حماية بياناتك."}
                </p>
             </div>
             
             <div className="grid grid-cols-1 gap-5">
                {[
                  { icon: ShieldCheck, title: "تشفير سيادي", desc: "كافة بياناتك محمية ببروتوكولات التشفير." },
                  { icon: Fingerprint, title: "توثيق الهوية", desc: "نظام أمني متكامل يمنع الوصول غير المصرح." },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-card/40 backdrop-blur-sm border rounded-3xl flex items-center gap-6 shadow-sm hover:shadow-xl transition-all">
                     <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                        <item.icon size={24} />
                     </div>
                     <div>
                        <h4 className="font-black text-base">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <Card className="luxury-card border-none bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden p-1">
             <div className="p-8 text-center border-b bg-muted/10">
                <Shield size={48} className="text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                   {config?.loginPage?.cardTitle || "بوابة الوصول المعتمدة"}
                </h2>
                <p className="text-[8px] text-muted-foreground font-black uppercase mt-1 tracking-[0.4em] opacity-60">
                   {config?.loginPage?.cardSubtitle || "Identity & Trust Management"}
                </p>
             </div>
             
             <CardContent className="p-6 md:p-10">
                <Tabs defaultValue="login" className="w-full">
                   <TabsList className="grid w-full grid-cols-2 mb-10 bg-muted/50 rounded-2xl p-1.5 h-14 border">
                      <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase tracking-widest">الدخول الآمن</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase tracking-widest">عضوية جديدة</TabsTrigger>
                   </TabsList>

                   <TabsContent value="login" className="space-y-6 animate-fade-in">
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4 tracking-widest">البريد الإلكتروني المعتمد</Label>
                            <div className="relative">
                               <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                               <Input placeholder="name@example.com" className="h-14 bg-background border-none rounded-xl pr-12 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4 tracking-widest">كلمة المرور المشفرة</Label>
                            <div className="relative">
                               <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                               <Input type="password" placeholder="••••••••" className="h-14 bg-background border-none rounded-xl pr-12 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                         </div>
                      </div>
                      <Button onClick={() => handleEmailAuth('login')} disabled={loading} className="w-full royal-button h-16 text-lg">
                         {loading ? <Loader2 className="animate-spin" /> : "دخول سيادي للمحفظة"}
                      </Button>
                      <div className="flex flex-col md:flex-row gap-3">
                         <Button onClick={handleMagicLink} variant="outline" className="flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest" disabled={loading}>رابط سحري</Button>
                         <Button onClick={handleResetPassword} variant="ghost" className="flex-1 h-12 rounded-xl text-muted-foreground font-black text-[9px] uppercase tracking-widest">استعادة الوصول</Button>
                      </div>
                   </TabsContent>

                   <TabsContent value="signup" className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-3 tracking-widest">الاسم الكامل</Label>
                            <Input placeholder="الاسم الرباعي" className="h-12 bg-background border-none rounded-xl px-4 font-bold" value={fullName} onChange={e => setFullName(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-3 tracking-widest">الهاتف الدولي</Label>
                            <Input placeholder="+966" className="h-12 bg-background border-none rounded-xl px-4 font-bold text-left" value={phone} onChange={e => setPhone(e.target.value)} />
                         </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-3 tracking-widest">البريد الإلكتروني</Label>
                            <Input type="email" placeholder="example@mail.com" className="h-12 bg-background border-none rounded-xl px-4 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                         </div>
                         
                         <div className="md:col-span-2 p-5 bg-muted/30 rounded-2xl border space-y-4">
                            <Label className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <Shield size={12} /> بروتوكول سؤال الأمان
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Select onValueChange={setSecurityQuestion}>
                                  <SelectTrigger className="h-12 bg-background border-none rounded-xl font-bold">
                                     <SelectValue placeholder="اختر سؤالاً..." />
                                  </SelectTrigger>
                                  <SelectContent dir="rtl">
                                     <SelectItem value="q1">ما اسم أول حيوان أليف؟</SelectItem>
                                     <SelectItem value="q2">في أي مدينة ولدت؟</SelectItem>
                                     <SelectItem value="q3">ما هو اسم معلمك المفضل؟</SelectItem>
                                  </SelectContent>
                               </Select>
                               <Input placeholder="الإجابة السرية..." className="h-12 bg-background border-none rounded-xl px-4 font-bold" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
                            </div>
                         </div>

                         <div className="space-y-2 md:col-span-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-3 tracking-widest">كلمة المرور الجديدة</Label>
                            <Input type="password" placeholder="أدخل رمزاً قوياً" className="h-12 bg-background border-none rounded-xl px-4 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                         </div>
                      </div>
                      
                      <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-4">
                         <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black text-primary uppercase">تحقق CAPTCHA الذكي</Label>
                            <Badge variant="outline" className="text-sm font-black bg-white dark:bg-zinc-800 px-4 py-1.5 rounded-lg border-primary/30">
                               {captchaChallenge.a} + {captchaChallenge.b} = ؟
                            </Badge>
                         </div>
                         <Input 
                            placeholder="أدخل الناتج..." 
                            className="h-14 bg-background border-none rounded-xl px-6 font-black text-center text-xl text-primary" 
                            value={captchaInput}
                            onChange={e => setCaptchaInput(e.target.value)}
                         />
                      </div>

                      <Button onClick={() => handleEmailAuth('signup')} disabled={loading} className="w-full royal-button h-16 text-lg">
                         {loading ? <Loader2 className="animate-spin" /> : "إنشاء العضوية السيادية"}
                      </Button>
                   </TabsContent>
                </Tabs>
             </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
