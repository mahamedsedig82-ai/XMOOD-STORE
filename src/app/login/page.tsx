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
  Loader2, Mail, Lock, UserPlus, Zap, 
  ShieldCheck, Smartphone, HelpCircle, 
  Fingerprint, Sparkles, KeyRound 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SecurityLoginPage() {
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
    if (!email || !password) return toast({ variant: "destructive", title: "بيانات ناقصة" });
    
    if (type === 'signup') {
      if (!phone || !securityQuestion || !securityAnswer) {
        return toast({ variant: "destructive", title: "بيانات إجبارية", description: "رقم الهاتف وسؤال الأمان مطلوبان لتأمين حسابك." });
      }
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
          displayName: fullName.split(" ")[0] || "عضو",
          phoneNumber: phone,
          securityQuestion,
          securityAnswer
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
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#030303] text-foreground transition-colors duration-500" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 flex justify-center items-center min-h-screen pt-32 pb-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Enhanced Info Side */}
          <div className="hidden lg:flex flex-col space-y-12 animate-fade-up">
             <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm">
                   Sovereign Access Protocol v2.0
                </Badge>
                <h1 className="text-7xl font-headline font-black leading-[1.1] gold-text">تأمين الهوية الرقـميـة</h1>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-lg">
                   انضم لنخبة متداولي الخدمات الرقمية عبر نظام دخول مشفر يدعم التحقق الثنائي وحماية الأصول.
                </p>
             </div>
             
             <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: ShieldCheck, title: "تشفير سيادي كامل", desc: "بياناتك محمية ببروتوكولات AES-256." },
                  { icon: Fingerprint, title: "أسئلة أمان متقدمة", desc: "طبقة حماية إضافية لاستعادة حسابك يدوياً." },
                  { icon: Zap, title: "وصول لحظي", desc: "دخول سريع عبر الرابط السحري بدون كلمة مرور." }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-card/40 backdrop-blur-sm border rounded-[2.5rem] flex items-center gap-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
                     <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-black transition-colors">
                        <item.icon size={28} />
                     </div>
                     <div>
                        <h4 className="font-black text-lg mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Luxury Form Side */}
          <Card className="luxury-card border-none bg-card/60 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden p-1">
             <div className="p-10 text-center border-b bg-muted/10 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <ShieldCheck size={48} className="text-primary mx-auto mb-6 animate-pulse" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">بوابة الوصول الموثقة</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase mt-2 tracking-[0.3em]">Identity Verification Hub</p>
             </div>
             
             <CardContent className="p-8 md:p-14">
                <Tabs defaultValue="login" className="w-full">
                   <TabsList className="grid w-full grid-cols-2 mb-12 bg-muted/50 rounded-2xl p-2 h-16">
                      <TabsTrigger value="login" className="rounded-xl font-black text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black">الدخول الآمن</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-black text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black">عضوية جديدة</TabsTrigger>
                   </TabsList>

                   <TabsContent value="login" className="space-y-8 animate-fade-in">
                      <div className="space-y-5">
                         <div className="relative group">
                            <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                            <Input placeholder="البريد الإلكتروني المعتمد" className="h-16 bg-background border-none rounded-2xl pr-14 font-bold text-lg shadow-sm" value={email} onChange={e => setEmail(e.target.value)} />
                         </div>
                         <div className="relative group">
                            <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                            <Input type="password" placeholder="كلمة المرور المشفرة" className="h-16 bg-background border-none rounded-2xl pr-14 font-bold text-lg shadow-sm" value={password} onChange={e => setPassword(e.target.value)} />
                         </div>
                      </div>
                      <Button onClick={() => handleEmailAuth('login')} disabled={loading} className="w-full royal-button h-20 text-xl shadow-primary/20">
                         {loading ? <Loader2 className="animate-spin" /> : "دخول سيادي للمحفظة"}
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Button onClick={handleMagicLink} variant="outline" className="h-14 rounded-2xl border-dashed border-primary/30 text-primary font-black text-[10px] uppercase" disabled={loading}>
                            رابط دخول سحري (Magic Link)
                         </Button>
                         <Button onClick={handleResetPassword} variant="ghost" className="h-14 rounded-2xl text-muted-foreground font-black text-[10px] uppercase hover:text-primary">
                            نسيت كلمة المرور؟
                         </Button>
                      </div>
                   </TabsContent>

                   <TabsContent value="signup" className="space-y-8 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="relative group">
                            <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                            <Input placeholder="الاسم الكامل" className="h-14 bg-background border-none rounded-xl pr-12 font-bold" value={fullName} onChange={e => setFullName(e.target.value)} />
                         </div>
                         <div className="relative group">
                            <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                            <Input placeholder="الهاتف الدولي" className="h-14 bg-background border-none rounded-xl pr-12 font-bold text-left" value={phone} onChange={e => setPhone(e.target.value)} />
                         </div>
                         <div className="relative group md:col-span-2">
                            <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                            <Input type="email" placeholder="البريد الإلكتروني" className="h-14 bg-background border-none rounded-xl pr-12 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                         </div>
                         
                         {/* Security Question Section */}
                         <div className="md:col-span-2 space-y-4">
                            <Label className="text-[10px] font-black text-primary uppercase pr-4 tracking-widest">تأمين الاسترداد (سؤال الأمان)</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Select onValueChange={setSecurityQuestion}>
                                  <SelectTrigger className="h-14 bg-background border-none rounded-xl font-bold">
                                     <SelectValue placeholder="اختر سؤال أمان..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-card border-border" dir="rtl">
                                     <SelectItem value="q1">ما اسم أول حيوان أليف؟</SelectItem>
                                     <SelectItem value="q2">في أي مدينة ولدت؟</SelectItem>
                                     <SelectItem value="q3">ما هو اسم معلمك المفضل؟</SelectItem>
                                     <SelectItem value="q4">ما هي سيارة أحلامك؟</SelectItem>
                                  </SelectContent>
                               </Select>
                               <div className="relative group">
                                  <KeyRound className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                                  <Input placeholder="الإجابة السرية..." className="h-14 bg-background border-none rounded-xl pr-12 font-bold" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
                               </div>
                            </div>
                         </div>

                         <div className="relative group md:col-span-2">
                            <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                            <Input type="password" placeholder="كلمة المرور الجديدة" className="h-14 bg-background border-none rounded-xl pr-12 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                         </div>
                      </div>
                      
                      {/* Human Verification */}
                      <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-5">
                         <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <HelpCircle size={14} /> تحقق CAPTCHA الذكي
                            </Label>
                            <Badge variant="outline" className="text-sm font-black bg-white dark:bg-zinc-800 px-4 py-1.5 rounded-xl border-primary/20">
                               {captchaChallenge.a} + {captchaChallenge.b} = ؟
                            </Badge>
                         </div>
                         <Input 
                            placeholder="أدخل ناتج العملية الحسابية..." 
                            className="h-14 bg-background border-none rounded-2xl px-6 font-black text-center text-xl text-primary" 
                            value={captchaInput}
                            onChange={e => setCaptchaInput(e.target.value)}
                         />
                      </div>

                      <Button onClick={() => handleEmailAuth('signup')} disabled={loading} className="w-full royal-button h-20 text-xl shadow-primary/20">
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
