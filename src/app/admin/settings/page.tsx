
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Globe, Shield, Save, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminSettingsPRO() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: {
      primaryColor: "#d4af37",
      backgroundColor: "#ffffff",
      fontFamily: "PT Sans",
      logoUrl: ""
    },
    siteInfo: {
      title: "XMOOD STORE",
      subtitle: "Digital Sovereignty",
      heroTitle: "XMOOD PRO MAX",
      heroDescription: "المنصة الرقمية المتكاملة لإدارة الأصول والتصاميم."
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
      toast({ title: "تم تحديث القالب", description: "تم تطبيق التغييرات البصرية على المنصة فوراً." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الإعدادات." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="space-y-10 animate-fade-up" dir="rtl">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900">محرك القوالب PRO</h1>
          <p className="text-slate-500">تحكم كامل في الهوية البصرية وتجربة المستخدم.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-14">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} className="ml-2" /> حفظ التغييرات</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl h-14 shadow-sm border mb-8">
          <TabsTrigger value="visual" className="rounded-xl px-8 flex gap-2"><Palette size={18} /> المظهر البصري</TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl px-8 flex gap-2"><Globe size={18} /> معلومات الموقع</TabsTrigger>
          <TabsTrigger value="system" className="rounded-xl px-8 flex gap-2"><Layout size={18} /> إعدادات النظام</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="luxury-card p-8">
              <CardTitle className="text-xl mb-6">الألوان والخطوط</CardTitle>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>اللون الأساسي (Primary)</Label>
                  <div className="flex gap-4">
                    <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-12 w-20 p-1" />
                    <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>عائلة الخطوط</Label>
                  <Input value={form.appearance.fontFamily} onChange={e => setForm({...form, appearance: {...form.appearance, fontFamily: e.target.value}})} className="h-12" />
                </div>
              </div>
            </Card>

            <Card className="luxury-card p-8">
              <CardTitle className="text-xl mb-6">رابط الشعار السيادي</CardTitle>
              <div className="space-y-6 text-center">
                <div className="w-32 h-32 mx-auto rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center bg-slate-50 overflow-hidden">
                  {form.appearance.logoUrl ? <img src={form.appearance.logoUrl} className="object-cover" /> : <Palette size={40} className="text-slate-200" />}
                </div>
                <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} placeholder="رابط URL للشعار..." className="h-12" />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="info">
          <Card className="luxury-card p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label>عنوان الموقع</Label>
                <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>العنوان الفرعي</Label>
                <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ترويصة الـ Hero</Label>
              <Input value={form.siteInfo.heroTitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroTitle: e.target.value}})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>وصف الـ Hero</Label>
              <Input value={form.siteInfo.heroDescription} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroDescription: e.target.value}})} className="h-12" />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
