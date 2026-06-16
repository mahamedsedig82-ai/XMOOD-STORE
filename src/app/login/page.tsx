"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginEmail, registerEmail, sendMagicLink, resetPassword, syncUserProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, UserPlus, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function LuxuryLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) return toast({ variant: "destructive", title: "بيانات ناقصة" });
    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await registerEmail(email, password);
        await syncUserProfile(res.user, { fullName, displayName: fullName.split(" ")[0] });
        toast({ title: "تم إنشاء الحساب بنجاح" });
      } else {
        await loginEmail(email, password);
        toast({ title: "مرحباً بك مجدداً" });
      }
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل العملية", description: "تأكد من صحة البيانات المدخلة." });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) return toast({ variant: "destructive", title: "أدخل البريد الإلكتروني" });
    setLoading(true);
    try {
      await sendMagicLink(email);
      toast({ title: "تم إرسال الرابط السحري", description: "تفقد بريدك الإلكتروني الآن للدخول." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "لم نتمكن من إرسال الرابط." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 flex justify-center items-center min-h-screen pt-24 pb-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="hidden lg:block space-y-10">
             <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Secure Access Protocol</Badge>
                <h1 className="text-7xl font-headline font-black leading-tight tracking-tighter">بوابة <span className="gold-text">النخبة</span> الرقمية</h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md">نظام دخول آمن يمنحك الوصول الكامل لكافة الخدمات والمحفظة السيادية عبر هويتك البريدية.</p>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border shadow-sm">
                   <Zap className="text-primary mb-4" />
                   <h4 className="font-bold text-sm">دخول سحري</h4>
                   <p className="text-[10px] opacity-60">سجل دخولك بدون كلمة مرور عبر بريدك.</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border shadow-sm">
                   <ShieldCheck className="text-green-500 mb-4" />
                   <h4 className="font-bold text-sm">حماية قصوى</h4>
                   <p className="text-[10px] opacity-60">تشفير كامل لكافة بياناتك الشخصية.</p>
                </div>
             </div>
          </div>

          <Card className="luxury-card border-none overflow-hidden bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl shadow-2xl w-full p-1">
            <div className="p-8 text-center border-b bg-slate-50/50 dark:bg-white/5 rounded-t-[2rem]">
              <Sparkles size={32} className="text-primary mx-auto mb-3" />
              <h2 className="text-xl font-black uppercase tracking-tight">إثبات الهوية الرقمية</h2>
            </div>
            
            <CardContent className="p-8 md:p-12">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-100 dark:bg-white/5 rounded-2xl p-1.5 h-14">
                  <TabsTrigger value="login" className="rounded-xl font-bold text-xs uppercase">الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-bold text-xs uppercase">عضو جديد</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                      <Input type="email" placeholder="البريد الإلكتروني" className="h-14 bg-slate-50 dark:bg-zinc-900 border-none rounded-xl pr-12 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                      <Input type="password" placeholder="كلمة المرور" className="h-14 bg-slate-50 dark:bg-zinc-900 border-none rounded-xl pr-12 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button onClick={() => handleEmailAuth('login')} className="w-full royal-button h-16 text-lg" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : "دخول آمن للمحفظة"}
                    </Button>
                    <Button onClick={handleMagicLink} variant="outline" className="w-full h-14 rounded-xl border-dashed border-primary/40 text-primary font-bold text-xs uppercase" disabled={loading}>
                      إرسال رابط دخول سحري للإيميل
                    </Button>
                    <button onClick={() => email && resetPassword(email).then(() => toast({title: "تم إرسال رابط التعيين"}))} className="text-[10px] font-bold text-slate-500 hover:text-primary uppercase tracking-widest text-center mt-2">نسيت كلمة المرور؟</button>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6">
                  <div className="space-y-4">
                    <Input placeholder="الاسم الكامل" className="h-14 bg-slate-50 dark:bg-zinc-900 border-none rounded-xl px-6 font-bold" value={fullName} onChange={e => setFullName(e.target.value)} />
                    <Input type="email" placeholder="البريد الإلكتروني" className="h-14 bg-slate-50 dark:bg-zinc-900 border-none rounded-xl px-6 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input type="password" placeholder="كلمة المرور القوية" className="h-14 bg-slate-50 dark:bg-zinc-900 border-none rounded-xl px-6 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button onClick={() => handleEmailAuth('signup')} className="w-full royal-button h-16 text-lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إنشاء حساب النخبة"}
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
