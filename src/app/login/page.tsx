
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
  const ADMIN_NAME = "XMOOD STORE";

  // دالة لإكمال الدخول بعد التحقق من الـ PIN
  const completeLogin = async (user: any) => {
    toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في XMOOD STORE" });
    router.push("/");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "2025") { // رمز التحقق الافتراضي
      completeLogin(pendingUser);
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
          walletBalance: isAdmin ? 1000000 : 0, // رصيد كامل للادمن
          role: isAdmin ? 'admin' : 'user',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
      
      setPendingUser(user);
      setShowPinEntry(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول عبر Google", description: "يرجى المحاولة مرة أخرى" });
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
      <main className="min-h-screen bg-white font-body flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden">
          <div className="bg-primary p-10 text-center text-white">
            <KeyRound size={48} className="mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-headline font-bold">رمز التحقق الأمني</h2>
            <p className="text-xs opacity-80 mt-2">يرجى إدخال رمز التحقق الخاص بـ XMOOD</p>
          </div>
          <CardContent className="p-10">
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <Input 
                type="password" 
                maxLength={4} 
                placeholder="0000" 
                className="h-16 text-center text-3xl font-black tracking-[1em] rounded-2xl bg-slate-50 border-none"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full h-14 bg-slate-900 rounded-2xl font-bold text-white">
                تأكيد الرمز
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-body">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <Card className="w-full max-w-lg border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
          <div className="bg-primary p-12 text-center text-white relative">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-[1.8rem] flex items-center justify-center mb-6 backdrop-blur-xl border border-white/30 shadow-inner">
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-headline font-bold tracking-tight">XMOOD STORE</h2>
            <p className="text-[10px] opacity-70 mt-3 font-black tracking-[0.4em] uppercase">Private Security Gate</p>
          </div>
          
          <CardContent className="p-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-50 rounded-[1.8rem] p-1.5 h-16">
                <TabsTrigger value="login" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold">تسجيل جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-fade-in">
                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div className="space-y-2 text-right">
                    <Label className="text-[10px] font-black text-slate-400 pr-2 uppercase">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input type="email" placeholder="mail@example.com" className="pr-14 h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-[10px] font-black text-slate-400 pr-2 uppercase">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input type="password" placeholder="••••••••" className="pr-14 h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-16 rounded-2xl shadow-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "تسجيل الدخول"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full h-16 rounded-2xl border-slate-100 hover:bg-slate-50 font-bold flex gap-3 text-slate-600 justify-center">
                    <Chrome className="text-red-500 w-5 h-5" /> الدخول عبر Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-1 text-right">
                    <Label className="text-[10px] font-black text-slate-400 pr-2 uppercase">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input placeholder="اسمك الكامل" className="pr-14 h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-[10px] font-black text-slate-400 pr-2 uppercase">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input type="email" placeholder="mail@example.com" className="pr-14 h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-[10px] font-black text-slate-400 pr-2 uppercase">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input type="password" placeholder="كلمة مرور قوية" className="pr-14 h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-16 rounded-2xl shadow-xl mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إنشاء الحساب"}
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
