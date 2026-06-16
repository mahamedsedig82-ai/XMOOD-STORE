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
import { Loader2, Mail, Lock, UserPlus, Zap, ShieldCheck, Sparkles, Smartphone, Calendar, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function SecurityLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
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
    if (!email || !password) return toast({ variant: "destructive", title: "بيانات ناقصة" });
    
    if (type === 'signup') {
      if (!phone || !age) return toast({ variant: "destructive", title: "بيانات إجبارية", description: "رقم الهاتف والعمر مطلوبان للتحقق." });
      if (Number(captchaInput) !== captchaChallenge.a + captchaChallenge.b) {
        toast({ variant: "destructive", title: "فشل التحقق البشري", description: "إجابة مسألة التحقق غير صحيحة." });
        generateCaptcha();
        return;
      }
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await registerEmail(email, password);
        await syncUserProfile(res.user, { 
          fullName, 
          displayName: fullName.split(" ")[0],
          phoneNumber: phone,
          age: Number(age)
        });
        toast({ title: "تم إنشاء حساب النخبة بنجاح" });
      } else {
        await loginEmail(email, password);
        toast({ title: "مرحباً بك في وحدة التحكم" });
      }
      router.replace("/wallet");
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({ variant: "destructive", title: "فشل العملية", description: "تأكد من صحة البيانات أو وجود حساب مسبق." });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) return toast({ variant: "destructive", title: "أدخل البريد الإلكتروني" });
    setLoading(true);
    try {
      await sendMagicLink(email);
      toast({ title: "تم إرسال الرابط السحري", description: "تفقد بريدك الآن لتأمين الدخول." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الإرسال" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return toast({ variant: "destructive", title: "أدخل بريدك الإلكتروني أولاً" });
    try {
      await resetPassword(email);
      toast({ title: "تم إرسال رابط الاستعادة", description: "تفقد بريدك الإلكتروني الآن." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الإرسال" });
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#030303] text-foreground" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 flex justify-center items-center min-h-screen pt-32 pb-20">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Info Side */}
          <div className="hidden lg:flex flex-col space-y-8 animate-fade-up">
             <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Digital Fortress Protocol</Badge>
                <h1 className="text-6xl font-headline font-black leading-[1.1] gold-text">تأمين الوصول السيادي</h1>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-md">نظام تسجيل دخول مطور يتطلب التحقق الثنائي والتحري الأمني لضمان سلامة الأصول الرقمية.</p>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: ShieldCheck, title: "تحقق بشري CAPTCHA", desc: "حماية من الهجمات الآلية والبوتات." },
                  { icon: Smartphone, title: "ربط رقم الهاتف", desc: "لتلقي إشعارات العمليات المالية الهامة." },
                  { icon: Calendar, title: "تدقيق العمر", desc: "تخصيص الخدمات بناءً على الفئة العمرية." }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-card border rounded-[2rem] flex items-center gap-5 shadow-sm">
                     <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                        <item.icon size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Form Side */}
          <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden p-1">
             <div className="p-8 text-center border-b bg-muted/10">
                <ShieldCheck size={40} className="text-primary mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">بوابة التحقق المركزية</h2>
             </div>
             
             <CardContent className="p-8 md:p-12">
                <Tabs defaultValue="login" className="w-full">
                   <TabsList className="grid w-full grid-cols-2 mb-10 bg-muted/50 rounded-2xl p-1.5 h-14">
                      <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase">الدخول الآمن</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase">عضوية جديدة</TabsTrigger>
                   </TabsList>

                   <TabsContent value="login" className="space-y-6">
                      <div className="space-y-4">
                         <div className="relative">
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input placeholder="البريد الإلكتروني" className="h-14 bg-background border-none rounded-xl pr-12 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                         </div>
                         <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input type="password" placeholder="كلمة المرور" className="h-14 bg-background border-none rounded-xl pr-12 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                         </div>
                      </div>
                      <Button onClick={() => handleEmailAuth('login')} disabled={loading} className="w-full royal-button h-16 text-lg shadow-primary/20">
                         {loading ? <Loader2 className="animate-spin" /> : "دخول سيادي للمحفظة"}
                      </Button>
                      <Button onClick={handleMagicLink} variant="outline" className="w-full h-14 rounded-2xl border-dashed border-primary/30 text-primary font-bold text-xs uppercase" disabled={loading}>
                         أرسل لي رابط دخول سحري
                      </Button>
                      <button onClick={handleResetPassword} className="w-full text-center text-[10px] font-black text-muted-foreground uppercase hover:text-primary transition-colors mt-4">استعادة كلمة المرور</button>
                   </TabsContent>

                   <TabsContent value="signup" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Input placeholder="الاسم الكامل" className="h-14 bg-background border-none rounded-xl px-6 font-bold" value={fullName} onChange={e => setFullName(e.target.value)} />
                         <Input placeholder="رقم الهاتف (دولي)" className="h-14 bg-background border-none rounded-xl px-6 font-bold text-left" value={phone} onChange={e => setPhone(e.target.value)} />
                         <Input type="email" placeholder="البريد الإلكتروني" className="h-14 bg-background border-none rounded-xl px-6 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                         <Input type="number" placeholder="العمر" className="h-14 bg-background border-none rounded-xl px-6 font-bold" value={age} onChange={e => setAge(e.target.value)} />
                         <Input type="password" placeholder="كلمة المرور" className="h-14 bg-background border-none rounded-xl px-6 font-bold col-span-full" value={password} onChange={e => setPassword(e.target.value)} />
                      </div>
                      
                      {/* Human Verification */}
                      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                         <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black text-primary uppercase">تحقق CAPTCHA الذكي</Label>
                            <span className="text-xs font-black bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg border">{captchaChallenge.a} + {captchaChallenge.b} = ؟</span>
                         </div>
                         <Input 
                            placeholder="أدخل ناتج الجمع..." 
                            className="h-12 bg-background border-none rounded-xl px-6 font-bold text-center" 
                            value={captchaInput}
                            onChange={e => setCaptchaInput(e.target.value)}
                         />
                      </div>

                      <Button onClick={() => handleEmailAuth('signup')} disabled={loading} className="w-full royal-button h-16 text-lg shadow-primary/20">
                         {loading ? <Loader2 className="animate-spin" /> : "إنشاء العضوية والتحقق"}
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