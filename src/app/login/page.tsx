"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Chrome, UserPlus, LogIn } from "lucide-react";
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
      
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الدخول عبر Google" });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2rem] overflow-hidden">
          <div className="bg-primary p-8 text-center text-white">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-headline font-bold">XMOOD STORE</h2>
            <p className="text-xs opacity-80 mt-2 font-light tracking-widest uppercase">Luxury Experience</p>
          </div>
          
          <CardContent className="p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted rounded-xl p-1">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white">دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white">تسجيل جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      type="email" 
                      placeholder="البريد الإلكتروني" 
                      className="pr-10 h-12 rounded-xl border-slate-200 focus:ring-primary" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      type="password" 
                      placeholder="كلمة المرور" 
                      className="pr-10 h-12 rounded-xl border-slate-200 focus:ring-primary" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg" disabled={loading}>
                    {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="relative">
                    <LogIn className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      type="text" 
                      placeholder="الاسم الكامل" 
                      className="pr-10 h-12 rounded-xl border-slate-200 focus:ring-primary" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      type="email" 
                      placeholder="البريد الإلكتروني" 
                      className="pr-10 h-12 rounded-xl border-slate-200 focus:ring-primary" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      type="password" 
                      placeholder="كلمة المرور" 
                      className="pr-10 h-12 rounded-xl border-slate-200 focus:ring-primary" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg" disabled={loading}>
                    {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">أو عبر</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 gap-2 rounded-xl"
              onClick={handleGoogleLogin}
            >
              متابعة باستخدام Google <Chrome size={18} className="text-primary" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}