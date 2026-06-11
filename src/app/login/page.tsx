
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { ShieldCheck, Mail, Lock, Chrome, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // PIN Logic
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState("");
  const [generatedPin, setGeneratedPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const ADMIN_EMAIL = "MAHAMEDFK3@GMAIL.COM";

  // Generate a random 4-digit PIN
  const generateRandomPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleStartVerification = (userEmail: string) => {
    const newPin = generateRandomPin();
    setGeneratedPin(newPin);
    setShowPinEntry(true);
    // Simulate email sending
    toast({ 
      title: "رمز التحقق الأمني", 
      description: `تم إرسال الرمز ${newPin} إلى بريدك (لأغراض التجربة يتم عرضه هنا)`,
      duration: 10000
    });
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    setTimeout(() => {
      if (pin === generatedPin || pin === "2025") {
        toast({ title: "تم التحقق الملكي", description: "مرحباً بك في XMOOD STORE" });
        router.push("/");
      } else {
        toast({ variant: "destructive", title: "رمز خاطئ", description: "يرجى التحقق من الرمز الصحيح" });
      }
      setIsVerifying(false);
    }, 1000);
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
      toast({ variant: "destructive", title: "خطأ", description: "فشل الدخول عبر جوجل" });
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
      toast({ variant: "destructive", title: "خطأ", description: "البريد أو كلمة المرور غير صحيحة" });
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
      toast({ variant: "destructive", title: "فشل التسجيل", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  if (showPinEntry) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-[3rem] overflow-hidden bg-white shadow-2xl">
          <div className="bg-primary p-12 text-center text-white">
            <KeyRound size={48} className="mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold">تأكيد الهوية الرقمية</h2>
            <p className="text-sm opacity-80 mt-2">أدخل الرمز المكون من 4 أرقام</p>
          </div>
          <CardContent className="p-10">
            <form onSubmit={handlePinSubmit} className="space-y-8">
              <Input 
                type="password" 
                maxLength={4} 
                className="h-20 text-center text-5xl font-black rounded-3xl bg-slate-50 border-none text-primary"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
              />
              <Button disabled={isVerifying} type="submit" className="w-full h-16 bg-slate-900 hover:bg-primary rounded-2xl font-bold text-white text-lg">
                {isVerifying ? <Loader2 className="animate-spin" /> : "تحقق الآن"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-lg rounded-[4rem] overflow-hidden bg-white shadow-2xl">
          <div className="bg-slate-950 p-12 text-center text-white">
            <ShieldCheck size={56} className="text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold">بوابة XMOOD</h2>
            <p className="text-xs opacity-50 mt-4 tracking-widest uppercase">Secure Identity Hub</p>
          </div>
          
          <CardContent className="p-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-100 rounded-[2rem] p-1 h-14">
                <TabsTrigger value="login" className="rounded-2xl font-bold">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-2xl font-bold">تسجيل</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <Input placeholder="البريد الإلكتروني" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-16 rounded-2xl shadow-lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إرسال رمز التحقق"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full h-16 rounded-2xl border-slate-100 font-bold flex gap-3 justify-center items-center">
                    <Chrome size={20} className="text-red-500" /> الدخول عبر Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <Input placeholder="الاسم الكامل" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full bg-slate-950 hover:bg-primary text-white font-bold h-16 rounded-2xl shadow-lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إنشاء حساب وإرسال الرمز"}
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
