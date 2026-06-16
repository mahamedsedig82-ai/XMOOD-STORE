"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Globe, Layout, MessageSquare, Zap, Megaphone, CheckCircle, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminContentManager() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    siteInfo: { title: "XMOOD STORE", subtitle: "", description: "", copyright: "" },
    pageContent: { heroTitle: "", heroDescription: "", footerAbout: "" },
    contact: { whatsapp: "", email: "", telegram: "", workHours: "" },
    ads: { headerBanner: "", promoText: "", isActive: false, buttonText: "اطلب الآن" }
  });

  useEffect(() => {
    if (config) setForm(prev => ({ ...prev, ...config }));
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم حفظ التحديثات الإعلانية والمحتوى" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-6">
       <Loader2 className="animate-spin text-primary" size={60} />
       <p className="text-[10px] font-black uppercase tracking-widest gold-text">Loading Content Engine...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-12">
        <div className="text-right">
          <h1 className="text-5xl font-headline font-black gold-text leading-tight">مركز التحكم بالمحتوى</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Universal Content Management & Ad Control</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> تثبيت كافة التعديلات</>}
        </Button>
      </header>

      <Tabs defaultValue="ads" className="w-full">
        <TabsList className="bg-muted/30 p-2 rounded-[2.5rem] h-auto border mb-12 flex flex-wrap gap-2 px-6">
          <TabsTrigger value="ads" className="flex-1 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest py-5 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Megaphone size={18} className="ml-3" /> الإعلانات والعروض
          </TabsTrigger>
          <TabsTrigger value="site" className="flex-1 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest py-5">
            <Globe size={18} className="ml-3" /> الهوية والبيانات
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-1 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest py-5">
            <Layout size={18} className="ml-3" /> المحتوى المرئي
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest py-5">
            <MessageSquare size={18} className="ml-3" /> التواصل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads">
           <Card className="luxury-card p-10 bg-primary/5 border-primary/20 space-y-10">
              <div className="flex items-center justify-between border-b pb-8">
                 <div className="flex items-center gap-4 text-primary">
                    <Megaphone size={40} className="animate-pulse" />
                    <div>
                       <h3 className="text-2xl font-black">البانر الإعلاني الرئيسي</h3>
                       <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Home Page Mega Banner Control</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-background px-8 py-4 rounded-2xl border">
                    <Label className="font-black text-xs uppercase">حالة الإعلان</Label>
                    <Switch 
                      checked={form.ads.isActive} 
                      onCheckedChange={(val) => setForm({...form, ads: {...form.ads, isActive: val}})} 
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رابط صورة الإعلان (1200x450)</Label>
                    <Input value={form.ads.headerBanner} onChange={e => setForm({...form, ads: {...form.ads, headerBanner: e.target.value}})} className="h-16 bg-background border-dashed border-primary/30 rounded-2xl font-mono text-xs" placeholder="https://..." />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">النص الترويجي الضخم</Label>
                    <Input value={form.ads.promoText} onChange={e => setForm({...form, ads: {...form.ads, promoText: e.target.value}})} className="h-16 bg-background border-none rounded-2xl font-black text-xl gold-text" placeholder="مثال: خصم 50% على شحن ببجي!" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">نص زر الإجراء (Call to Action)</Label>
                    <Input value={form.ads.buttonText} onChange={e => setForm({...form, ads: {...form.ads, buttonText: e.target.value}})} className="h-16 bg-background border-none rounded-2xl font-bold" />
                 </div>
                 <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/20 flex gap-4">
                    <Info className="text-blue-500 shrink-0" />
                    <p className="text-[10px] text-blue-300 font-medium leading-relaxed">
                       تنبيه: سيظهر هذا الإعلان في صدارة الصفحة الرئيسية فور تفعيله. تأكد من استخدام صور عالية الجودة لتحافظ على فخامة المنصة.
                    </p>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="site">
          <Card className="luxury-card p-10 space-y-10 border-none shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">اسم المنصة الرئيسي</Label>
                  <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-16 bg-muted/40 border-none rounded-2xl font-black text-xl" />
               </div>
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">العنوان الفرعي (Subtitle)</Label>
                  <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-16 bg-muted/40 border-none rounded-2xl font-bold" />
               </div>
               <div className="col-span-full space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">نص حقوق الملكية (Copyright)</Label>
                  <Input value={form.siteInfo.copyright} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, copyright: e.target.value}})} className="h-16 bg-muted/40 border-none rounded-2xl font-mono text-xs" />
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
                    <Input value={form.pageContent.heroTitle} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroTitle: e.target.value}})} className="h-20 bg-muted/40 border-none rounded-3xl font-black text-3xl gold-text" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">الوصف الجاذب للعملاء</Label>
                    <Textarea value={form.pageContent.heroDescription} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroDescription: e.target.value}})} className="bg-muted/40 border-none rounded-3xl min-h-[150px] p-8 text-xl font-medium leading-relaxed" />
                  </div>
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
                     className="h-14 bg-muted/40 border-none rounded-2xl font-bold shadow-inner" 
                   />
                </div>
              ))}
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}