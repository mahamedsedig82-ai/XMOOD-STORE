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
  Fingerprint, Sparkles, KeyRound, Shield
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
    if (!email || !password) return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء كافة الحقول الإلزامية." });
    
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
        const res = await registerEmail(email, password);
        await syncUserProfile(res.user, { 
          fullName, 
          displayName: fullName.split(" ")[0] || "عضو",
          phoneNumber: phone,
          securityQuestion,
          securityAnswer
        });
        toast({ title: "تم إنشاء العضوية", description: "مرحباً بك في مجتمع النخبة الرقمي." });
      } else {
        await loginEmail(email, password);
        toast({ title: "تم تأكيد الدخول", description: "جاري تحميل واجهتك السيادية..." });
      }
      router.replace("/wallet");
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({ variant: "destructive", title: "خطأ في المصادقة", description: "يرجى التحقق من صحة البيانات أو وجود حساب مسبق." });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) return toast({ variant: "destructive", title: "تنبيه بريدي", description: "أدخل بريدك الإلكتروني لإرسال الرابط السحري." });
    setLoading(true);
    try {
      await sendMagicLink(email);
      toast({ title: "تم إرسال المفتاح السحري", description: "تفقد صندوق الوارد لتأمين الدخول الفوري." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: "عذراً، حدث خطأ أثناء إرسال الرابط." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return toast({ variant: "destructive", title: "تنبيه أمني", description: "يرجى كتابة البريد الإلكتروني لاستعادة الوصول." });
    try {
      await resetPassword(email);
      toast({ title: "بروتوكول استعادة الوصول", description: "تم إرسال تعليمات إعادة ضبط كلمة المرور لبريدك." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشلت عملية الاستعادة." });
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#030303] text-foreground transition-colors duration-500 selection:bg-primary/20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 flex justify-center items-center min-h-screen pt-32 pb-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Enhanced Branding Side */}
          <div className="hidden lg:flex flex-col space-y-12 animate-fade-up">
             <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm">
                   XMOOD SOVEREIGN ACCESS v3.0
                </Badge>
                <h1 className="text-7xl font-headline font-black leading-[1.1] gold-text drop-shadow-2xl">تأمين الهوية الرقـميـة</h1>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-lg">
                   انضم لنخبة متداولي الأصول والخدمات الرقمية عبر نظام دخول مشفر يضمن حماية بياناتك وأموالك.
                </p>
             </div>
             
             <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: ShieldCheck, title: "تشفير سيادي كامل", desc: "كافة بياناتك محمية ببروتوكولات التشفير المتقدمة." },
                  { icon: Fingerprint, title: "توثيق الهوية المتعدد", desc: "نظام أمني متكامل يمنع الوصول غير المصرح به." },
                  { icon: Zap, title: "وصول فوري فائق", desc: "دخول سريع عبر الرابط السحري بدون كلمات مرور معقدة." }
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

          {/* Luxury Authentication Form */}
          <Card className="luxury-card border-none bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden p-1 relative">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
             
             <div className="p-10 text-center border-b bg-muted/10 relative">
                <Shield size={54} className="text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">بوابة الوصول المعتمدة</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase mt-2 tracking-[0.4em] opacity-60">Identity & Trust Management</p>
             </div>
             
             <CardContent className="p-8 md:p-14 relative">
                <Tabs defaultValue="login" className="w-full">
                   <TabsList className="grid w-full grid-cols-2 mb-12 bg-muted/50 rounded-2xl p-2 h-16 border border-border/50">
                      <TabsTrigger value="login" className="rounded-xl font-black text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black transition-all">الدخول الآمن</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-black text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black transition-all">عضوية جديدة</TabsTrigger>
                   </TabsList>

                   <TabsContent value="login" className="space-y-8 animate-fade-in">
                      <div className="space-y-5">
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4 tracking-widest">البريد الإلكتروني المعتمد</Label>
                            <div className="relative group">
                               <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                               <Input placeholder="name@example.com" className="h-16 bg-background border-none rounded-2xl pr-14 font-bold text-lg shadow-inner" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4 tracking-widest">كلمة المرور المشفرة</Label>
                            <div className="relative group">
                               <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                               <Input type="password" placeholder="••••••••" className="h-16 bg-background border-none rounded-2xl pr-14 font-bold text-lg shadow-inner" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                         </div>
                      </div>
                      <Button onClick={() => handleEmailAuth('login')} disabled={loading} className="w-full royal-button h-20 text-xl shadow-primary/30">
                         {loading ? <Loader2 className="animate-spin" /> : "دخول سيادي للمحفظة"}
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Button onClick={handleMagicLink} variant="outline" className="h-14 rounded-2xl border-dashed border-primary/30 text-primary font-black text-[10px] uppercase hover:bg-primary/5" disabled={loading}>
                            رابط دخول سحري (Magic Link)
                         </Button>
                         <Button onClick={handleResetPassword} variant="ghost" className="h-14 rounded-2xl text-muted-foreground font-black text-[10px] uppercase hover:text-primary transition-colors">
                            استعادة كلمة المرور
                         </Button>
                      </div>
                   </TabsContent>

                   <TabsContent value="signup" className="space-y-8 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4 tracking-widest">الاسم الكامل</Label>
                            <div className="relative group">
                               <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                               <Input placeholder="الاسم كما في الهوية" className="h-14 bg-background border-none rounded-xl pr-12 font-bold shadow-inner" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4 tracking-widest">الهاتف الدولي</Label>
                            <div className="relative group">
                               <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                               <Input placeholder="+966" className="h-14 bg-background border-none rounded-xl pr-12 font-bold text-left shadow-inner" value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                         </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4 tracking-widest">البريد الإلكتروني</Label>
                            <div className="relative group">
                               <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                               <Input type="email" placeholder="example@mail.com" className="h-14 bg-background border-none rounded-xl pr-12 font-bold shadow-inner" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                         </div>
                         
                         {/* Security Architecture Section */}
                         <div className="md:col-span-2 p-6 bg-muted/30 rounded-2xl border border-border/50 space-y-4">
                            <Label className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <Shield size={12} /> بروتوكول استعادة الحساب (سؤال الأمان)
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Select onValueChange={setSecurityQuestion}>
                                  <SelectTrigger className="h-12 bg-background border-none rounded-xl font-bold shadow-sm">
                                     <SelectValue placeholder="اختر سؤال أمان..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-card border-border shadow-2xl rounded-xl" dir="rtl">
                                     <SelectItem value="q1" className="font-bold text-xs">ما اسم أول حيوان أليف؟</SelectItem>
                                     <SelectItem value="q2" className="font-bold text-xs">في أي مدينة ولدت؟</SelectItem>
                                     <SelectItem value="q3" className="font-bold text-xs">ما هو اسم معلمك المفضل؟</SelectItem>
                                     <SelectItem value="q4" className="font-bold text-xs">ما هي سيارة أحلامك؟</SelectItem>
                                  </SelectContent>
                               </Select>
                               <div className="relative group">
                                  <KeyRound className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                                  <Input placeholder="الإجابة السرية..." className="h-12 bg-background border-none rounded-xl pr-12 font-bold shadow-sm" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
                               </div>
                            </div>
                         </div>

                         <div className="space-y-2 md:col-span-2">
                            <Label className="text-[9px] font-black text-primary uppercase pr-4 tracking-widest">كلمة المرور الجديدة</Label>
                            <div className="relative group">
                               <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                               <Input type="password" placeholder="أدخل رمزاً قوياً" className="h-14 bg-background border-none rounded-xl pr-12 font-bold shadow-inner" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                         </div>
                      </div>
                      
                      {/* Intelligence Verification */}
                      <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20 space-y-6 shadow-inner">
                         <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <Zap size={14} className="animate-pulse" /> تحقق CAPTCHA الذكي
                            </Label>
                            <Badge variant="outline" className="text-sm font-black bg-white dark:bg-zinc-800 px-6 py-2 rounded-xl border-primary/30 shadow-sm">
                               {captchaChallenge.a} + {captchaChallenge.b} = ؟
                            </Badge>
                         </div>
                         <Input 
                            placeholder="أدخل ناتج العملية الحسابية..." 
                            className="h-16 bg-background border-none rounded-2xl px-6 font-black text-center text-2xl text-primary shadow-inner" 
                            value={captchaInput}
                            onChange={e => setCaptchaInput(e.target.value)}
                         />
                      </div>

                      <Button onClick={() => handleEmailAuth('signup')} disabled={loading} className="w-full royal-button h-20 text-xl shadow-primary/30">
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
