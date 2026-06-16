"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Globe, Layout, MessageSquare, Zap, Megaphone, Palette, Share2, Info, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminContentManager() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: { primaryColor: "#d4af37", logoUrl: "", faviconUrl: "" },
    siteInfo: { title: "XMOOD STORE", subtitle: "", description: "", copyright: "" },
    pageContent: { heroTitle: "", heroDescription: "", footerAbout: "" },
    contact: { whatsapp: "", email: "", telegram: "", facebook: "", instagram: "", youtube: "", tiktok: "", workHours: "" },
    ads: { headerBanner: "", promoText: "", isActive: false, buttonText: "اطلب الآن" }
  });

  useEffect(() => {
    if (config) setForm(prev => ({ 
      ...prev, 
      ...config,
      appearance: { ...prev.appearance, ...config.appearance },
      contact: { ...prev.contact, ...config.contact }
    }));
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم تثبيت الهوية والمحتوى بنجاح" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-6">
       <Loader2 className="animate-spin text-primary" size={60} />
       <p className="text-[10px] font-black uppercase tracking-widest gold-text">Loading Content Command...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in pb-20" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-12">
        <div className="text-right">
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight">مركز الهوية والمحتوى</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Universal Brand & Social Management</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg w-full md:w-auto">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ التعديلات السيادية</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-muted/30 p-2 rounded-[2.5rem] h-auto border mb-12 flex flex-wrap gap-2 px-4 justify-center">
          <TabsTrigger value="visual" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5">
            <Palette size={16} className="ml-3 text-primary" /> الهوية البصرية
          </TabsTrigger>
          <TabsTrigger value="social" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5">
            <Share2 size={16} className="ml-3 text-primary" /> التواصل الاجتماعي
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5">
            <Megaphone size={16} className="ml-3 text-primary" /> الإعلانات
          </TabsTrigger>
          <TabsTrigger value="site" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5">
            <Globe size={16} className="ml-3 text-primary" /> نصوص المنصة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لوقو الموقع (URL)</Label>
                    <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} className="h-16 bg-muted/40 border-none rounded-2xl font-mono text-xs" placeholder="https://..." />
                    <p className="text-[8px] text-muted-foreground pr-4">المقاس الموصى به: 400x120 بكسل بخلفية شفافة.</p>
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لون الهوية الرئيسي</Label>
                    <div className="flex gap-4">
                       <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 w-24 bg-muted/40 border-none rounded-2xl cursor-pointer p-1" />
                       <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 flex-1 bg-muted/40 border-none rounded-2xl text-center font-mono font-black" />
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-primary/5 rounded-[2rem] border border-dashed border-primary/20 flex items-center gap-6">
                 <div className="w-20 h-20 bg-background rounded-2xl flex items-center justify-center border shadow-xl shrink-0 overflow-hidden">
                    {form.appearance.logoUrl ? <img src={form.appearance.logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" /> : <ImageIcon size={32} className="text-muted-foreground" />}
                 </div>
                 <div>
                    <h4 className="font-black text-lg">معاينة الشعار الحالية</h4>
                    <p className="text-xs text-muted-foreground font-medium">سيظهر هذا الشعار في النافبار وفي ذيل الصفحة فور الحفظ.</p>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="social">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[
                   { label: "واتساب الدعم", key: "whatsapp", placeholder: "+966...", icon: MessageSquare },
                   { label: "معرف تيليجرام", key: "telegram", placeholder: "username", icon: Zap },
                   { label: "رابط فيسبوك", key: "facebook", placeholder: "https://facebook.com/...", icon: Share2 },
                   { label: "رابط إنستغرام", key: "instagram", placeholder: "https://instagram.com/...", icon: Layout },
                   { label: "رابط يوتيوب", key: "youtube", placeholder: "https://youtube.com/...", icon: Megaphone },
                   { label: "البريد الرسمي", key: "email", placeholder: "info@domain.com", icon: Globe },
                 ].map((item) => (
                   <div key={item.key} className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3 flex items-center gap-2">
                        <item.icon size={12} className="text-primary" /> {item.label}
                      </Label>
                      <Input 
                        value={(form.contact as any)[item.key]} 
                        onChange={e => setForm({...form, contact: {...form.contact, [item.key]: e.target.value}})} 
                        className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-bold text-sm shadow-inner" 
                        placeholder={item.placeholder}
                      />
                   </div>
                 ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="ads">
           <Card className="luxury-card p-8 md:p-12 bg-primary/5 border-primary/20 space-y-10">
              <div className="flex items-center justify-between border-b pb-8">
                 <div className="flex items-center gap-4 text-primary">
                    <Megaphone size={40} className="animate-pulse" />
                    <div>
                       <h3 className="text-2xl font-black">إعلان الواجهة الرئيسي</h3>
                       <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Global Promotion Control</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-background px-8 py-4 rounded-2xl border shadow-sm">
                    <Label className="font-black text-[10px] uppercase">تفعيل العرض</Label>
                    <Switch 
                      checked={form.ads.isActive} 
                      onCheckedChange={(val) => setForm({...form, ads: {...form.ads, isActive: val}})} 
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">صورة الإعلان (1200x450)</Label>
                    <Input value={form.ads.headerBanner} onChange={e => setForm({...form, ads: {...form.ads, headerBanner: e.target.value}})} className="h-16 bg-background border-dashed border-primary/30 rounded-2xl font-mono text-xs" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">النص الترويجي</Label>
                    <Input value={form.ads.promoText} onChange={e => setForm({...form, ads: {...form.ads, promoText: e.target.value}})} className="h-16 bg-background border-none rounded-2xl font-black text-xl gold-text" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="site">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 gap-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">عنوان الصفحة الرئيسية الضخم</Label>
                    <Input value={form.pageContent.heroTitle} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroTitle: e.target.value}})} className="h-20 bg-muted/40 border-none rounded-3xl font-black text-3xl gold-text px-8" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">الوصف التعريفي الجاذب</Label>
                    <Textarea value={form.pageContent.heroDescription} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroDescription: e.target.value}})} className="bg-muted/40 border-none rounded-[2rem] min-h-[150px] p-8 text-xl font-medium leading-relaxed" />
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
