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
  signInWithPopup,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ShieldCheck, Key, RefreshCw, UserCircle, Phone, Sparkles, LogIn } from "lucide-react";
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
          router.replace("/");
        } else {
          setStep('verify_pending');
        }
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleGoogleLogin = async () => {
    if (!auth || !db || loading) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // التأكد من استمرارية الجلسة
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName?.split(" ")[0] || "عضو",
          fullName: user.displayName || "",
          email: user.email?.toLowerCase(),
          phoneNumber: user.phoneNumber || "",
          walletBalance: 0,
          role: 'user',
          label: 'عضو بريميوم',
          photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          isVerified: true,
          affinityPoints: 50
        });
      } else {
        await updateDoc(userDocRef, { 
          lastSeen: new Date().toISOString(),
          photoURL: user.photoURL || userDoc.data().photoURL
        });
      }
      
      toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في عالم XMOOD." });
      router.replace("/");
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast({ variant: "destructive", title: "فشل الدخول", description: "حدث خطأ أثناء الاتصال بجوجل. يرجى المحاولة مرة أخرى." });
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
        photoURL: `https://picsum.photos/seed/${userCredential.user.uid}/200/200`,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isVerified: false,
        affinityPoints: 50
      });
      
      setStep('verify_pending');
      toast({ title: "اكتمل التسجيل", description: "يرجى التحقق من بريدك الإلكتروني لتنشيط الحساب." });
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
    if (!auth || !db || loading) return;
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!userCredential.user.emailVerified) {
        setStep('verify_pending');
        toast({ variant: "destructive", title: "تفعيل الحساب مطلوب", description: "يرجى الضغط على الرابط المرسل لبريدك." });
      } else {
        await updateDoc(doc(db, "users", userCredential.user.uid), { lastSeen: new Date().toISOString() });
        router.replace("/");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "البريد أو كلمة المرور غير صحيحة." });
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
            لقد أرسلنا رابط تحقق إلى بريدك الإلكتروني. <br/>
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
    <main className="min-h-screen bg-[#050505] text-white selection:bg-primary/30" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-24 flex justify-center items-center min-h-screen pt-32">
        
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Brand Story */}
          <div className="hidden lg:block space-y-10">
             <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Sovereign Access Protocol</Badge>
                <h1 className="text-7xl font-headline font-black leading-tight tracking-tighter">بوابة <span className="gold-text">النخبة</span> الرقمية</h1>
                <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-md">نظام دخول مشفر وآمن يمنحك الوصول الكامل لخدمات شحن الألعاب، المحفظة السيادية، ومعرض الإبداع الرقمي.</p>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "حماية مشفرة", icon: ShieldCheck },
                  { label: "تنفيذ فوري", icon: Sparkles },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4 group hover:border-primary/20 transition-all">
                     <item.icon size={24} className="text-primary group-hover:scale-110 transition-transform" />
                     <span className="font-bold text-sm">{item.label}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Right Side: Auth Card */}
          <Card className="luxury-card border-none overflow-hidden bg-zinc-950/80 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
            <div className="p-10 text-center border-b border-white/5 bg-white/5">
              <UserCircle size={50} className="text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-black uppercase tracking-tight">تسجيل الدخول الموحد</h2>
              <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Elite User Authentication</p>
            </div>
            
            <CardContent className="p-8 md:p-12">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 rounded-2xl p-1.5 h-14">
                  <TabsTrigger value="login" className="rounded-xl font-bold text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black transition-all">الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-bold text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black transition-all">التسجيل</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6 animate-fade-in">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">البريد الإلكتروني</label>
                       <Input type="email" placeholder="example@xmood.com" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold focus:border-primary/50 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">كلمة المرور</label>
                       <Input type="password" placeholder="••••••••" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold focus:border-primary/50 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    
                    <div className="text-left">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button type="button" className="text-[10px] font-bold text-zinc-500 hover:text-primary transition-all uppercase tracking-widest">نسيت كلمة المرور؟</button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4">
                               <RefreshCw size={24} /> استعادة الحساب
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 mt-10">
                            <p className="text-zinc-400 text-sm">أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور فوراً.</p>
                            <Input placeholder="البريد الإلكتروني..." className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                            <Button onClick={handleResetPassword} className="w-full royal-button h-16 text-lg">إرسال رابط الاستعادة</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Button type="submit" className="w-full royal-button h-16 text-lg shadow-xl shadow-primary/10" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={20} className="ml-2" /> دخول آمن</>}
                    </Button>

                    <div className="relative py-6">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                       <div className="relative flex justify-center text-[8px] uppercase font-black"><span className="bg-[#0c0c0c] px-6 text-zinc-600 tracking-[0.4em]">Sovereign Identity</span></div>
                    </div>

                    <Button type="button" onClick={handleGoogleLogin} variant="outline" className="w-full h-16 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 font-black text-[10px] gap-4 tracking-widest transition-all" disabled={loading}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                         <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.84h2.64c1.66-1.53 2.63-3.79 2.63-6.27z" />
                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.64-2.84c-.73.49-1.66.78-2.64.78-2.85 0-5.27-1.92-6.13-4.51H3.18v2.92C5 20.15 8.24 23 12 23z" />
                         <path fill="#FBBC05" d="M5.87 13.77c-.22-.66-.35-1.36-.35-2.07s.13-1.41.35-2.07V6.71H3.18C2.42 8.3 2 10.1 2 12s.42 3.7 1.18 5.29l2.69-3.52z" />
                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.24 1 5 3.85 3.18 6.71l2.69 2.92c.86-2.59 3.28-4.51 6.13-4.51z" />
                      </svg>
                      CONTINUE WITH GOOGLE
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6 animate-fade-in">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">الاسم الكامل</label>
                          <Input placeholder="الاسم" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold" value={fullName} onChange={e => setFullName(e.target.value)} required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">رقم الهاتف</label>
                          <Input placeholder="+966" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold text-left" value={phone} onChange={e => setPhone(e.target.value)} required />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">البريد الإلكتروني</label>
                       <Input type="email" placeholder="mail@xmood.com" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase pr-2">كلمة المرور القوية</label>
                       <Input type="password" placeholder="••••••••" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full royal-button h-16 text-lg mt-4 shadow-xl" disabled={loading}>
                       {loading ? <Loader2 className="animate-spin" /> : "إنشاء الهوية الرقمية"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
