
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
import { Loader2, Mail, ShieldCheck, Key, RefreshCw, AlertCircle, UserCircle, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
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
        label: 'عضو جديد',
        photoURL: '',
        createdAt: new Date().toISOString(),
        isVerified: false,
        affinityPoints: 50
      });
      
      setStep('verify_pending');
      toast({ title: "تم إنشاء الحساب", description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب." });
    } catch (error: any) {
      let msg = "فشل إنشاء الحساب. تأكد من البيانات.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مستخدم بالفعل.";
      toast({ variant: "destructive", title: "خطأ", description: msg });
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
        toast({ variant: "destructive", title: "تنبيه", description: "يرجى تفعيل بريدك الإلكتروني أولاً." });
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
      toast({ title: "تم الإرسال", description: "تحقق من بريدك لإعادة تعيين كلمة المرور." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال رابط الاستعادة." });
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!auth?.currentUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast({ title: "تم إعادة الإرسال", description: "تفقد صندوق الوارد أو البريد المهمل." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى المحاولة بعد قليل." });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify_pending') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] bg-zinc-950 border border-primary/20 text-center p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary animate-pulse" />
          <Mail size={80} className="text-primary mx-auto mb-8 animate-bounce" />
          <h2 className="text-4xl font-headline font-bold gold-text mb-6">تفعيل الحساب مطلوب</h2>
          <p className="text-zinc-400 mb-10 text-lg leading-relaxed">
            لقد أرسلنا رابط تحقق آمن إلى بريدك الإلكتروني <br/>
            <span className="text-white font-bold">{auth?.currentUser?.email}</span>. <br/>
            لن تتمكن من دخول المتجر قبل الضغط على الرابط.
          </p>
          <div className="space-y-4">
            <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-2xl bg-white text-black font-black text-xl">
              لقد قمت بالتحقق، دخول الآن
            </Button>
            <Button onClick={resendVerification} disabled={loading} variant="outline" className="w-full h-16 rounded-2xl border-white/10 text-zinc-400 gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
              إعادة إرسال الرابط
            </Button>
            <Button onClick={() => { signOut(auth!); setStep('auth'); }} variant="ghost" className="text-red-500 font-bold">
              استخدام بريد آخر
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
        <Card className="w-full max-w-xl rounded-[3rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl">
          <div className="p-10 text-center bg-white/5 border-b border-white/5">
            <ShieldCheck size={56} className="text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-bold gold-text">دخول XMOOD STORE</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Secure Sovereign Access</p>
          </div>
          <CardContent className="p-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 rounded-full p-1.5 h-16">
                <TabsTrigger value="login" className="rounded-full font-bold">تسجيل دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-bold">حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                      <Input type="email" placeholder="البريد الإلكتروني" className="h-16 rounded-2xl bg-zinc-900 border-none pr-14 font-bold text-lg text-white" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                      <Input type="password" placeholder="كلمة المرور" className="h-16 rounded-2xl bg-zinc-900 border-none pr-14 font-bold text-lg text-white" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-[10px] font-bold text-zinc-500 hover:text-primary transition-colors">نسيت كلمة المرور؟</button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-primary/20 rounded-3xl p-8 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold gold-text flex items-center gap-3">
                            <Key className="text-primary" /> استعادة الحساب
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-6">
                          <Input placeholder="أدخل بريدك الإلكتروني" className="h-14 bg-zinc-900 border-none rounded-xl px-6" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                          <Button onClick={handleResetPassword} disabled={loading} className="w-full royal-button h-14">
                            إرسال رابط الاستعادة
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button type="submit" className="w-full royal-button h-18 text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "دخول آمن للمتجر"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <UserCircle className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                      <Input placeholder="الاسم الكامل" className="h-16 rounded-2xl bg-zinc-900 border-none pr-14 font-bold text-lg text-white" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                      <Input placeholder="رقم الهاتف" className="h-16 rounded-2xl bg-zinc-900 border-none pr-14 font-bold text-lg text-white" value={phone} onChange={e => setPhone(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                      <Input type="email" placeholder="البريد الإلكتروني" className="h-16 rounded-2xl bg-zinc-900 border-none pr-14 font-bold text-lg text-white" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                      <Input type="password" placeholder="كلمة المرور" className="h-16 rounded-2xl bg-zinc-900 border-none pr-14 font-bold text-lg text-white" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full royal-button h-18 text-xl" disabled={loading}>إنشاء حساب وتفعيل</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
