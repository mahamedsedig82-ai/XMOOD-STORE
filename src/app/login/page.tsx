
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
  updateProfile 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, LogIn, UserPlus } from "lucide-react";
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
      console.error(error);
      const message = error.code === 'auth/invalid-api-key' 
        ? "خطأ في تهيئة النظام: يرجى التأكد من إعدادات API Key" 
        : "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      toast({ variant: "destructive", title: "فشل الدخول", description: message });
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
      console.error(error);
      const message = error.code === 'auth/invalid-api-key' 
        ? "خطأ في تهيئة النظام: يرجى التأكد من إعدادات API Key" 
        : "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً";
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <Card className="w-full max-w-lg border-none shadow-3xl rounded-[3rem] overflow-hidden bg-white border border-slate-100">
          <div className="bg-primary p-12 text-center text-white relative">
            <div className="mx-auto w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6 backdrop-blur-xl shadow-2xl border border-white/30">
              <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-headline font-bold tracking-tight">XMOOD STORE</h2>
            <p className="text-[10px] opacity-70 mt-3 font-black tracking-[0.5em] uppercase">Security Gate</p>
          </div>
          
          <CardContent className="p-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-slate-50 rounded-[1.5rem] p-1.5 h-16">
                <TabsTrigger value="login" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary font-bold transition-all flex gap-2">
                  <LogIn size={18} /> دخول
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary font-bold transition-all flex gap-2">
                  <UserPlus size={18} /> تسجيل
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 pr-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input 
                        type="email" 
                        placeholder="example@mail.com" 
                        className="pr-14 h-16 rounded-[1.5rem] border-slate-100 focus:ring-primary bg-slate-50/50 font-bold text-right" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 pr-2">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pr-14 h-16 rounded-[1.5rem] border-slate-100 focus:ring-primary bg-slate-50/50 font-bold text-right" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-16 rounded-[1.5rem] shadow-2xl transition-all text-lg mt-4" disabled={loading}>
                    {loading ? "جاري التحقق..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 pr-2">الاسم الكامل</label>
                    <div className="relative">
                      <LogIn className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input 
                        type="text" 
                        placeholder="اكتب اسمك هنا" 
                        className="pr-14 h-16 rounded-[1.5rem] border-slate-100 focus:ring-primary bg-slate-50/50 font-bold text-right" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 pr-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input 
                        type="email" 
                        placeholder="example@mail.com" 
                        className="pr-14 h-16 rounded-[1.5rem] border-slate-100 focus:ring-primary bg-slate-50/50 font-bold text-right" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 pr-2">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <Input 
                        type="password" 
                        placeholder="اختر كلمة مرور قوية" 
                        className="pr-14 h-16 rounded-[1.5rem] border-slate-100 focus:ring-primary bg-slate-50/50 font-bold text-right" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-16 rounded-[1.5rem] shadow-2xl transition-all text-lg mt-4" disabled={loading}>
                    {loading ? "جاري الإنشاء..." : "إنشاء حساب جديد"}
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
