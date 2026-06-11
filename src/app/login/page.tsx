
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
import { ShieldCheck, Mail, Lock, Chrome, Loader2, User, KeyRound, CheckCircle2 } from "lucide-react";
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
  const [isVerifying, setIsVerifying] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const ADMIN_EMAIL = "MAHAMEDFK3@GMAIL.COM";

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    // محاكاة التحقق من الرمز المرسل للبريد
    // الرمز الثابت حالياً هو 2025 لسهولة الاختبار
    setTimeout(() => {
      if (pin === "2025") {
        toast({ title: "تم التحقق بنجاح", description: "مرحباً بك في عالم XMOOD STORE الفاخر" });
        router.push("/");
      } else {
        toast({ variant: "destructive", title: "رمز غير صحيح", description: "يرجى التحقق من الرمز المرسل لبريدك" });
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
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
      
      setPendingUser(user);
      toast({ title: "تم إرسال الرمز", description: `تم إرسال رمز التحقق إلى ${user.email}` });
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
      toast({ title: "تحقق من بريدك", description: "تم إرسال رمز التحقق الأمني المكون من 4 أرقام" });
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
        walletBalance: isAdmin ? 999999999 : 0,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      });

      setPendingUser(user);
      toast({ title: "تم إنشاء الحساب", description: "يرجى إدخال الرمز المرسل لبريدك لإتمام التفعيل" });
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
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <KeyRound size={40} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-headline font-bold">تأكيد الهوية الملكية</h2>
            <p className="text-xs opacity-80 mt-2 font-medium">أدخل الرمز المكون من 4 أرقام المرسل إلى بريدك</p>
          </div>
          <CardContent className="p-12">
            <form onSubmit={handlePinSubmit} className="space-y-8">
              <div className="space-y-4">
                <Input 
                  type="password" 
                  maxLength={4} 
                  placeholder="0000" 
                  className="h-20 text-center text-5xl font-black tracking-[0.5em] rounded-3xl bg-slate-50 border-none shadow-inner text-primary"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  autoFocus
                />
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">XMOOD Security Protocol</p>
              </div>
              <Button disabled={isVerifying} type="submit" className="w-full h-16 bg-slate-900 hover:bg-primary rounded-2xl font-bold text-white shadow-xl transition-all text-lg">
                {isVerifying ? <Loader2 className="animate-spin" /> : "تأكيد الدخول الآمن"}
              </Button>
              <button type="button" className="w-full text-xs font-bold text-primary hover:underline">إعادة إرسال الرمز لبريدي</button>
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
            <div className="mx-auto w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
              <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-headline font-bold">بوابة XMOOD</h2>
            <p className="text-[10px] opacity-50 mt-4 tracking-[0.5em] font-black uppercase">Identity Verification Required</p>
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
                    {loading ? <Loader2 className="animate-spin" /> : "طلب رمز التحقق والدخول"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full h-16 rounded-2xl border-slate-100 font-bold flex gap-3 text-slate-600 justify-center items-center">
                    <Chrome size={20} className="text-red-500" /> الدخول السريع عبر Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in space-y-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <Input placeholder="الاسم الكامل" className="h-14 rounded-2xl border-none bg-slate-50 font-bold px-6" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-14 rounded-2xl border-none bg-slate-50 font-bold px-6" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 rounded-2xl border-none bg-slate-50 font-bold px-6" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-16 rounded-2xl shadow-xl mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إنشاء الهوية وطلب الرمز"}
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
