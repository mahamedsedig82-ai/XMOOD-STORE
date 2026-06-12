
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
import { ShieldCheck, Loader2, Key, Mail, Globe, Heart, UserCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("ما هو اسم مدرستك الأولى؟");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'success' | 'verify'>('auth');
  
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
          isVerified: true,
          affinityPoints: 100
        });
        setStep('success');
      } else {
        router.push("/");
      }
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        toast({ 
          variant: "destructive", 
          title: "عذراً، حدث خطأ", 
          description: "تعذر الاتصال بالمزود الخارجي حالياً." 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || loading) return;
    if (fullName.trim().split(" ").length < 2) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال اسمك الثنائي على الأقل." });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: fullName.split(" ")[0],
        fullName: fullName,
        email: email,
        walletBalance: 0,
        role: 'user',
        label: 'عضو بريميوم',
        photoURL: '',
        createdAt: new Date().toISOString(),
        isVerified: false,
        affinityPoints: 50,
        securityQuestion,
        securityAnswer
      });
      
      setStep('verify');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في إنشاء الحساب", description: error.message });
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
        toast({ title: "البريد غير مفعل", description: "يرجى مراجعة بريدك الإلكتروني لتفعيل حسابك." });
        setStep('verify');
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "البيانات المدخلة غير صحيحة." });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (step === 'verify') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] bg-zinc-950 border border-primary/20 text-center p-12 animate-fade-in">
          <Mail size={80} className="text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-headline font-bold gold-text mb-4">تفعيل الحساب</h2>
          <p className="text-zinc-400 mb-8 font-medium leading-relaxed">لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. يرجى الضغط عليه للمتابعة.</p>
          <Button onClick={() => setStep('auth')} className="w-full royal-button h-16 text-xl">العودة للدخول</Button>
        </Card>
      </main>
    );
  }

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] overflow-hidden bg-zinc-950 border border-primary shadow-2xl animate-fade-in text-center p-12">
          <Heart size={64} className="text-red-500 mx-auto mb-6 fill-red-500" />
          <h2 className="text-4xl font-headline font-bold gold-text mb-4">أهلاً بك في عائلتنا!</h2>
          <p className="text-zinc-400 mb-10 text-lg">تم إنشاء حسابك بنجاح. استمتع بتجربة تسوق فريدة وراقية.</p>
          <Button onClick={() => router.push("/")} className="w-full h-16 royal-button text-xl">ابدأ الآن</Button>
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
            <UserCircle size={56} className="text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-bold gold-text">مرحباً بك مجدداً</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 mt-4">XMOOD PREMIUM ACCESS</p>
          </div>
          <CardContent className="p-12">
            <div className="grid grid-cols-2 gap-6 mb-12">
              <Button onClick={() => handleSocialLogin('google')} variant="outline" className="h-16 rounded-2xl border-white/10 bg-white/5 text-xs font-bold hover:bg-white/10 hover:border-primary/40 transition-all">
                <Globe className="w-5 h-5 ml-2 text-blue-400" />
                Google
              </Button>
              <Button onClick={() => handleSocialLogin('apple')} variant="outline" className="h-16 rounded-2xl border-white/10 bg-white/5 text-xs font-bold hover:bg-white/10 hover:border-primary/40 transition-all">
                <Globe className="w-5 h-5 ml-2 text-white" />
                Apple
              </Button>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-white/5 rounded-full p-1.5 h-16 border border-white/5">
                <TabsTrigger value="login" className="rounded-full font-bold text-sm">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-bold text-sm">إنشاء حساب</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full royal-button h-18 text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "دخول المتجر"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <Input placeholder="الاسم الكامل" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 text-white font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
                  <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest pr-2">سؤال الأمان (للحماية)</label>
                    <select 
                      className="w-full h-14 bg-black rounded-xl px-4 text-white font-medium border-none outline-none"
                      value={securityQuestion}
                      onChange={e => setSecurityQuestion(e.target.value)}
                    >
                      <option>ما هو اسم مدرستك الأولى؟</option>
                      <option>ما هو اسم حيوانك الأليف؟</option>
                      <option>ما هو بلدك المفضل؟</option>
                    </select>
                    <Input placeholder="الإجابة السرية" className="h-14 rounded-xl bg-black border-none px-6 text-white font-bold" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full royal-button h-18 text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "تأكيد الحساب"}
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
