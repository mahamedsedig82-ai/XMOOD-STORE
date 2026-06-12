"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Upload, Image as ImageIcon, Type, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: siteSettings, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    siteTitle: "XMOOD STORE",
    siteSubtitle: "Sovereign Store",
    heroTitle: "XMOOD STORE",
    heroDescription: "المنصة الأكثر فخامة في العالم الرقمي.",
    logoData: "",
  });

  useEffect(() => {
    if (siteSettings) {
      setForm({
        siteTitle: siteSettings.siteTitle || "XMOOD STORE",
        siteSubtitle: siteSettings.siteSubtitle || "Sovereign Store",
        heroTitle: siteSettings.heroTitle || "XMOOD STORE",
        heroDescription: siteSettings.heroDescription || "المنصة الأكثر فخامة في العالم الرقمي.",
        logoData: siteSettings.logoData || "",
      });
    }
  }, [siteSettings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, logoData: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), {
        ...form,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "تم التحديث الملكي", description: "تم حفظ إعدادات الهوية بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الإعدادات." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="space-y-12 animate-fade-in text-white" dir="rtl">
      <header className="border-b border-primary/10 pb-8">
        <h1 className="text-5xl font-headline font-bold gold-text">مركز التحكم في الهوية</h1>
        <p className="text-slate-500 mt-2">تخصيص الشعار، العناوين، والترويصات الخاصة بالإمبراطورية.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="luxury-card border-none p-10">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-4 gold-text">
              <ImageIcon className="text-primary" /> شعار المنصة السيادي
            </CardTitle>
            <CardDescription>ارفع شعاراً جديداً ليتم تطبيقه في كافة أقسام الموقع.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-8 text-center">
            <div className="relative group mx-auto w-48 h-48 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center bg-zinc-900 overflow-hidden shadow-2xl">
              {form.logoData ? (
                <img src={form.logoData} className="w-full h-full object-cover" alt="Logo Preview" />
              ) : (
                <div className="text-zinc-600 flex flex-col items-center">
                  <Upload size={40} />
                  <span className="text-[10px] font-black uppercase tracking-widest mt-2">No Logo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer royal-button h-10 px-4 text-[10px]">
                  تغيير الشعار
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">بصيغة PNG أو JPG (يفضل خلفية شفافة)</p>
          </CardContent>
        </Card>

        <Card className="luxury-card border-none p-10">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-4 gold-text">
              <Type className="text-primary" /> نصوص وترويصات الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary">عنوان الموقع الرئيسي</Label>
                <Input value={form.siteTitle} onChange={e => setForm({...form, siteTitle: e.target.value})} className="h-12 bg-black border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary">العنوان الفرعي</Label>
                <Input value={form.siteSubtitle} onChange={e => setForm({...form, siteSubtitle: e.target.value})} className="h-12 bg-black border-none rounded-xl font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-primary">عنوان قسم الـ Hero (الصفحة الرئيسية)</Label>
              <Input value={form.heroTitle} onChange={e => setForm({...form, heroTitle: e.target.value})} className="h-12 bg-black border-none rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-primary">وصف الـ Hero</Label>
              <Textarea value={form.heroDescription} onChange={e => setForm({...form, heroDescription: e.target.value})} className="h-24 bg-black border-none rounded-xl font-bold" />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex justify-center">
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="royal-button h-16 px-20 text-xl shadow-2xl"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ التغييرات السيادية</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
