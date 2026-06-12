"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Camera, AlertTriangle, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'emergency'>('auth');
  const [emergencyCode, setEmergencyCode] = useState("");
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    if (fullName.trim().split(" ").length < 4) {
      toast({ variant: "destructive", title: "تنبيه أمني", description: "يجب إدخال الاسم الرباعي كاملاً للمتابعة." });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const code = "XM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      setEmergencyCode(code);
      
      const userProfile = {
        uid: userCredential.user.uid,
        displayName: fullName.split(" ")[0],
        fullName: fullName,
        email: email,
        walletBalance: 0,
        role: 'user',
        label: 'عضو XMOOD',
        photoURL: '',
        createdAt: new Date().toISOString(),
        emergencyCode: code,
        securityQuestions: [{ question: "ما هو اسم أول مدرسة التحقت بها؟", answer: securityAnswer }]
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), userProfile);
      setStep('emergency');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في الدخول", description: "البيانات غير صحيحة." });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'emergency') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] overflow-hidden bg-zinc-950 border-2 border-primary shadow-2xl animate-fade-in">
          <div className="bg-primary p-10 text-center text-black">
            <Camera size={48} className="mx-auto mb-4" />
            <h2 className="text-3xl font-headline font-bold">بروتوكول الأمان السيادي</h2>
            <p className="text-sm font-bold mt-2">قم بتصوير الشاشة لهذا الرمز فوراً!</p>
          </div>
          <CardContent className="p-10 space-y-8 text-center">
            <div className="bg-white/5 p-8 rounded-3xl border border-primary/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Emergency Recovery Key</p>
              <span className="text-4xl font-black text-white tracking-widest">{emergencyCode}</span>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 flex gap-3 text-right">
              <AlertTriangle className="shrink-0" />
              <p className="text-xs font-bold">هذا الرمز هو الضمان الوحيد لاستعادة حسابك. لا تشاركه مع أحد.</p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full h-16 royal-button text-xl">دخول المنصة</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-xl rounded-[3rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl animate-fade-in">
          <div className="p-10 text-center bg-white/5 border-b border-white/5">
            <ShieldCheck size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-headline font-bold gold-text">بوابة الدخول الملكية</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">XMOOD Elite Access</p>
          </div>
          <CardContent className="p-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 rounded-full p-1 h-14">
                <TabsTrigger value="login" className="rounded-full font-black text-sm uppercase">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-black text-sm uppercase">تسجيل</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-14 rounded-2xl bg-white/5 border-none px-6 text-white" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 rounded-2xl bg-white/5 border-none px-6 text-white" value={password} onChange={e => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full royal-button h-16 text-lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "دخول الخزانة"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input placeholder="الاسم الرباعي كاملاً" className="h-14 rounded-2xl bg-white/5 border-none px-6 text-white" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-14 rounded-2xl bg-white/5 border-none px-6 text-white" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 rounded-2xl bg-white/5 border-none px-6 text-white" value={password} onChange={e => setPassword(e.target.value)} required />
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <label className="text-[10px] font-black text-primary uppercase mb-2 block">سؤال الأمان: ما اسم أول مدرسة؟</label>
                    <Input placeholder="إجابتك السرية" className="h-12 rounded-xl bg-black border-none px-4 text-white font-bold" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full royal-button h-16 text-lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "تأمين الحساب والبدء"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}