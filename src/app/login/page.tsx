
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
import { ShieldCheck, Loader2, Key, Mail, Globe, AlertTriangle } from "lucide-react";
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

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const handleSocialLogin = async (providerName: 'google' | 'apple') => {
    if (!auth || !db || loading) return;
    setLoading(true);
    try {
      const provider = providerName === 'google' 
        ? new GoogleAuthProvider() 
        : new OAuthProvider('apple.com');
      
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
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
          label: 'عضو XMOOD الموثق',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          emergencyCode: code,
          isVerified: true,
          affinityPoints: 100
        });
        setEmergencyCode(code);
        setStep('emergency');
      } else {
        router.push("/");
      }
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // Silent ignore for user cancellation
      } else {
        console.error("Social Login Error:", error);
        toast({ 
          variant: "destructive", 
          title: "خطأ في بروتوكول التوثيق", 
          description: "تعذر إكمال الاتصال بالمزود الخارجي. يرجى إعادة المحاولة." 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || loading) return;
    if (fullName.trim().split(" ").length < 4) {
      toast({ variant: "destructive", title: "تنبيه أمني رسمي", description: "يجب إدخال الاسم الرباعي كاملاً لضمان التوثيق السيادي." });
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
        label: 'عضو النخبة الموثق',
        photoURL: '',
        createdAt: new Date().toISOString(),
        emergencyCode: code,
        isVerified: false,
        affinityPoints: 50,
        securityQuestions: [{ question: "سؤال الأمان الافتراضي", answer: securityAnswer }]
      });
      
      setStep('verify');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في إنشاء الهوية", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || loading) return;
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        toast({ title: "الهوية غير موثقة", description: "يرجى مراجعة البريد الإلكتروني لتفعيل حسابك الرسمي." });
        setStep('verify');
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول الملكي", description: "بيانات الدخول غير مطابقة للسجلات الرسمية." });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (step === 'verify') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] bg-zinc-950 border-2 border-primary text-center p-12 animate-fade-in shadow-[0_0_100px_rgba(255,184,0,0.1)]">
          <Mail size={80} className="text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-headline font-bold gold-text mb-4">تفعيل الهوية الرسمية</h2>
          <p className="text-zinc-400 mb-8 font-bold leading-relaxed">لقد تم إرسال بروتوكول التفعيل إلى بريدك الإلكتروني. يرجى الضغط على الرابط المرفق للمتابعة.</p>
          <Button onClick={() => setStep('auth')} className="w-full royal-button h-16 text-xl">العودة لبوابة الدخول</Button>
        </Card>
      </main>
    );
  }

  if (step === 'emergency') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] overflow-hidden bg-zinc-950 border-2 border-primary shadow-2xl animate-fade-in">
          <div className="bg-primary p-10 text-center text-black">
            <Key size={48} className="mx-auto mb-4" />
            <h2 className="text-3xl font-headline font-bold">مفتاح الاستعادة السيادي</h2>
            <p className="text-sm font-black mt-2">يرجى حفظ هذا الرمز في مكان آمن فوراً</p>
          </div>
          <CardContent className="p-10 space-y-8 text-center">
            <div className="bg-white/5 p-8 rounded-3xl border border-primary/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic">Sovereign Recovery Shield</p>
              <span className="text-5xl font-black text-white tracking-[0.2em]">{emergencyCode}</span>
            </div>
            <div className="p-6 bg-amber-500/10 rounded-2xl text-amber-500 flex gap-4 text-right border border-amber-500/20">
              <AlertTriangle className="shrink-0" size={24} />
              <p className="text-xs font-bold leading-relaxed">هذا الرمز هو الضمان الوحيد للوصول إلى أصولك في حال فقدان كلمة المرور. لن تتمكن الإدارة من استعادته لك.</p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full h-16 royal-button text-xl">دخول الإمبراطورية</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Card className="w-full max-w-xl rounded-[3rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl animate-fade-in">
          <div className="p-12 text-center bg-white/5 border-b border-white/5">
            <ShieldCheck size={56} className="text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-bold gold-text">بوابة الدخول الملكية</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mt-4">XMOOD Sovereign Elite Access PRO</p>
          </div>
          <CardContent className="p-12">
            <div className="grid grid-cols-2 gap-6 mb-12">
              <Button onClick={() => handleSocialLogin('google')} variant="outline" className="h-16 rounded-2xl border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:border-primary/40 transition-all">
                <Globe className="w-5 h-5 ml-2 text-blue-400" />
                Google
              </Button>
              <Button onClick={() => handleSocialLogin('apple')} variant="outline" className="h-16 rounded-2xl border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:border-primary/40 transition-all">
                <Globe className="w-5 h-5 ml-2 text-white" />
                Apple
              </Button>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-white/5 rounded-full p-1.5 h-16 border border-white/5">
                <TabsTrigger value="login" className="rounded-full font-black text-sm uppercase tracking-widest">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-black text-sm uppercase tracking-widest">إنشاء هوية</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <Input type="email" placeholder="البريد الإلكتروني الرسمي" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold text-lg" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور السرية" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold text-lg" value={password} onChange={e => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full royal-button h-18 text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "دخول الخزانة الملكية"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <Input placeholder="الاسم الرباعي الرسمي" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold text-lg" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  <Input type="email" placeholder="البريد الإلكتروني الرسمي" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold text-lg" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="تعيين كلمة مرور قوية" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold text-lg" value={password} onChange={e => setPassword(e.target.value)} required />
                  <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20">
                    <label className="text-[10px] font-black text-primary uppercase mb-3 block tracking-widest">بروتوكول الأمان: الإجابة السرية</label>
                    <Input placeholder="اسم مدرستك الأولى أو رمزك السري" className="h-14 rounded-xl bg-black border-none px-6 text-white font-black" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full royal-button h-18 text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "تأمين الهوية الملكية"}
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
