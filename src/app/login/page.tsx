
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
import { ShieldCheck, Mail, Lock, Chrome, Fingerprint, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  async function handleGoogleLogin() {
    if (!auth || !db) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName || 'مستخدم XMOOD',
          email: user.email,
          walletBalance: 0,
          role: 'user',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
      
      toast({ title: "تم الدخول بنجاح", description: "مرحباً بك في XMOOD STORE" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "حدث خطأ أثناء الاتصال بحساب Google" });
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    
    if (!showVerification) {
      setShowVerification(true);
      return;
    }

    if (verificationCode.length < 4) {
      toast({ variant: "destructive", title: "رمز غير مكتمل", description: "يرجى إدخال رمز الأمان" });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً" });
      router.push("/");
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
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: name,
        email: email,
        walletBalance: 0,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      toast({ title: "تم إنشاء الحساب", description: "مرحباً بك في XMOOD STORE" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: error.message || "حدث خطأ غير متوقع" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white font-body">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <Card className="w-full max-w-lg border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white border border-slate-100">
          <div className="bg-primary p-12 text-center text-white relative">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-[1.8rem] flex items-center justify-center mb-6 backdrop-blur-xl border border-white/30 shadow-inner">
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-headline font-bold tracking-tight">XMOOD STORE</h2>
            <p className="text-[10px] opacity-70 mt-3 font-black tracking-[0.4em] uppercase">Private Security Gate</p>
          </div>
          
          <CardContent className="p-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-50 rounded-[1.5rem] p-1.5 h-14">
                <TabsTrigger value="login" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold transition-all">
                  دخول
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold transition-all">
                  تسجيل
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                {!showVerification ? (
                  <form onSubmit={handleEmailLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 pr-2">البريد الإلكتروني</label>
                      <div className="relative">
                        <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                        <Input 
                          type="email" 
                          placeholder="example@mail.com" 
                          className="pr-14 h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 pr-2">كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pr-14 h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-14 rounded-2xl shadow-xl transition-all" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : "متابعة"}
                    </Button>

                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">أو عبر</span></div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGoogleLogin}
                      className="w-full h-14 rounded-2xl border-slate-100 hover:bg-slate-50 font-bold flex gap-3 text-slate-600"
                      disabled={loading}
                    >
                      <Chrome className="text-red-500 w-5 h-5" /> تسجيل الدخول عبر Google
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <Fingerprint size={32} />
                      </div>
                      <h3 className="text-xl font-bold">رمز التحقق</h3>
                      <p className="text-sm text-muted-foreground mt-2">أدخل الرمز الأمني المكون من 4 أرقام المخصص لحسابك</p>
                    </div>
                    
                    <div className="flex justify-center gap-4" dir="ltr">
                      <Input 
                        maxLength={4}
                        placeholder="0000"
                        className="w-40 h-16 text-center text-3xl font-black tracking-[0.5em] rounded-2xl border-primary/20 bg-slate-50"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={() => setShowVerification(false)} 
                        variant="ghost" 
                        className="flex-1 h-14 rounded-2xl font-bold"
                      >
                        رجوع
                      </Button>
                      <Button 
                        onClick={handleEmailLogin} 
                        className="flex-[2] h-14 rounded-2xl bg-primary text-white font-bold shadow-lg"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="animate-spin" /> : "تأكيد الدخول"}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 pr-2 uppercase">الاسم الكامل</label>
                    <Input 
                      placeholder="اكتب اسمك هنا" 
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 pr-2 uppercase">البريد الإلكتروني</label>
                    <Input 
                      type="email" 
                      placeholder="mail@example.com" 
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 pr-2 uppercase">كلمة المرور</label>
                    <Input 
                      type="password" 
                      placeholder="اختر كلمة مرور قوية" 
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-14 rounded-2xl shadow-xl mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إنشاء حساب جديد"}
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
