
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
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Chrome, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً في XMOOD STORE" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
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
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        displayName: name,
        email: email,
        walletBalance: 0,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      toast({ title: "تم إنشاء الحساب", description: "مرحباً بك في عائلة XMOOD STORE" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    // إعداد اختياري لتحسين التوافق
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          walletBalance: 0,
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      }
      
      toast({ title: "تم الدخول بنجاح", description: `مرحباً ${result.user.displayName}` });
      router.push("/");
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      let msg = "فشل الدخول عبر Google";
      if (error.code === 'auth/popup-blocked') msg = "تم حظر النافذة المنبثقة، يرجى السماح بها";
      if (error.code === 'auth/cancelled-popup-request') msg = "تم إلغاء عملية الدخول";
      
      toast({ 
        variant: "destructive", 
        title: "خطأ في المصادقة", 
        description: msg 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50/50">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md border-none shadow-3xl rounded-[2.5rem] overflow-hidden bg-white">
          <div className="bg-primary p-10 text-center text-white relative">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-md shadow-inner border border-white/20">
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-headline font-bold tracking-tight">XMOOD STORE</h2>
            <p className="text-[10px] opacity-60 mt-2 font-bold tracking-[0.4em] uppercase">Private Login</p>
          </div>
          
          <CardContent className="p-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-100 rounded-2xl p-1.5 h-14">
                <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">تسجيل</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input 
                      type="email" 
                      placeholder="البريد الإلكتروني" 
                      className="pr-12 h-14 rounded-2xl border-slate-200 focus:ring-primary bg-slate-50/50" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input 
                      type="password" 
                      placeholder="كلمة المرور" 
                      className="pr-12 h-14 rounded-2xl border-slate-200 focus:ring-primary bg-slate-50/50" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-14 rounded-2xl shadow-xl transition-all" disabled={loading}>
                    {loading ? "جاري التحقق..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="relative">
                    <LogIn className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input 
                      type="text" 
                      placeholder="الاسم الكامل" 
                      className="pr-12 h-14 rounded-2xl border-slate-200 focus:ring-primary bg-slate-50/50" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input 
                      type="email" 
                      placeholder="البريد الإلكتروني" 
                      className="pr-12 h-14 rounded-2xl border-slate-200 focus:ring-primary bg-slate-50/50" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input 
                      type="password" 
                      placeholder="كلمة المرور" 
                      className="pr-12 h-14 rounded-2xl border-slate-200 focus:ring-primary bg-slate-50/50" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-14 rounded-2xl shadow-xl transition-all" disabled={loading}>
                    {loading ? "جاري الإنشاء..." : "فتح حساب جديد"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-6 text-slate-300 font-bold tracking-[0.3em]">أو المتابعة عبر</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-14 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 gap-3 rounded-2xl transition-all"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Chrome size={20} className="text-primary" />
              حساب Google الذكي
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
