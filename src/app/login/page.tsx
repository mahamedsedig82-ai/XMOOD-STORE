
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Chrome, Loader2, KeyRound, User, Camera, Lock, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [step, setStep] = useState<'auth' | 'security' | 'emergency'>('auth');
  const [emergencyCode, setEmergencyCode] = useState("");
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    if (fullName.split(" ").length < 4) {
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
        securityQuestions: [{ question: "ما هو اسم أول مدرسة التحقت بها؟", answer: securityAnswer }],
        emergencyCode: code
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
      toast({ variant: "destructive", title: "خطأ في الدخول", description: "البريد أو كلمة المرور غير صحيحة." });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'emergency') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-2xl rounded-[3rem] overflow-hidden bg-white shadow-2xl animate-fade-in border-4 border-primary">
          <div className="bg-primary p-12 text-center text-white">
            <Camera size={64} className="mx-auto mb-6 animate-bounce" />
            <h2 className="text-4xl font-headline font-bold">بروتوكول الأمان النهائي</h2>
            <p className="text-sm opacity-90 mt-4">يجب القيام بتصوير الشاشة (Screenshot) لهذا الرمز الآن!</p>
          </div>
          <CardContent className="p-12 space-y-8 text-center">
            <div className="bg-slate-100 p-10 rounded-[2rem] border-4 border-dashed border-primary/30">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Emergency Recovery Code</p>
              <span className="text-5xl font-black text-slate-900 tracking-tighter">{emergencyCode}</span>
            </div>
            <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-2xl text-amber-800 text-right">
              <AlertTriangle className="shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                هذا الرمز هو وسيلتك الوحيدة لاستعادة الحساب في حال فقدان الوصول. لا تتركه يضيع، قم بتصوير الشاشة فوراً.
              </p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full h-20 royal-button text-2xl">
              تم التصوير، دخول المنصة
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-2xl rounded-[4rem] overflow-hidden bg-white shadow-2xl border-none animate-fade-in">
          <div className="bg-black p-12 text-center text-white">
            <ShieldCheck size={64} className="text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-bold gold-text">بوابة XMOOD السيادية</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mt-2">Elite Access Protocol</p>
          </div>
          
          <CardContent className="p-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-slate-100 rounded-full p-1 h-16">
                <TabsTrigger value="login" className="rounded-full font-black text-lg">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-black text-lg">تسجيل ملكي</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black pr-4 opacity-50">البريد الإلكتروني</label>
                    <Input type="email" className="h-16 rounded-2xl bg-slate-50 border-none px-6" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black pr-4 opacity-50">كلمة المرور</label>
                    <Input type="password" className="h-16 rounded-2xl bg-slate-50 border-none px-6" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full royal-button h-20 text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "دخول الخزانة"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black pr-4 opacity-50">الاسم الرباعي كاملاً</label>
                    <Input placeholder="أدخل اسمك الرباعي هنا..." className="h-16 rounded-2xl bg-slate-50 border-none px-6" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black pr-4 opacity-50">البريد الإلكتروني</label>
                    <Input type="email" className="h-16 rounded-2xl bg-slate-50 border-none px-6" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black pr-4 opacity-50">كلمة المرور (8 رموز على الأقل)</label>
                    <Input type="password" className="h-16 rounded-2xl bg-slate-50 border-none px-6" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black pr-4 text-primary uppercase">سؤال الأمان: ما هو اسم أول مدرسة التحقت بها؟</label>
                    <Input placeholder="إجابتك السرية..." className="h-16 rounded-2xl bg-primary/5 border-primary/20 px-6 font-bold" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full royal-button h-20 text-xl" disabled={loading}>
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
