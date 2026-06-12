
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup,
  sendEmailVerification 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Camera, AlertTriangle, Key, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'emergency' | 'verify'>('auth');
  const [emergencyCode, setEmergencyCode] = useState("");
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  // منع مشاكل الهيدريشن (Hydration)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const handleSocialLogin = async (providerName: 'google' | 'apple') => {
    if (!auth || !db) return;
    setLoading(true);
    try {
      const provider = providerName === 'google' 
        ? new GoogleAuthProvider() 
        : new OAuthProvider('apple.com');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // التحقق من وجود بروفايل
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        const code = "XM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName?.split(" ")[0] || "عضو",
          fullName: user.displayName || "عضو XMOOD",
          email: user.email,
          walletBalance: 0,
          role: 'user',
          label: 'عضو XMOOD',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          emergencyCode: code,
          isVerified: true
        });
        setEmergencyCode(code);
        setStep('emergency');
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "تعذر الاتصال بالمزود الخارجي." });
    } finally {
      setLoading(false);
    }
  };

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
      await sendEmailVerification(userCredential.user);
      
      const code = "XM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      setEmergencyCode(code);
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
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
        isVerified: false,
        securityQuestions: [{ question: "ما هو اسم أول مدرسة التحقت بها؟", answer: securityAnswer }]
      });
      
      setStep('verify');
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        toast({ title: "البريد غير مفعل", description: "يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب." });
        setStep('verify');
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في الدخول", description: "البيانات غير صحيحة." });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (step === 'verify') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] bg-zinc-950 border-2 border-primary text-center p-12 animate-fade-in">
          <Mail size={80} className="text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-headline font-bold gold-text mb-4">تفعيل الحساب الملكي</h2>
          <p className="text-zinc-400 mb-8 font-bold">لقد أرسلنا رابط تفعيل إلى بريدك الرسمي. يرجى الضغط عليه للمتابعة.</p>
          <Button onClick={() => setStep('auth')} className="w-full royal-button h-16 text-xl">العودة لتسجيل الدخول</Button>
        </Card>
      </main>
    );
  }

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
            <div className="grid grid-cols-2 gap-4 mb-10">
              <Button onClick={() => handleSocialLogin('google')} variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10">
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.81l3.5-3.5C18.16 1.42 15.34.5 12 .5 7.31.5 3.29 3.2 1.25 7.14l4.13 3.21c1-2.97 3.77-5.31 6.62-5.31z"/><path fill="#4285F4" d="M23.49 12.27c0-.85-.07-1.67-.21-2.47H12v4.69h6.44c-.28 1.48-1.12 2.74-2.38 3.59l3.7 2.87c2.16-2 3.44-4.94 3.44-8.68z"/><path fill="#FBBC05" d="M5.38 10.35l-4.13-3.21C.47 8.65 0 10.28 0 12c0 1.72.47 3.35 1.25 4.86l4.13-3.21c-.28-.85-.43-1.77-.43-2.65 0-.91.15-1.83.43-2.65z"/><path fill="#34A853" d="M12 23.5c3.24 0 5.95-1.07 7.94-2.91l-3.7-2.87c-1.11.75-2.54 1.21-4.24 1.21-3.21 0-5.94-2.17-6.91-5.09l-4.13 3.21c2.04 3.94 6.06 6.45 10.74 6.45z"/></svg>
                Google
              </Button>
              <Button onClick={() => handleSocialLogin('apple')} variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10">
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.96.95-2.11 1.72-3.4 1.72s-1.95-.73-3.32-.73c-1.37 0-2.18.73-3.34.73-1.28 0-2.3-.77-3.36-1.72-2.13-2.13-3.74-6.02-3.74-9.39 0-3.36 1.71-6.23 4.23-6.23 1.26 0 2.24.81 3.23.81.99 0 2.22-.81 3.38-.81 1.15 0 2.14.49 3 1.3-2.22 1.35-1.85 4.67.43 5.72-1.01 2.45-2.13 5.05-3.11 6.9zM12.03 5.37c-.12-2.42 1.85-4.57 4.14-4.87.27 2.47-1.86 4.74-4.14 4.87z"/></svg>
                Apple
              </Button>
            </div>

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
