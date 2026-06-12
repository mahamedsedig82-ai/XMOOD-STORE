
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Globe, Shield, Save, Loader2, Sparkles, Image as ImageIcon, Type, Trash2, Languages, MessageSquare } from "lucide-react";
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
      title: "XMOOD PRO",
      subtitle: "MAX SOVEREIGNTY",
      heroTitle: "إمبراطورية XMOOD السيادية",
      heroDescription: "المنصة الرقمية المتكاملة لإدارة الأصول والتصاميم والخدمات الرقمية بأعلى معايير الجودة العالمية."
    },
    translations: {
      storeTitle: "مستودع الأصول الرقمية",
      marketTitle: "سوق النخبة الاجتماعي",
      supportTitle: "المساعد السيادي الذكي",
      footerDesc: "الريادة في الخدمات الرقمية والحلول الإبداعية. نجمع بين الفخامة البصرية والقوة التقنية لنمنحك تجربة سيادية لا تُنسى.",
      botGreeting: "أهلاً بك أيها القائد! أنا 'نواة-X' مرشدك الذكي. تذكر: لا تشارك رمز الطوارئ الخاص بك مع أي شخص!"
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
      toast({ title: "تم تطبيق التغييرات الإمبراطورية", description: "النظام البصري واللفظي مُحدّث الآن." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحفظ", description: "تعذر الوصول للنواة حالياً." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-60">
      <div className="w-20 h-20 border-t-4 border-primary border-r-4 border-r-red-600 rounded-[2rem] animate-spin" />
    </div>
  );

  return (
    <div className="space-y-16 animate-fade-up" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
        <div>
          <h1 className="text-7xl font-headline font-bold gold-text drop-shadow-xl">محرك الهوية PRO MAX</h1>
          <p className="text-zinc-600 mt-4 font-black uppercase tracking-[0.5em] text-[10px]">Sovereign Identity Orchestrator System</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-24 px-20 text-2xl shadow-primary/30">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={28} className="ml-4" /> تنفيذ البروتوكول</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-zinc-950 p-2 rounded-[3rem] h-24 shadow-2xl border border-white/5 mb-16 flex gap-6 px-4">
          <TabsTrigger value="visual" className="flex-1 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
            <Palette size={20} className="ml-3" /> المظهر البصري
          </TabsTrigger>
          <TabsTrigger value="texts" className="flex-1 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] data-[state=active]:bg-red-700 data-[state=active]:text-white transition-all">
            <Languages size={20} className="ml-3" /> المحرك اللفظي
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex-1 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-black transition-all">
            <Layout size={20} className="ml-3" /> واجهة الاستقبال
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="luxury-card p-12 legendary-border">
              <CardTitle className="text-3xl mb-12 gold-text flex items-center gap-5"><Palette className="text-red-600" /> السمات اللونية</CardTitle>
              <div className="space-y-12">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">اللون الذهبي (Primary Gold)</Label>
                  <div className="flex gap-4">
                    <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-20 w-32 p-3 bg-zinc-900 border-none rounded-2xl shadow-inner" />
                    <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-20 bg-zinc-900 border-none rounded-2xl px-10 font-mono text-xl" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">لون الخلفية العميق</Label>
                  <Input type="color" value={form.appearance.backgroundColor} onChange={e => setForm({...form, appearance: {...form.appearance, backgroundColor: e.target.value}})} className="h-20 w-full p-3 bg-zinc-900 border-none rounded-2xl shadow-inner" />
                </div>
              </div>
            </Card>

            <Card className="luxury-card p-12 legendary-border">
              <CardTitle className="text-3xl mb-12 gold-text flex items-center gap-5"><ImageIcon className="text-red-600" /> الهوية البصرية (اللوغو)</CardTitle>
              <div className="space-y-12">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">رابط اللوغو المخصص (URL)</Label>
                  <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} placeholder="ضع رابط الصورة هنا..." className="h-20 bg-zinc-900 border-none rounded-2xl px-10 font-bold text-xl" />
                </div>
                <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/20 text-center">
                   <p className="text-[11px] font-black text-primary uppercase mb-3 tracking-widest">تنبيه سيادي</p>
                   <p className="text-xs text-zinc-500 leading-relaxed font-bold">اترك الحقل فارغاً لاستخدام الشعار النصي المزخرف الافتراضي للموقع.</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="texts">
          <Card className="luxury-card p-12 space-y-12 legendary-border">
            <CardTitle className="text-4xl gold-text flex items-center gap-6"><Type className="text-red-700" /> إدارة المحتوى اللفظي</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">عنوان المتجر</Label>
                <Input value={form.translations.storeTitle} onChange={e => setForm({...form, translations: {...form.translations, storeTitle: e.target.value}})} className="h-20 bg-zinc-900 border-none rounded-2xl px-10 font-black text-2xl text-primary" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">عنوان السوق الاجتماعي</Label>
                <Input value={form.translations.marketTitle} onChange={e => setForm({...form, translations: {...form.translations, marketTitle: e.target.value}})} className="h-20 bg-zinc-900 border-none rounded-2xl px-10 font-black text-2xl text-red-600" />
              </div>
              <div className="col-span-2 space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">ترحيب روبوت الإرشاد (نواة-X)</Label>
                <Textarea value={form.translations.botGreeting} onChange={e => setForm({...form, translations: {...form.translations, botGreeting: e.target.value}})} className="min-h-[100px] bg-zinc-900 border-none rounded-[2rem] p-10 font-bold text-lg" />
              </div>
              <div className="col-span-2 space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">وصف التذييل (Footer)</Label>
                <Textarea value={form.translations.footerDesc} onChange={e => setForm({...form, translations: {...form.translations, footerDesc: e.target.value}})} className="min-h-[150px] bg-zinc-900 border-none rounded-[2rem] p-10 font-bold text-lg leading-relaxed" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <Card className="luxury-card p-12 space-y-12 legendary-border">
            <CardTitle className="text-4xl gold-text flex items-center gap-6"><Layout className="text-red-600" /> الواجهة الرئيسية (Hero)</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">اسم الموقع (Logo Text)</Label>
                <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-20 bg-zinc-900 border-none rounded-2xl px-10 font-black text-3xl" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">العنوان الفرعي</Label>
                <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-20 bg-zinc-900 border-none rounded-2xl px-10 font-black text-xl text-red-600 tracking-widest" />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">عنوان الـ Hero الكبير</Label>
              <Input value={form.siteInfo.heroTitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroTitle: e.target.value}})} className="h-28 bg-zinc-900 border-none rounded-[2.5rem] px-12 font-black text-5xl gold-text" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pr-6">الوصف التفصيلي (Hero Description)</Label>
              <Textarea value={form.siteInfo.heroDescription} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroDescription: e.target.value}})} className="min-h-[200px] bg-zinc-900 border-none rounded-[2.5rem] p-12 font-bold text-xl leading-relaxed text-zinc-400" />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
