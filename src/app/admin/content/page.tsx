"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Database, Save, Loader2, Globe, Layout, Smartphone, MessageSquare, Zap, Megaphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function AdminContentManager() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    siteInfo: { title: "XMOOD STORE", subtitle: "", description: "", copyright: "" },
    pageContent: { heroTitle: "", heroDescription: "", footerAbout: "" },
    contact: { whatsapp: "", email: "", telegram: "", workHours: "" },
    ads: { headerBanner: "", promoText: "", isActive: false }
  });

  useEffect(() => {
    if (config) setForm(prev => ({ ...prev, ...config }));
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم حفظ التغييرات سيادياً" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-40 text-center animate-pulse font-black gold-text">LOADING ENGINE...</div>;

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-12">
        <div className="text-right">
          <h1 className="text-5xl font-headline font-black gold-text leading-tight">إدارة محتوى المنصة</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Universal Content Management & Ad Control</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ كافة التحديثات</>}
        </Button>
      </header>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-white/5 p-2 rounded-[2.5rem] h-auto border mb-12 flex flex-wrap gap-2 px-6">
          <TabsTrigger value="site" className="flex-1 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest py-5">
            <Globe size={18} className="ml-3" /> الهوية والبيانات
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-1 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest py-5">
            <Layout size={18} className="ml-3" /> المحتوى المرئي
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex-1 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest py-5">
            <Megaphone size={18} className="ml-3" /> الإعلانات والعروض
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest py-5">
            <MessageSquare size={18} className="ml-3" /> التواصل المباشر
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <Card className="luxury-card p-10 space-y-10 border-none shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">اسم المنصة الرئيسي</Label>
                  <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-16 bg-slate-100 dark:bg-zinc-900 border-none rounded-2xl font-black text-xl" />
               </div>
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">العنوان الفرعي (Subtitle)</Label>
                  <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-16 bg-slate-100 dark:bg-zinc-900 border-none rounded-2xl font-bold" />
               </div>
               <div className="col-span-full space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">نص حقوق الملكية (Copyright)</Label>
                  <Input value={form.siteInfo.copyright} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, copyright: e.target.value}})} className="h-16 bg-slate-100 dark:bg-zinc-900 border-none rounded-2xl font-mono text-xs" />
               </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card className="luxury-card p-12 space-y-12">
            <div className="space-y-8">
               <div className="flex items-center gap-4 text-primary">
                  <Zap size={32} />
                  <h3 className="text-2xl font-black">واجهة البداية (Hero Section)</h3>
               </div>
               <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">العنوان الرئيسي الضخم</Label>
                    <Input value={form.pageContent.heroTitle} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroTitle: e.target.value}})} className="h-18 bg-slate-100 dark:bg-zinc-900 border-none rounded-3xl font-black text-3xl gold-text" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">الوصف الجاذب للعملاء</Label>
                    <Textarea value={form.pageContent.heroDescription} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroDescription: e.target.value}})} className="bg-slate-100 dark:bg-zinc-900 border-none rounded-3xl min-h-[150px] p-8 text-xl font-medium leading-relaxed" />
                  </div>
               </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
           <Card className="luxury-card p-12 bg-amber-500/5 border-amber-500/20">
              <div className="flex items-center gap-4 text-amber-600 mb-10">
                 <Megaphone size={32} className="animate-bounce" />
                 <h3 className="text-2xl font-black">العروض الترويجية النشطة</h3>
              </div>
              <div className="space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رابط بانر العرض (Image URL)</Label>
                    <Input value={form.ads.headerBanner} onChange={e => setForm({...form, ads: {...form.ads, headerBanner: e.target.value}})} className="h-16 bg-white dark:bg-zinc-950 border-dashed border-amber-500/30 rounded-2xl" placeholder="https://..." />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">النص الترويجي المتحرك</Label>
                    <Input value={form.ads.promoText} onChange={e => setForm({...form, ads: {...form.ads, promoText: e.target.value}})} className="h-16 bg-white dark:bg-zinc-950 border-dashed border-amber-500/30 rounded-2xl font-bold text-amber-700" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="contact">
           <Card className="luxury-card p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { label: "رابط الواتساب المباشر", key: "whatsapp", icon: MessageSquare },
                { label: "معرف التيليجرام", key: "telegram", icon: Zap },
                { label: "البريد الإلكتروني للدعم", key: "email", icon: Globe },
                { label: "ساعات العمل الرسمية", key: "workHours", icon: Layout },
              ].map((item) => (
                <div key={item.key} className="space-y-4">
                   <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-3">
                     <item.icon size={14} className="text-primary" /> {item.label}
                   </Label>
                   <Input 
                     value={(form.contact as any)[item.key]} 
                     onChange={e => setForm({...form, contact: {...form.contact, [item.key]: e.target.value}})} 
                     className="h-14 bg-slate-100 dark:bg-zinc-900 border-none rounded-2xl font-bold" 
                   />
                </div>
              ))}
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
