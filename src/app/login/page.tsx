
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
import { ShieldCheck, Mail, Lock, Chrome, Loader2, User, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // PIN Verification State
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState("");
  const [pendingUser, setPendingUser] = useState<any>(null);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const ADMIN_EMAIL = "MAHAMEDFK3@GMAIL.COM";

  const completeLogin = () => {
    toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في XMOOD STORE" });
    router.push("/");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "2025") { // رمز التحقق الافتراضي
      completeLogin();
    } else {
      toast({ variant: "destructive", title: "رمز خطأ", description: "رمز التحقق غير صحيح" });
    }
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
          walletBalance: isAdmin ? 1000000 : 0,
          role: isAdmin ? 'admin' : 'user',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
      
      setPendingUser(user);
      setShowPinEntry(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "يرجى المحاولة مرة أخرى" });
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setPendingUser(result.user);
      setShowPinEntry(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "البريد أو كلمة المرور غير صحيحة" });
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
        walletBalance: isAdmin ? 1000000 : 0,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      });

      setPendingUser(user);
      setShowPinEntry(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  if (showPinEntry) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <div className="bg-primary p-12 text-center text-white">
            <KeyRound size={48} className="mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-headline font-bold">الأمان والمصداقية</h2>
            <p className="text-xs opacity-80 mt-2 font-medium">يرجى إدخال رمز التحقق الخاص بـ XMOOD STORE</p>
          </div>
          <CardContent className="p-12">
            <form onSubmit={handlePinSubmit} className="space-y-8">
              <Input 
                type="password" 
                maxLength={4} 
                placeholder="****" 
                className="h-20 text-center text-5xl font-black tracking-widest rounded-3xl bg-slate-50 border-none shadow-inner"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full h-16 bg-slate-900 hover:bg-primary rounded-2xl font-bold text-white shadow-xl transition-all">
                تأكيد الدخول الآمن
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-body">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Card className="w-full max-w-lg border-none shadow-2xl rounded-[4rem] overflow-hidden bg-white">
          <div className="bg-slate-900 p-12 text-center text-white">
            <div className="mx-auto w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0 cursor-pointer">
              <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-headline font-bold">XMOOD STORE</h2>
            <p className="text-[10px] opacity-50 mt-4 tracking-[0.5em] font-black uppercase">Official Secure Portal</p>
          </div>
          
          <CardContent className="p-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-slate-100 rounded-[2rem] p-2 h-16">
                <TabsTrigger value="login" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold">تسجيل</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-fade-in space-y-8">
                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 pr-4">البريد الإلكتروني</Label>
                    <Input type="email" placeholder="name@example.com" className="h-14 rounded-2xl border-none bg-slate-50 font-bold px-6" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 pr-4">كلمة المرور</Label>
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl border-none bg-slate-50 font-bold px-6" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-16 rounded-2xl shadow-xl shadow-primary/10" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "فتح بوابة الحساب"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full h-16 rounded-2xl border-slate-100 font-bold flex gap-3 text-slate-600 justify-center">
                    <Chrome size={20} className="text-red-500" /> الدخول عبر Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in space-y-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <Input placeholder="الاسم الكامل" className="h-14 rounded-2xl border-none bg-slate-50 font-bold px-6" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-14 rounded-2xl border-none bg-slate-50 font-bold px-6" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 rounded-2xl border-none bg-slate-50 font-bold px-6" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-16 rounded-2xl shadow-xl mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إنشاء الهوية الرقمية"}
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
