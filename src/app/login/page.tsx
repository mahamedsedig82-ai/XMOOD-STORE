
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
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ShieldCheck, Key, RefreshCw, UserCircle, Phone, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function SecureLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [step, setStep] = useState<'auth' | 'verify_pending'>('auth');
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          router.push("/");
        } else {
          setStep('verify_pending');
        }
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleGoogleLogin = async () => {
    if (!auth || !db) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName?.split(" ")[0] || "عضو",
          fullName: user.displayName || "",
          email: user.email?.toLowerCase(),
          phoneNumber: "",
          walletBalance: 0,
          role: 'user',
          label: 'عضو بريميوم',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          isVerified: true,
          affinityPoints: 50
        });
      }
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الدخول", description: "فشل الاتصال بحساب جوجل." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || loading) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCredential.user);
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: fullName.split(" ")[0],
        fullName: fullName,
        email: email.trim().toLowerCase(),
        phoneNumber: phone,
        walletBalance: 0,
        role: 'user',
        label: 'عضو بريميوم',
        photoURL: '',
        createdAt: new Date().toISOString(),
        isVerified: false,
        affinityPoints: 50
      });
      
      setStep('verify_pending');
      toast({ title: "تم إنشاء الحساب", description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب." });
    } catch (error: any) {
      let msg = "فشل إنشاء الحساب. تأكد من البيانات.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل لدينا بالفعل.";
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || loading) return;
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!userCredential.user.emailVerified) {
        setStep('verify_pending');
        toast({ variant: "destructive", title: "تفعيل الحساب مطلوب", description: "يرجى الضغط على الرابط المرسل لبريدك." });
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "البريد أو كلمة المرور غير صحيحة." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!auth || !resetEmail) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      toast({ title: "تم الإرسال", description: "تفقد بريدك الإلكتروني الآن لاستعادة كلمة المرور." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "لم نتمكن من العثور على هذا الحساب." });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify_pending') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-2xl rounded-[3rem] bg-zinc-950 border border-primary/20 text-center p-12 relative overflow-hidden shadow-2xl animate-fade-in">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20">
            <Mail size={40} className="animate-bounce" />
          </div>
          <h2 className="text-4xl font-headline font-bold gold-text mb-6">تفعيل الهوية الرقمية</h2>
          <p className="text-zinc-400 mb-10 text-lg leading-relaxed">
            لقد أرسلنا رابط تحقق إلى بريدك الإلكتروني: <br/>
            <span className="text-white font-bold block mt-2">{auth?.currentUser?.email}</span>
            <span className="text-sm opacity-50 mt-4 block">يرجى الضغط على الرابط لتتمكن من استخدام ميزات المتجر والمحفظة.</span>
          </p>
          <div className="space-y-4">
            <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-2xl bg-white text-black font-black text-xl hover:scale-105 transition-all">
              لقد قمت بالتفعيل، دخول الآن
            </Button>
            <Button onClick={() => auth?.currentUser && sendEmailVerification(auth.currentUser)} variant="outline" className="w-full h-14 rounded-2xl border-white/10 text-zinc-400 gap-3">
              <RefreshCw size={20} /> إعادة إرسال رابط التفعيل
            </Button>
            <Button onClick={() => { signOut(auth!); setStep('auth'); }} variant="ghost" className="text-red-500 font-bold text-xs uppercase">
              استخدام بريد إلكتروني آخر
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-screen pt-32">
        <Card className="w-full max-w-xl rounded-[2.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl animate-fade-in">
          <div className="p-10 text-center bg-white/5 border-b border-white/5">
            <ShieldCheck size={60} className="text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-headline font-bold gold-text uppercase tracking-tight">XMOOD SOVEREIGN CORE</h2>
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mt-3">Secure Access Protocol</p>
          </div>
          <CardContent className="p-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 rounded-full p-1.5 h-16">
                <TabsTrigger value="login" className="rounded-full font-bold text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-bold text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black">حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
                  
                  <div className="text-left">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-[10px] font-bold text-zinc-500 hover:text-primary transition-all">نسيت كلمة المرور؟</button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-primary/20 rounded-[2rem] p-10 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold gold-text">استعادة الحساب</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-6">
                          <Input placeholder="البريد الإلكتروني..." className="h-14 bg-zinc-900 border-none rounded-xl px-6" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                          <Button onClick={handleResetPassword} className="w-full royal-button h-14">إرسال رابط الاستعادة</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button type="submit" className="w-full royal-button h-16 text-lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "دخول سيادي آمن"}
                  </Button>

                  <div className="relative py-4">
                     <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                     <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-zinc-950 px-4 text-zinc-500">أو عبر الهوية الموحدة</span></div>
                  </div>

                  <Button type="button" onClick={handleGoogleLogin} variant="outline" className="w-full h-16 rounded-xl border-white/10 hover:bg-white/5 font-black text-xs gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                       <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.84h2.64c1.66-1.53 2.63-3.79 2.63-6.27z" />
                       <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.64-2.84c-.73.49-1.66.78-2.64.78-2.85 0-5.27-1.92-6.13-4.51H3.18v2.92C5 20.15 8.24 23 12 23z" />
                       <path fill="#FBBC05" d="M5.87 13.77c-.22-.66-.35-1.36-.35-2.07s.13-1.41.35-2.07V6.71H3.18C2.42 8.3 2 10.1 2 12s.42 3.7 1.18 5.29l2.69-3.52z" />
                       <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.24 1 5 3.85 3.18 6.71l2.69 2.92c.86-2.59 3.28-4.51 6.13-4.51z" />
                    </svg>
                    SIGN IN WITH GOOGLE
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <Input placeholder="الاسم الكامل" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  <Input placeholder="رقم الهاتف" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold text-left" value={phone} onChange={e => setPhone(e.target.value)} required />
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full royal-button h-16 text-lg" disabled={loading}>إنشاء حساب وتفعيل</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
