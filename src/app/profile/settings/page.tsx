"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Camera, Smartphone, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileSettingsPage() {
  const { user, profile, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    phoneNumber: "",
    residence: "",
    bio: "",
    age: ""
  });
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || "",
        phoneNumber: profile.phoneNumber || "",
        residence: profile.residence || "",
        bio: profile.bio || "",
        age: profile.age?.toString() || ""
      });
      setPhotoURL(profile.photoURL || "");
    }
  }, [profile]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const SIZE = 300;
          canvas.width = SIZE; canvas.height = SIZE;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, SIZE, SIZE);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
      reader.onerror = reject;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      try {
        const b64 = await compressImage(file);
        setPhotoURL(b64);
        toast({ title: "تم تحديث الصورة، يرجى حفظ التغييرات" });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل معالجة الصورة" });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...form,
        age: Number(form.age) || 0,
        photoURL,
        updatedAt: serverTimestamp()
      });
      toast({ title: "تم تحديث ملفك الشخصي بنجاح" });
      router.push("/wallet");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={60} /></div>;
  if (!user) { router.replace("/login"); return null; }

  return (
    <main className="min-h-screen bg-background pb-32" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 max-w-4xl text-right">
        <header className="mb-12">
           <h1 className="text-4xl md:text-5xl font-headline font-black gold-text">تعديل الملف الشخصي</h1>
           <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">Personal Identity Settings</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-1">
              <Card className="luxury-card p-10 border-none bg-primary/5 flex flex-col items-center gap-8 shadow-2xl">
                 <div className="relative group">
                    <Avatar className="w-48 h-48 rounded-[3rem] border-4 border-background shadow-2xl overflow-hidden transition-transform duration-500 group-hover:scale-105">
                       <AvatarImage src={photoURL} className="object-cover" />
                       <AvatarFallback className="bg-muted text-primary text-5xl font-black">{form.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-4 right-4 bg-primary text-black p-4 rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-background"
                    >
                       <Camera size={24} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                 </div>
                 <div className="text-center">
                    <h3 className="text-2xl font-black">{profile?.displayName}</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{profile?.label || "عضو سيادي"}</p>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-2 space-y-8">
              <Card className="luxury-card p-10 border-none bg-card shadow-2xl">
                 <CardHeader className="p-0 mb-10 border-b pb-6">
                    <CardTitle className="text-2xl font-black flex items-center gap-4 text-primary">
                       <Zap size={24} className="animate-pulse" /> البيانات الأساسية
                    </CardTitle>
                 </CardHeader>
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">الاسم المعروض</Label>
                          <Input value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} placeholder="الاسم الذي يظهر للجميع" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رقم الواتساب</Label>
                          <Input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="+966..." />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">منطقة السكن</Label>
                          <Input value={form.residence} onChange={e => setForm({...form, residence: e.target.value})} placeholder="المدينة، الحي..." />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">العمر</Label>
                          <Input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="24" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">نبذة شخصية (Bio)</Label>
                       <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="اكتب شيئاً عن نفسك..." className="min-h-[120px]" />
                    </div>
                    
                    <div className="pt-8 flex gap-4">
                       <Button onClick={handleSave} disabled={isSaving} className="royal-button flex-1 h-18 text-xl shadow-xl shadow-primary/20">
                          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ ملفي الشخصي</>}
                       </Button>
                       <Button variant="outline" onClick={() => router.push("/wallet")} className="h-18 px-10 rounded-2xl border-primary/20 text-muted-foreground font-black text-xs uppercase tracking-widest">إلغاء</Button>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </main>
  );
}