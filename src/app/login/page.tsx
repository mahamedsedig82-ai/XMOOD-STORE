
"use client";

import { useState, useEffect } from "react";
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
  sendEmailVerification 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Globe, UserCircle, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'success' | 'verify' | 'complete_profile'>('auth');
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const handleGoogleLogin = async () => {
    if (!auth || !db || loading) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        setStep('complete_profile');
      } else {
        toast({ title: "مرحباً بك مجدداً", description: "تم تسجيل الدخول بنجاح." });
        router.push("/");
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast({ 
          title: "تنبيه", 
          description: "يبدو أنك أغلقت نافذة الدخول قبل الاكتمال. يرجى المحاولة مرة أخرى." 
        });
      } else if (error.code === 'auth/popup-blocked') {
        toast({ 
          variant: "destructive",
          title: "المتصفح حجب النافذة", 
          description: "يرجى السماح بالنوافذ المنبثقة لهذا الموقع من إعدادات متصفحك." 
        });
      } else {
        console.error("Auth Error:", error);
        toast({ 
          variant: "destructive", 
          title: "فشل الدخول", 
          description: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً." 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinishProfile = async () => {
    if (!auth?.currentUser || !phone || !db) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName?.split(" ")[0] || "عضو",
        fullName: user.displayName || "عضو بريميوم",
        email: user.email,
        phoneNumber: phone,
        walletBalance: 0,
        role: 'user',
        label: 'عضو موثق',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        isVerified: true,
        affinityPoints: 100
      });
      setStep('success');
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ البيانات." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || loading) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: fullName.split(" ")[0],
        fullName: fullName,
        email: email,
        phoneNumber: phone,
        walletBalance: 0,
        role: 'user',
        label: 'عضو بريميوم',
        photoURL: '',
        createdAt: new Date().toISOString(),
        isVerified: false,
        affinityPoints: 50,
        securityQuestion: "ما هو اسم مدرستك الأولى؟",
        securityAnswer: securityAnswer
      });
      
      setStep('verify');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || loading) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "البيانات المدخلة غير صحيحة." });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (step === 'complete_profile') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] bg-zinc-950 border border-primary/20 p-12 text-center">
          <Phone size={60} className="text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold gold-text mb-4">خطوة أخيرة..</h2>
          <p className="text-zinc-400 mb-8">يرجى إضافة رقم هاتفك لربطه بمحفظتك الرقمية وتأمين حسابك.</p>
          <Input 
            placeholder="رقم الهاتف..." 
            className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold text-lg mb-6 text-center"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <Button onClick={handleFinishProfile} disabled={loading || !phone} className="w-full h-16 royal-button text-xl">إتمام التسجيل</Button>
        </Card>
      </main>
    );
  }

  if (step === 'verify') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] bg-zinc-950 border border-primary/20 text-center p-12">
          <Mail size={80} className="text-primary mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-headline font-bold gold-text mb-4">تفعيل الحساب</h2>
          <p className="text-zinc-400 mb-8 font-medium">لقد أرسلنا رابط التفعيل إلى {email}.</p>
          <Button onClick={() => setStep('auth')} className="w-full h-16 rounded-2xl bg-white text-black font-bold text-xl">العودة للدخول</Button>
        </Card>
      </main>
    );
  }

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-xl rounded-[3rem] bg-zinc-950 border border-primary/20 text-center p-12">
          <UserCircle size={80} className="text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-headline font-bold gold-text mb-4">أهلاً بك في XMOOD</h2>
          <p className="text-zinc-400 mb-8 font-medium">تم إنشاء ملفك الشخصي بنجاح، أنت الآن عضو موثق في مجتمعنا.</p>
          <Button onClick={() => router.push("/")} className="w-full h-16 rounded-2xl bg-white text-black font-bold text-xl">انطلق للمتجر</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-screen pt-32">
        <Card className="w-full max-w-xl rounded-[3rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl">
          <div className="p-10 text-center bg-white/5 border-b border-white/5">
            <UserCircle size={56} className="text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-bold gold-text">دخول المتجر</h2>
          </div>
          <CardContent className="p-10">
            <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-white/5 text-lg font-bold mb-10 hover:bg-white/10" disabled={loading}>
              <Globe className="w-6 h-6 ml-3 text-blue-400" />
              متابعة عبر Google
            </Button>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 rounded-full p-1.5 h-16">
                <TabsTrigger value="login" className="rounded-full font-bold">تسجيل دخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-bold">حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold text-center" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold text-center" value={password} onChange={e => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full royal-button h-18 text-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "دخول"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <Input placeholder="الاسم الكامل" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold text-center" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  <Input placeholder="رقم الهاتف" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold text-center" value={phone} onChange={e => setPhone(e.target.value)} required />
                  <Input type="email" placeholder="البريد الإلكتروني" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold text-center" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="كلمة المرور" className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold text-center" value={password} onChange={e => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full royal-button h-18 text-xl" disabled={loading}>إنشاء الحساب</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
