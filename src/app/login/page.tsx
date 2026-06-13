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
  signOut
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
      toast({ title: "تم إنشاء الحساب السيادي", description: "يرجى التحقق من بريدك الإلكتروني لتفعيل السيادة." });
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
      toast({ variant: "destructive", title: "فشل الدخول الآمن", description: "البريد أو كلمة المرور غير متوافقة." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!auth || !resetEmail) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      toast({ title: "تم إرسال تعليمات الاستعادة", description: "تفقد بريدك الإلكتروني الآن." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "لم نتمكن من العثور على هذا الحساب." });
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!auth?.currentUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast({ title: "تم إعادة إرسال الرابط", description: "تفقد صندوق الوارد أو البريد المهمل." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى المحاولة بعد دقائق قليلة." });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify_pending') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-2xl rounded-[4rem] bg-zinc-950 border border-primary/20 text-center p-16 relative overflow-hidden shadow-2xl animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-primary to-red-600 animate-pulse" />
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-10 border border-primary/20">
            <Mail size={48} className="animate-bounce" />
          </div>
          <h2 className="text-5xl font-headline font-bold gold-text mb-8">تفعيل الهوية الرقمية</h2>
          <p className="text-zinc-400 mb-12 text-xl leading-relaxed">
            لقد أرسلنا رابط تحقق سيادي إلى بريدك الإلكتروني: <br/>
            <span className="text-white font-black block mt-2">{auth?.currentUser?.email}</span>
            <span className="text-sm opacity-60 mt-4 block">لن تتمكن من دخول المتجر أو تنفيذ عمليات الشحن قبل التفعيل.</span>
          </p>
          <div className="space-y-6">
            <Button onClick={() => window.location.reload()} className="w-full h-20 rounded-[1.5rem] bg-white text-black font-black text-2xl shadow-2xl hover:scale-105 transition-all">
              لقد قمت بالتفعيل، دخول الآن
            </Button>
            <Button onClick={resendVerification} disabled={loading} variant="outline" className="w-full h-16 rounded-2xl border-white/10 text-zinc-400 gap-4 font-bold">
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={24} />}
              إعادة إرسال رابط التفعيل
            </Button>
            <Button onClick={() => { signOut(auth!); setStep('auth'); }} variant="ghost" className="text-red-500 font-black text-xs uppercase tracking-widest">
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
        <Card className="w-full max-w-xl rounded-[3.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl animate-fade-in">
          <div className="p-12 text-center bg-white/5 border-b border-white/5 relative">
            <div className="absolute top-0 right-0 p-8 opacity-20">
               <Sparkles size={120} className="text-primary" />
            </div>
            <ShieldCheck size={72} className="text-primary mx-auto mb-8 shadow-2xl" />
            <h2 className="text-4xl md:text-5xl font-headline font-bold gold-text">سيادة XMOOD STORE</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Secure Sovereign Authentication Core</p>
          </div>
          <CardContent className="p-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-white/5 rounded-full p-2 h-20">
                <TabsTrigger value="login" className="rounded-full font-black text-sm uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-black text-sm uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-8">
                <form onSubmit={handleLogin} className="space-y-8">
                  <div className="space-y-6">
                    <div className="relative">
                      <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
                      <Input type="email" placeholder="البريد الإلكتروني الموثق" className="h-18 rounded-[1.5rem] bg-zinc-900 border-none pr-16 font-bold text-lg text-white placeholder:text-zinc-700" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
                      <Input type="password" placeholder="كلمة المرور" className="h-18 rounded-[1.5rem] bg-zinc-900 border-none pr-16 font-bold text-lg text-white placeholder:text-zinc-700" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-[11px] font-black text-zinc-500 hover:text-primary transition-all uppercase tracking-widest">نسيت مفتاح المرور؟</button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-primary/20 rounded-[2.5rem] p-12 text-white shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4">
                            <Key className="text-primary" /> استعادة السيادة
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-8 mt-10">
                          <p className="text-zinc-500 font-bold">أدخل بريدك الإلكتروني لإرسال مفتاح استعادة الحساب.</p>
                          <Input placeholder="البريد الإلكتروني..." className="h-16 bg-zinc-900 border-none rounded-2xl px-8 text-xl font-bold" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                          <Button onClick={handleResetPassword} disabled={loading} className="w-full royal-button h-16 text-xl">
                            إرسال تعليمات الاستعادة
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button type="submit" className="w-full royal-button h-20 text-2xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "دخول سيادي آمن"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-8">
                <form onSubmit={handleSignUp} className="space-y-8">
                  <div className="space-y-6">
                    <div className="relative">
                      <UserCircle className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
                      <Input placeholder="الاسم الكامل للنخبة" className="h-18 rounded-[1.5rem] bg-zinc-900 border-none pr-16 font-bold text-lg text-white" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
                      <Input placeholder="رقم الهاتف للتواصل" className="h-18 rounded-[1.5rem] bg-zinc-900 border-none pr-16 font-bold text-lg text-white" value={phone} onChange={e => setPhone(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
                      <Input type="email" placeholder="البريد الإلكتروني" className="h-18 rounded-[1.5rem] bg-zinc-900 border-none pr-16 font-bold text-lg text-white" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
                      <Input type="password" placeholder="كلمة المرور القوية" className="h-18 rounded-[1.5rem] bg-zinc-900 border-none pr-16 font-bold text-lg text-white" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full royal-button h-20 text-2xl" disabled={loading}>إنشاء حساب وتفعيل</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}