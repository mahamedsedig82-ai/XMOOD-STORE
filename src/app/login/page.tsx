"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { loginEmail, registerEmail, syncUserProfile, sendAccountVerification } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { 
  Loader2, Mail, Lock, Shield, HelpCircle, User, Phone, Calendar
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
  const [age, setAge] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال البريد وكلمة المرور." });
    }

    if (type === 'signup') {
      if (!fullName || !phone || !age || !securityQuestion || !securityAnswer) {
        return toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال كافة بيانات التسجيل الإلزامية." });
      }
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await registerEmail(email, password, fullName);
        await syncUserProfile(res.user, { 
          fullName, 
          displayName: fullName.split(" ")[0],
          phoneNumber: phone,
          age: Number(age),
          securityQuestion,
          securityAnswer
        });
        await sendAccountVerification(res.user);
        toast({ title: "تم إنشاء الحساب", description: "افحص بريدك الإلكتروني لتنشيط العضوية." });
        router.push("/verify-email?waiting=true");
      } else {
        const res = await loginEmail(email, password);
        if (!res.user.emailVerified) {
          toast({ variant: "destructive", title: "الحساب غير موثق", description: "يرجى توثيق البريد أولاً." });
          router.push("/verify-email?waiting=true");
          return;
        }
        await syncUserProfile(res.user);
        toast({ title: "مرحباً بك", description: "تم تأكيد الهوية بنجاح." });
        router.replace("/wallet");
      }
    } catch (error: any) {
      let msg = "خطأ في البيانات أو الحساب.";
      if (error.code === 'auth/email-already-in-use') msg = "البريد مسجل مسبقاً.";
      if (error.code === 'auth/wrong-password') msg = "كلمة المرور خاطئة.";
      toast({ variant: "destructive", title: "فشل المصادقة", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 flex justify-center items-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="hidden lg:flex flex-col space-y-6">
             <Badge className="w-fit bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full font-black text-[10px] uppercase">XMOOD SOVEREIGN ACCESS</Badge>
             <h1 className="text-6xl font-headline font-black leading-tight gold-text">{config?.loginPage?.title || "تأمين الهوية الرقمية"}</h1>
             <p className="text-lg text-muted-foreground font-medium leading-relaxed">{config?.loginPage?.subtitle || "انضم لنخبة متداولي الخدمات الرقمية عبر نظام دخول مشفر يضمن حماية بياناتك."}</p>
          </div>

          <Card className="luxury-card border-none bg-card/60 backdrop-blur-2xl shadow-2xl p-1">
             <div className="p-8 text-center border-b bg-muted/10">
                <Shield size={40} className="text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">{config?.loginPage?.cardTitle || "بوابة الوصول المعتمدة"}</h2>
             </div>
             
             <CardContent className="p-6 md:p-10">
                <Tabs defaultValue="login" className="w-full">
                   <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 rounded-2xl p-1.5 h-14 border">
                      <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase">الدخول</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase">عضوية جديدة</TabsTrigger>
                   </TabsList>

                   <TabsContent value="login" className="space-y-6">
                      <div className="space-y-4">
                         <div className="space-y-2"><Label className="text-[9px] font-black text-primary uppercase pr-4">البريد الإلكتروني</Label><Input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" /></div>
                         <div className="space-y-2"><Label className="text-[9px] font-black text-primary uppercase pr-4">كلمة المرور</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
                      </div>
                      <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full royal-button h-16 text-lg">
                        {loading ? <Loader2 className="animate-spin" /> : "دخول سيادي للمحفظة"}
                      </Button>
                   </TabsContent>

                   <TabsContent value="signup" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1"><Label className="text-[9px] font-black text-primary uppercase pr-2">الاسم</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-12" placeholder="الاسم كما في الهوية" /></div>
                         <div className="space-y-1"><Label className="text-[9px] font-black text-primary uppercase pr-2">الهاتف</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="h-12" placeholder="+249..." /></div>
                         <div className="space-y-1"><Label className="text-[9px] font-black text-primary uppercase pr-2">العمر</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} className="h-12" placeholder="20" /></div>
                         <div className="space-y-1"><Label className="text-[9px] font-black text-primary uppercase pr-2">البريد</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" placeholder="name@example.com" /></div>
                         <div className="md:col-span-2 space-y-1"><Label className="text-[9px] font-black text-primary uppercase pr-2">كلمة المرور</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12" placeholder="••••••••" /></div>
                         
                         <div className="md:col-span-2 space-y-1">
                            <Label className="text-[9px] font-black text-primary uppercase pr-2">سؤال الأمان للطوارئ</Label>
                            <Select onValueChange={setSecurityQuestion}>
                               <SelectTrigger className="h-12 border-primary/20"><SelectValue placeholder="اختر سؤالاً..." /></SelectTrigger>
                               <SelectContent className="z-[100]">
                                  <SelectItem value="q1">اسم أول مدرسة؟</SelectItem>
                                  <SelectItem value="q2">اسم حيوانك المفضل؟</SelectItem>
                                  <SelectItem value="q3">مدينتك المفضلة؟</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="md:col-span-2 space-y-1"><Label className="text-[9px] font-black text-primary uppercase pr-2">إجابة سؤال الأمان</Label><Input value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="h-12" placeholder="الإجابة السرية..." /></div>
                      </div>
                      <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full royal-button h-16 text-lg">
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
