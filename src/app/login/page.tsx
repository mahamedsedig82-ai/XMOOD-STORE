"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Chrome } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: "تأكد من صحة البريد الإلكتروني وكلمة المرور",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: "فشل تسجيل الدخول باستخدام جوجل",
      });
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-md border shadow-lg text-right">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
              <ShieldCheck size={28} />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">تسجيل الدخول</CardTitle>
            <CardDescription className="text-xs">مرحباً بك مجدداً في إكسيجو ماركت بليس</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    type="email" 
                    placeholder="البريد الإلكتروني" 
                    className="pr-10 h-11 border-primary/20 focus-visible:ring-primary text-right" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    type="password" 
                    placeholder="كلمة المرور" 
                    className="pr-10 h-11 border-primary/20 focus-visible:ring-primary text-right" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11" disabled={loading}>
                {loading ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-muted-foreground font-bold">أو عبر</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 border-primary text-primary font-bold hover:bg-primary/5 gap-2"
              onClick={handleGoogleLogin}
            >
              Google <Chrome size={18} />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}