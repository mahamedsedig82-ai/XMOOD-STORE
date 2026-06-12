
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Globe, Shield, Save, Loader2, Sparkles, Image as ImageIcon, Type, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminSettingsPRO() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: {
      primaryColor: "#d4af37",
      backgroundColor: "#09090b",
      fontFamily: "PT Sans",
      logoUrl: ""
    },
    siteInfo: {
      title: "XMOOD PRO MAX",
      subtitle: "Sovereign Digital Empire",
      heroTitle: "إمبراطورية XMOOD السيادية",
      heroDescription: "المنصة الرقمية المتكاملة لإدارة الأصول والتصاميم والخدمات الرقمية بأعلى معايير الجودة العالمية."
    }
  });

  useEffect(() => {
    if (config) setForm(config as any);
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, {
        ...form,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "تم تحديث البروتوكول", description: "تم تطبيق التعديلات البصرية واللفظية فوراً." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحفظ", description: "تعذر الوصول للنواة حالياً." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({
          ...form,
          appearance: { ...form.appearance, logoUrl: reader.result as string }
        });
        toast({ title: "تم تحميل الشعار", description: "تمت معالجة الصورة بنجاح." });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-40">
      <Loader2 className="animate-spin text-primary" size={64} />
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-up" dir="rtl">
      <header className="flex justify-between items-center gap-10">
        <div>
          <h1 className="text-6xl font-headline font-bold gold-text">محرك الهوية PRO MAX</h1>
          <p className="text-zinc-500 mt-2 font-black uppercase tracking-[0.5em] text-[10px]">Sovereign Identity Orchestrator</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-20 px-16 text-xl">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> تنفيذ التعديلات</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-zinc-950 p-2 rounded-[2rem] h-20 shadow-2xl border border-white/5 mb-12 flex gap-4">
          <TabsTrigger value="visual" className="rounded-xl px-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
            <Palette size={18} className="ml-2" /> المظهر البصري
          </TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl px-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all">
            <Globe size={18} className="ml-2" /> معلومات الإمبراطورية
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-xl px-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all">
            <Shield size={18} className="ml-2" /> أمان النظام
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="luxury-card p-12 legendary-border">
              <CardTitle className="text-2xl mb-10 gold-text flex items-center gap-4"><Palette className="text-red-600" /> الألوان والسمات</CardTitle>
              <div className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 pr-4">اللون الملكي (Primary Gold)</Label>
                  <div className="flex gap-4">
                    <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 w-24 p-2 bg-zinc-900 border-none rounded-xl" />
                    <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 bg-zinc-900 border-none rounded-xl px-8 font-mono" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 pr-4">لون الخلفية السيادية</Label>
                  <Input type="color" value={form.appearance.backgroundColor} onChange={e => setForm({...form, appearance: {...form.appearance, backgroundColor: e.target.value}})} className="h-16 w-full p-2 bg-zinc-900 border-none rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 pr-4">عائلة الخطوط الاحترافية</Label>
                  <Input value={form.appearance.fontFamily} onChange={e => setForm({...form, appearance: {...form.appearance, fontFamily: e.target.value}})} className="h-16 bg-zinc-900 border-none rounded-xl px-8 font-bold" />
                </div>
              </div>
            </Card>

            <Card className="luxury-card p-12 legendary-border">
              <CardTitle className="text-2xl mb-10 gold-text flex items-center gap-4"><ImageIcon className="text-red-600" /> الشعار السيادي (Logo)</CardTitle>
              <div className="space-y-10 text-center">
                <div className="w-48 h-48 mx-auto rounded-[2.5rem] border-2 border-dashed border-primary/20 flex items-center justify-center bg-zinc-900 overflow-hidden shadow-2xl relative group">
                  {form.appearance.logoUrl ? (
                    <>
                      <img src={form.appearance.logoUrl} className="object-cover w-full h-full" alt="Logo Preview" />
                      <button 
                        onClick={() => setForm({...form, appearance: {...form.appearance, logoUrl: ""}})}
                        className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white font-black uppercase text-xs"
                      >
                        <Trash2 size={24} className="mb-2" /> حذف الشعار
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-700">
                      <ImageIcon size={64} />
                      <span className="text-[8px] font-black uppercase tracking-widest">No Logo Uploaded</span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="logo-upload" />
                  <label htmlFor="logo-upload">
                    <Button asChild className="w-full h-16 royal-button cursor-pointer">
                      <span><ImageIcon className="ml-3" /> رفع شعار من الجهاز</span>
                    </Button>
                  </label>
                </div>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">توصية: يفضل استخدام صور شفافة (PNG) بحجم 512x512</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="info">
          <Card className="luxury-card p-12 space-y-12 legendary-border">
            <CardTitle className="text-3xl gold-text flex items-center gap-4"><Type className="text-red-600" /> تعديل نصوص الإمبراطورية</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 pr-4">عنوان الموقع</Label>
                <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-16 bg-zinc-900 border-none rounded-xl px-8 font-black text-xl text-primary" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 pr-4">العنوان الفرعي (Subtitle)</Label>
                <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-16 bg-zinc-900 border-none rounded-xl px-8 font-bold text-red-500" />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 pr-4">ترويصة الـ Hero الرئيسية</Label>
              <Input value={form.siteInfo.heroTitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroTitle: e.target.value}})} className="h-24 bg-zinc-900 border-none rounded-[2rem] px-10 font-black text-4xl gold-text" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 pr-4">وصف الـ Hero التفصيلي</Label>
              <textarea 
                value={form.siteInfo.heroDescription} 
                onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroDescription: e.target.value}})} 
                className="w-full min-h-[200px] bg-zinc-900 border-none rounded-[2rem] p-10 font-bold text-lg text-zinc-400 focus:ring-1 focus:ring-primary/20" 
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
