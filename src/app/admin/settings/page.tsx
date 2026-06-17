
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, Globe, Save, Loader2, KeyRound, Wallet, 
  LayoutDashboard, Palette as PaletteIcon, Settings2, Info, Image as ImageIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsUniversalControl() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: { primaryColor: "#d4af37", logoUrl: "", faviconUrl: "" },
    siteInfo: { title: "XMOOD STORE", subtitle: "مركز الخدمات الرقمية المعتمدة", usdRate: "5400" },
    navLabels: { home: "الرئيسية", store: "المتجر", services: "سوق الخدمات", gallery: "معرض الإبداع", agents: "الوكلاء" },
    loginPage: { title: "تأمين الهوية الرقمية", subtitle: "انضم لنخبة متداولي الخدمات الرقمية عبر نظام دخول مشفر يضمن حماية بياناتك.", cardTitle: "بوابة الوصول المعتمدة", cardSubtitle: "Identity & Trust Management" },
    walletPage: { title: "المحفظة السيادية", uidTitle: "بروتوكول الإيداع", uidDesc: "استخدم معرفك (UID) الموحد للشحن عبر الوكلاء المعتمدين.", ledgerTitle: "سجل التدفقات المالية" },
    gallerySettings: { title: "معرض الإبداع", subtitle: "استلهم من أرقى التصاميم والهويات البصرية التي نفذتها أنامل خبراء الإبداع.", badge: "بورتفوليو نخبة المصممين والمبدعين", buttonText: "طلب تصميم مشابه" }
  });

  useEffect(() => {
    if (config) {
      setForm(prev => ({
        ...prev,
        ...config,
        appearance: { ...prev.appearance, ...(config.appearance || {}) },
        navLabels: { ...prev.navLabels, ...(config.navLabels || {}) },
        loginPage: { ...prev.loginPage, ...(config.loginPage || {}) },
        walletPage: { ...prev.walletPage, ...(config.walletPage || {}) },
        gallerySettings: { ...prev.gallerySettings, ...(config.gallerySettings || {}) }
      }));
    }
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم تثبيت الإعدادات الشاملة بنجاح" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center p-40 gap-4"><Loader2 className="w-12 h-12 text-primary animate-spin" /><p className="text-xs font-bold uppercase tracking-widest gold-text">جاري التحميل...</p></div>;

  return (
    <div className="space-y-12 animate-fade-in pb-20" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-10">
        <div className="text-right">
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text">مركز التحكم الشامل</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Universal Content & Strings Controller</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ التعديلات</>}
        </Button>
      </header>

      <Tabs defaultValue="nav" className="w-full">
        <TabsList className="bg-muted/50 p-2 rounded-[2rem] h-auto border mb-12 flex flex-wrap gap-2 justify-center">
          <TabsTrigger value="nav" className="rounded-2xl font-bold text-[9px] uppercase py-4 px-6 gap-2">نصوص القوائم</TabsTrigger>
          <TabsTrigger value="auth" className="rounded-2xl font-bold text-[9px] uppercase py-4 px-6 gap-2">بوابة الدخول</TabsTrigger>
          <TabsTrigger value="wallet" className="rounded-2xl font-bold text-[9px] uppercase py-4 px-6 gap-2">المحفظة</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-2xl font-bold text-[9px] uppercase py-4 px-6 gap-2">المعرض</TabsTrigger>
          <TabsTrigger value="visual" className="rounded-2xl font-bold text-[9px] uppercase py-4 px-6 gap-2">الهوية</TabsTrigger>
        </TabsList>

        <TabsContent value="nav">
           <Card className="luxury-card p-10 space-y-10 bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">الرئيسية</Label><Input value={form.navLabels.home} onChange={e => setForm({...form, navLabels: {...form.navLabels, home: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">المتجر</Label><Input value={form.navLabels.store} onChange={e => setForm({...form, navLabels: {...form.navLabels, store: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">سوق الخدمات</Label><Input value={form.navLabels.services} onChange={e => setForm({...form, navLabels: {...form.navLabels, services: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">المعرض</Label><Input value={form.navLabels.gallery} onChange={e => setForm({...form, navLabels: {...form.navLabels, gallery: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">الوكلاء</Label><Input value={form.navLabels.agents} onChange={e => setForm({...form, navLabels: {...form.navLabels, agents: e.target.value}})} /></div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="auth">
           <Card className="luxury-card p-10 space-y-6 bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">العنوان الرئيسي</Label><Input value={form.loginPage.title} onChange={e => setForm({...form, loginPage: {...form.loginPage, title: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">عنوان البطاقة</Label><Input value={form.loginPage.cardTitle} onChange={e => setForm({...form, loginPage: {...form.loginPage, cardTitle: e.target.value}})} /></div>
                 <div className="col-span-full space-y-2"><Label className="text-[10px] font-black uppercase text-primary">الوصف</Label><Textarea value={form.loginPage.subtitle} onChange={e => setForm({...form, loginPage: {...form.loginPage, subtitle: e.target.value}})} /></div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="wallet">
           <Card className="luxury-card p-10 space-y-6 bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">عنوان المحفظة</Label><Input value={form.walletPage.title} onChange={e => setForm({...form, walletPage: {...form.walletPage, title: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">عنوان الـ UID</Label><Input value={form.walletPage.uidTitle} onChange={e => setForm({...form, walletPage: {...form.walletPage, uidTitle: e.target.value}})} /></div>
                 <div className="col-span-full space-y-2"><Label className="text-[10px] font-black uppercase text-primary">شرح نظام الإيداع</Label><Textarea value={form.walletPage.uidDesc} onChange={e => setForm({...form, walletPage: {...form.walletPage, uidDesc: e.target.value}})} /></div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="gallery">
           <Card className="luxury-card p-10 space-y-6 bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">عنوان المعرض</Label><Input value={form.gallerySettings.title} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, title: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">نص الزر</Label><Input value={form.gallerySettings.buttonText} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, buttonText: e.target.value}})} /></div>
                 <div className="col-span-full space-y-2"><Label className="text-[10px] font-black uppercase text-primary">الوصف</Label><Textarea value={form.gallerySettings.subtitle} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, subtitle: e.target.value}})} /></div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="visual">
           <Card className="luxury-card p-10 space-y-8 bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4"><Label className="text-[10px] font-black uppercase">رابط الشعار</Label><Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} /></div>
                 <div className="space-y-4"><Label className="text-[10px] font-black uppercase">لون الهوية</Label><div className="flex gap-4"><Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="w-24 h-14" /><Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 font-mono font-bold" /></div></div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
