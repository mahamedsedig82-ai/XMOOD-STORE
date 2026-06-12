"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Globe, Save, Loader2, Image as ImageIcon, Type, Languages } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsVisualPRO() {
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
      title: "XMOOD",
      subtitle: "Digital Excellence",
      heroTitle: "وجهتك الرقمية الفاخرة",
      heroDescription: "نقدم لك أرقى باقات شحن الألعاب، الحسابات المميزة، والخدمات الرقمية والاحترافية بأعلى معايير الأمان والسرعة."
    },
    translations: {
      storeTitle: "متجر الخدمات الرقمية",
      marketTitle: "مجتمع اللاعبين",
      supportTitle: "المساعد الذكي",
      footerDesc: "نجمع بين الجودة الرقمية والاحترافية الإبداعية لمنحك أفضل الخدمات في عالم الألعاب والتصميم.",
      botGreeting: "أهلاً بك في XMOOD! أنا مساعدك الذكي. كيف يمكنني جعل تجربتك أفضل اليوم؟"
    }
  });

  useEffect(() => {
    if (config) setForm(prev => ({ ...prev, ...config }));
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, {
        ...form,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "تم تحديث الإعدادات", description: "تم تطبيق التغييرات على المتجر بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحفظ", description: "حدث خطأ أثناء الاتصال بالنظام." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-40">
      <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-up" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">إعدادات المتجر</h1>
          <p className="text-zinc-500 mt-3 font-bold uppercase tracking-widest text-[10px]">Store Identity Engine</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ التغييرات</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-zinc-950 p-1 rounded-3xl h-18 border border-white/5 mb-10 flex gap-4 px-3">
          <TabsTrigger value="visual" className="flex-1 rounded-2xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
            <Palette size={18} className="ml-2" /> المظهر
          </TabsTrigger>
          <TabsTrigger value="texts" className="flex-1 rounded-2xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all">
            <Languages size={18} className="ml-2" /> النصوص
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex-1 rounded-2xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all">
            <Layout size={18} className="ml-2" /> الواجهة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="luxury-card p-10">
              <CardTitle className="text-2xl mb-8 gold-text flex items-center gap-4"><Palette className="text-primary" /> الألوان</CardTitle>
              <div className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pr-4">اللون الأساسي (Gold)</Label>
                  <div className="flex gap-4">
                    <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 w-24 p-2 bg-zinc-900 border-none rounded-xl" />
                    <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 bg-zinc-900 border-none rounded-xl px-6 font-mono" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="luxury-card p-10">
              <CardTitle className="text-2xl mb-8 gold-text flex items-center gap-4"><ImageIcon className="text-primary" /> شعار المتجر</CardTitle>
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pr-4">رابط اللوغو (URL)</Label>
                  <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} placeholder="أدخل رابط الصورة..." className="h-16 bg-zinc-900 border-none rounded-xl px-6" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="texts">
          <Card className="luxury-card p-10 space-y-10">
            <CardTitle className="text-3xl gold-text flex items-center gap-4"><Type className="text-red-600" /> إدارة محتوى المتجر</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pr-4">اسم المتجر</Label>
                <Input value={form.translations.storeTitle} onChange={e => setForm({...form, translations: {...form.translations, storeTitle: e.target.value}})} className="h-16 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pr-4">ترحيب المساعد الذكي</Label>
                <Input value={form.translations.botGreeting} onChange={e => setForm({...form, translations: {...form.translations, botGreeting: e.target.value}})} className="h-16 bg-zinc-900 border-none rounded-xl px-6" />
              </div>
              <div className="col-span-2 space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pr-4">وصف التذييل</Label>
                <Textarea value={form.translations.footerDesc} onChange={e => setForm({...form, translations: {...form.translations, footerDesc: e.target.value}})} className="min-h-[120px] bg-zinc-900 border-none rounded-3xl p-8" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <Card className="luxury-card p-10 space-y-10">
            <CardTitle className="text-3xl gold-text flex items-center gap-4"><Layout className="text-primary" /> الواجهة الرئيسية</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="col-span-2 space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pr-4">العنوان الرئيسي</Label>
                <Input value={form.siteInfo.heroTitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroTitle: e.target.value}})} className="h-20 bg-zinc-900 border-none rounded-2xl px-8 font-black text-3xl gold-text" />
              </div>
              <div className="col-span-2 space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pr-4">الوصف التسويقي</Label>
                <Textarea value={form.siteInfo.heroDescription} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroDescription: e.target.value}})} className="min-h-[150px] bg-zinc-900 border-none rounded-3xl p-8 text-lg" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
