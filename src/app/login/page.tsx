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
import { 
  Loader2, Mail, Lock, Shield, User, Phone, CheckCircle2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * 🛡️ بوابة الدخول السيادية المحدثة.
 * تم تبسيط التسجيل وتحصين مسار التوجيه اللحظي للمحفظة.
 */
export default function SecurityLoginPage() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال البريد وكلمة المرور." });
    }

    if (type === 'signup') {
      if (!fullName || !phone || !age) {
        return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الاسم، الهاتف، والعمر للتسجيل." });
      }
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await registerEmail(email, password, fullName);
        await sendAccountVerification(res.user);
        await syncUserProfile(res.user, { 
          fullName, 
          displayName: fullName,
          phoneNumber: phone,
          age: Number(age)
        });
        toast({ title: "تم إنشاء العضوية", description: "رابط التفعيل في طريقه لبريدك الآن." });
        router.push("/verify-email?waiting=true");
      } else {
        const res = await loginEmail(email, password);
        if (!res.user.emailVerified) {
          toast({ variant: "destructive", title: "الحساب غير موثق", description: "يرجى تفعيل بريدك للمتابعة." });
          router.push("/verify-email?waiting=true");
          return;
        }
        await syncUserProfile(res.user);
        toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في وحدة التحكم." });
        router.replace("/wallet");
      }
    } catch (error: any) {
      let msg = "خطأ في البيانات أو الحساب.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل مسبقاً.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة.";
      if (error.code === 'auth/user-not-found') msg = "لا يوجد حساب بهذا البريد.";
      toast({ variant: "destructive", title: "فشل المصادقة", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 overflow-x-hidden" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 flex justify-center items-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="hidden lg:flex flex-col space-y-8">
             <Badge className="w-fit bg-primary/10 text-primary border-primary/20 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest">XMOOD SOVEREIGN GATE</Badge>
             <h1 className="text-6xl md:text-8xl font-headline font-black leading-tight gold-text">الهوية <br/> الرقمية</h1>
             <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-sm">
                نظام دخول مشفر يضمن حماية مقتنياتك الرقمية والوصول السريع لخدمات النخبة.
             </p>
          </div>

          <Card className="luxury-card border-none bg-card/60 backdrop-blur-3xl shadow-2xl p-1 animate-fade-up">
             <div className="p-8 md:p-12 text-center border-b bg-muted/10 relative overflow-hidden">
                <Shield size={48} className="text-primary mx-auto mb-6 drop-shadow-xl" />
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{config?.loginPage?.cardTitle || "بوابة الوصول المعتمدة"}</h2>
             </div>
             
             <CardContent className="p-6 md:p-12">
                <Tabs defaultValue="login" className="w-full">
                   <TabsList className="grid w-full grid-cols-2 mb-10 bg-muted/50 rounded-2xl p-2 h-16 border-2 border-primary/10">
                      <TabsTrigger value="login" className="rounded-xl font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">دخول سيادي</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">عضوية جديدة</TabsTrigger>
                   </TabsList>

                   <TabsContent value="login" className="space-y-8">
                      <div className="space-y-6">
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary uppercase pr-4">البريد الإلكتروني الموثق</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="h-16" />
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary uppercase pr-4">كلمة المرور</Label>
                            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-16" />
                         </div>
                      </div>
                      <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full royal-button h-18 md:h-20 text-lg shadow-primary/20">
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <><CheckCircle2 size={20} className="ml-3" /> تأكيد الدخول للمحفظة</>}
                      </Button>
                   </TabsContent>

                   <TabsContent value="signup" className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary uppercase pr-3">الاسم الكامل</Label>
                            <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-16" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary uppercase pr-3">رقم الهاتف</Label>
                            <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-16" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary uppercase pr-3">العمر</Label>
                            <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="h-16" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary uppercase pr-3">البريد الإلكتروني</Label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-16" />
                         </div>
                         <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black text-primary uppercase pr-3">كلمة المرور</Label>
                            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-16" />
                         </div>
                      </div>
                      <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full royal-button h-18 md:h-20 text-lg">
                         {loading ? <Loader2 className="animate-spin" size={24} /> : "تأسيس العضوية السيادية"}
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
