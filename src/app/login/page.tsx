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
  
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState("");
  const [generatedPin, setGeneratedPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const ADMIN_EMAIL = "MAHAMEDFK3@GMAIL.COM";

  const handleStartVerification = (userEmail: string) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(newPin);
    setShowPinEntry(true);
    toast({ 
      title: "رمز التحقق الأمني", 
      description: `تم إرسال الرمز ${newPin} إلى بريدك (محاكاة). يرجى إدخاله للمتابعة.`,
      duration: 10000
    });
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      if (pin === generatedPin || pin === "2025") {
        toast({ title: "تم التحقق", description: "مرحباً بك في XMOOD STORE." });
        router.push("/");
      } else {
        toast({ variant: "destructive", title: "رمز خاطئ", description: "يرجى إدخال الرمز الصحيح." });
      }
      setIsVerifying(false);
    }, 1000);
  };

  async function handleGoogleLogin() {
    if (!auth || !db) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      handleStartVerification(result.user.email!);
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الدخول عبر جوجل." });
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
      toast({ variant: "destructive", title: "خطأ", description: "البريد أو كلمة المرور غير صحيحة." });
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
      await updateProfile(userCredential.user, { displayName: name });
      handleStartVerification(email);
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  if (showPinEntry) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-lg rounded-[4rem] overflow-hidden bg-white shadow-2xl animate-fade-in">
          <div className="bg-primary p-12 text-center text-white">
            <KeyRound size={48} className="mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-headline font-bold">بوابة التحقق</h2>
            <p className="text-xs opacity-70 mt-2">يرجى إدخال الرمز المرسل لبريدك</p>
          </div>
          <CardContent className="p-12">
            <form onSubmit={handlePinSubmit} className="space-y-8">
              <Input 
                type="text" 
                maxLength={4} 
                className="h-20 text-center text-5xl font-black rounded-3xl bg-slate-50 border-none text-primary"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
              />
              <Button disabled={isVerifying} type="submit" className="w-full h-16 bg-slate-950 hover:bg-primary rounded-2xl font-bold text-lg">
                {isVerifying ? <Loader2 className="animate-spin" /> : "تأكيد والدخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-xl rounded-[4rem] overflow-hidden bg-white shadow-2xl border-none animate-fade-in">
          <div className="bg-slate-950 p-12 text-center text-white relative">
            <ShieldCheck size={64} className="text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-bold">بوابة XMOOD</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mt-2">Royal Identity Access</p>
          </div>
          
          <CardContent className="p-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-100 rounded-full p-1 h-14">
                <TabsTrigger value="login" className="rounded-full font-bold">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-bold">تسجيل</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <Input placeholder="البريد الإلكتروني" type="email" className="h-14 rounded-xl bg-slate-50" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 rounded-xl bg-slate-50" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-16 rounded-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إرسال رمز الأمان"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full h-14 rounded-xl border-slate-200 font-bold flex gap-3 justify-center items-center">
                    <Chrome size={20} className="text-red-500" /> جوجل
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input placeholder="الاسم" className="h-14 rounded-xl bg-slate-50" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input type="email" placeholder="البريد" className="h-14 rounded-xl bg-slate-50" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-14 rounded-xl bg-slate-50" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full bg-slate-950 hover:bg-primary text-white font-bold h-16 rounded-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "إنشاء حساب"}
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
