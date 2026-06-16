"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ShieldCheck, RefreshCw, UserCircle, LogIn, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoginButton } from "@/components/LoginButton";
import { handleAuthRedirect } from "@/lib/auth";

export default function SecureLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [step, setStep] = useState<'auth' | 'verify_pending'>('auth');
  
  const router = useRouter();

  // Handle Google Redirect Result on mount
  useEffect(() => {
    const processRedirect = async () => {
      setLoading(true);
      const user = await handleAuthRedirect();
      if (user) {
        router.replace("/");
      } else {
        setLoading(false);
      }
    };
    processRedirect();
  }, [router]);

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال البريد الإلكتروني." });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      toast({ title: "تم إرسال الرابط", description: "تفقد بريدك الإلكتروني لإعادة تعيين كلمة المرور." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "لم نتمكن من إرسال رابط الاستعادة." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
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
        affinityPoints: 50,
        updatedAt: serverTimestamp()
      });
      
      setStep('verify_pending');
      toast({ title: "اكتمل التسجيل", description: "يرجى التحقق من بريدك الإلكتروني لتنشيط الحساب." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!userCredential.user.emailVerified) {
        setStep('verify_pending');
        toast({ variant: "destructive", title: "تفعيل الحساب مطلوب", description: "يرجى الضغط على الرابط المرسل لبريدك." });
      } else {
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
        <Card className="w-full max-w-2xl rounded-[3rem] bg-zinc-950 border border-primary/20 text-center p-12 shadow-2xl animate-fade-in">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20">
            <Mail size={40} className="animate-bounce" />
          </div>
          <h2 className="text-4xl font-headline font-bold gold-text mb-6">تفعيل الهوية الرقمية</h2>
          <p className="text-zinc-400 mb-10 text-lg leading-relaxed">
            لقد أرسلنا رابط تحقق إلى بريدك الإلكتروني. <br/>
            <span className="text-white font-bold block mt-2">{auth?.currentUser?.email}</span>
            <span className="text-sm opacity-50 mt-4 block">يرجى الضغط على الرابط لتتمكن من استخدام ميزات المتجر.</span>
          </p>
          <div className="space-y-4">
            <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-2xl bg-white text-black font-black text-xl hover:scale-105 transition-all">
              لقد قمت بالتفعيل، دخول الآن
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 flex justify-center items-center min-h-screen pt-32 pb-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="hidden lg:block space-y-10">
             <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Sovereign Access Protocol</Badge>
                <h1 className="text-7xl font-headline font-black leading-tight tracking-tighter">بوابة <span className="gold-text">النخبة</span> الرقمية</h1>
                <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-md">نظام دخول آمن يمنحك الوصول الكامل لكافة الخدمات والمحفظة السيادية.</p>
             </div>
          </div>

          <Card className="luxury-card border-none overflow-hidden bg-zinc-950/80 backdrop-blur-3xl shadow-2xl border border-white/5 w-full">
            <div className="p-8 text-center border-b border-white/5 bg-white/5">
              <UserCircle size={40} className="text-primary mx-auto mb-3" />
              <h2 className="text-xl font-black uppercase tracking-tight">تسجيل الدخول الموحد</h2>
            </div>
            
            <CardContent className="p-6 md:p-10">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 rounded-2xl p-1.5 h-14">
                  <TabsTrigger value="login" className="rounded-xl font-bold text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black">الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl font-bold text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black">التسجيل</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6 animate-fade-in">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <Input type="email" placeholder="البريد الإلكتروني" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input type="password" placeholder="كلمة المرور" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
                    
                    <div className="text-left">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button type="button" className="text-[10px] font-bold text-zinc-500 hover:text-primary transition-all uppercase tracking-widest">نسيت كلمة المرور؟</button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-primary/20 rounded-[2.5rem] p-10 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4">استعادة الحساب</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 mt-10">
                            <Input placeholder="البريد الإلكتروني..." className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                            <Button onClick={handleResetPassword} className="w-full royal-button h-16 text-lg">إرسال رابط الاستعادة</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Button type="submit" className="w-full royal-button h-16 text-lg" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={20} className="ml-2" /> دخول آمن</>}
                    </Button>

                    <div className="relative py-4">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                       <div className="relative flex justify-center text-[8px] uppercase font-black"><span className="bg-[#0c0c0c] px-6 text-zinc-600 tracking-[0.4em]">أو الدخول عبر</span></div>
                    </div>

                    <LoginButton />
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6 animate-fade-in">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <Input placeholder="الاسم الكامل" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    <Input type="email" placeholder="البريد الإلكتروني" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input type="password" placeholder="كلمة المرور القوية" className="h-14 bg-zinc-900/50 border-white/5 rounded-xl px-6 font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
                    <Button type="submit" className="w-full royal-button h-16 text-lg mt-4" disabled={loading}>
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
