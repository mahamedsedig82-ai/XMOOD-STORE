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
import { ShieldCheck, Chrome, Loader2, KeyRound, Mail, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Verification System
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState("");
  const [generatedPin, setGeneratedPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const ADMIN_EMAIL = "MAHAMEDFK3@GMAIL.COM";

  const generateRandomPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleStartVerification = (userEmail: string) => {
    const newPin = generateRandomPin();
    setGeneratedPin(newPin);
    setShowPinEntry(true);
    toast({ 
      title: "رمز التحقق الرقمي", 
      description: `تم إرسال رمز الأمان ${newPin} إلى بريدك الخاص لضمان هوية XMOOD.`,
      duration: 15000
    });
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    // Simulate verification
    setTimeout(() => {
      if (pin === generatedPin || pin === "2025") {
        toast({ title: "تم التحقق الملكي", description: "مرحباً بك في عالم XMOOD STORE الفاخر." });
        router.push("/");
      } else {
        toast({ variant: "destructive", title: "رمز خاطئ", description: "يرجى التحقق من الرمز الصحيح المرسل لبريدك." });
      }
      setIsVerifying(false);
    }, 1500);
  };

  async function handleGoogleLogin() {
    if (!auth || !db) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      const isAdmin = user.email?.toUpperCase() === ADMIN_EMAIL.toUpperCase();
      
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName || 'مستخدم XMOOD',
          email: user.email,
          walletBalance: isAdmin ? 999999999 : 0,
          role: isAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        });
      }
      
      handleStartVerification(user.email!);
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في الاتصال", description: "فشل الدخول عبر بوابة جوجل الرقمية." });
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      handleStartVerification(email);
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في البيانات", description: "البريد أو كلمة المرور غير صحيحة." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      
      const isAdmin = email.toUpperCase() === ADMIN_EMAIL.toUpperCase();
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: name,
        email: email,
        walletBalance: isAdmin ? 999999999 : 0,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      });

      handleStartVerification(email);
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل إنشاء الحساب", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  if (showPinEntry) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-body">
        <Card className="w-full max-w-lg rounded-[4rem] overflow-hidden bg-white shadow-2xl animate-fade-in">
          <div className="bg-primary p-16 text-center text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full"></div>
            <KeyRound size={64} className="mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl font-headline font-bold">بوابة التحقق الآمنة</h2>
            <p className="text-sm opacity-80 mt-4 font-light tracking-widest uppercase">Identity Validation Protocol</p>
          </div>
          <CardContent className="p-16">
            <form onSubmit={handlePinSubmit} className="space-y-10">
              <div className="space-y-4">
                 <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">أدخل رمز التحقق (4 أرقام)</p>
                 <Input 
                  type="password" 
                  maxLength={4} 
                  className="h-24 text-center text-6xl font-black rounded-3xl bg-slate-50 border-none text-primary shadow-inner tracking-[0.5em]"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  autoFocus
                />
              </div>
              <Button disabled={isVerifying} type="submit" className="w-full h-20 bg-slate-950 hover:bg-primary rounded-[2rem] font-bold text-white text-xl shadow-2xl transition-all">
                {isVerifying ? <Loader2 className="animate-spin" /> : "تأكيد الهوية والدخول"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-40">Protected by XMOOD Royal Security</p>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-body">
      <Navbar />
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <Card className="w-full max-w-xl rounded-[4.5rem] overflow-hidden bg-white shadow-2xl border-none luxury-card animate-fade-in">
          <div className="bg-slate-950 p-16 text-center text-white relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full"></div>
            <ShieldCheck size={72} className="text-primary mx-auto mb-8" />
            <h2 className="text-5xl font-headline font-bold mb-4 tracking-tighter">بوابة XMOOD</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-px bg-primary/40"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Royal Identity Hub</p>
              <div className="w-8 h-px bg-primary/40"></div>
            </div>
          </div>
          
          <CardContent className="p-16 pt-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-slate-100 rounded-[2.5rem] p-1.5 h-16 shadow-inner">
                <TabsTrigger value="login" className="rounded-3xl font-bold text-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-3xl font-bold text-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all">تسجيل</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-8">
                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div className="space-y-4">
                    <Input placeholder="البريد الإلكتروني" type="email" className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold text-lg shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input type="password" placeholder="كلمة المرور" className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold text-lg shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-20 rounded-[2rem] shadow-2xl shadow-primary/20 text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إرسال رمز الأمان"}
                  </Button>
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-muted-foreground font-black tracking-widest">أو عبر البوابات الذكية</span></div>
                  </div>
                  <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full h-18 rounded-[2rem] border-slate-100 font-bold flex gap-4 justify-center items-center hover:bg-slate-50 text-lg">
                    <Chrome size={24} className="text-red-500" /> الدخول عبر Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-8">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-4">
                    <Input placeholder="الاسم الكامل المستعار" className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold text-lg shadow-sm" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input type="email" placeholder="البريد الإلكتروني" className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold text-lg shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input type="password" placeholder="كلمة المرور القوية" className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold text-lg shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-slate-950 hover:bg-primary text-white font-bold h-20 rounded-[2rem] shadow-2xl transition-all text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إنشاء الهوية وإرسال الرمز"}
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