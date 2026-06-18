"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { loginEmail, registerEmail, syncUserProfile, sendAccountVerification } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      return toast({ variant: "destructive", title: "بيانات ناقصة" });
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await registerEmail(email, password, fullName);
        await sendAccountVerification(res.user);
        await syncUserProfile(res.user, { fullName, phoneNumber: phone });
        toast({ title: "تم إنشاء الحساب", description: "يرجى تفعيل بريدك الإلكتروني." });
        router.push("/verify-email?waiting=true");
      } else {
        const res = await loginEmail(email, password);
        if (!res.user.emailVerified) {
          toast({ variant: "destructive", title: "الحساب غير موثق" });
          router.push("/verify-email?waiting=true");
          return;
        }
        await syncUserProfile(res.user);
        toast({ title: "مرحباً بك مجدداً" });
        router.replace("/wallet");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل العملية", description: "تأكد من صحة البيانات." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 flex justify-center">
        <Card className="w-full max-w-md luxury-card">
          <div className="p-8 text-center border-b bg-muted/10">
            <Shield size={40} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">تسجيل الدخول</h2>
          </div>
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">دخول</TabsTrigger>
                <TabsTrigger value="signup">تسجيل</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور</Label>
                  <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
                </div>
                <Button onClick={() => handleAuth('login')} disabled={loading} className="w-full royal-button">
                  {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} className="ml-2" /> دخول</>}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label>الاسم الكامل</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="الاسم هنا..." />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور</Label>
                  <Input value={password} onChange={e => setPassword(e.target.value)} type="password" />
                </div>
                <Button onClick={() => handleAuth('signup')} disabled={loading} className="w-full royal-button">
                  {loading ? <Loader2 className="animate-spin" /> : "إنشاء حساب"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}