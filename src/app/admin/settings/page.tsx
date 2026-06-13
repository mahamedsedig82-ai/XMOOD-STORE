
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
  Palette, Globe, Save, Loader2, Phone, Instagram, 
  Mail, Megaphone, Sparkles, Layout, MessageSquare, 
  ShieldCheck, Zap, Activity, Facebook, Youtube, Video, MapPin, Clock 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsFullControl() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: {
      primaryColor: "#d4af37",
      backgroundColor: "#09090b",
      accentColor: "#dc2626",
      logoUrl: ""
    },
    siteInfo: {
      title: "XMOOD STORE",
      subtitle: "الوجهة الأولى للألعاب والخدمات الرقمية",
      heroTitle: "عالمك الرقمي بلمسة احترافية",
      heroDescription: "نقدم لك أفضل باقات شحن الألعاب، الحسابات المميزة، والخدمات الاحترافية بأعلى معايير الأمان والسرعة.",
      description: "متجر XMOOD هو المنصة الرائدة في تقديم الحلول الرقمية المتكاملة.",
      copyright: "© 2025 XMOOD PREMIUM SERVICES. ALL RIGHTS RESERVED."
    },
    contact: {
      email: "XMOODSTORE.SUPPORT@GMAIL.COM",
      phone: "+249999484771",
      whatsapp: "+249999484771",
      telegram: "XMOOD_SUPPORT",
      instagram: "X3O_D",
      facebook: "",
      tiktok: "",
      youtube: "",
      address: "المنطقة السيادية، المكتب الرئيسي",
      workHours: "24/7 Sovereign Access"
    },
    promotions: {
      banner1Title: "خصم حصري على شحن UC",
      banner1Subtitle: "لفترة محدودة فقط لعملاء بريميوم",
      banner1Link: "/store",
      banner2Title: "هوية بصرية كاملة",
      banner2Subtitle: "اطلب تصميمك الآن بأرقى المعايير",
      banner2Link: "/designs/gallery"
    }
  });

  useEffect(() => {
    if (config) {
      setForm(prev => ({
        ...prev,
        ...config,
        appearance: { ...prev.appearance, ...config.appearance },
        siteInfo: { ...prev.siteInfo, ...config.siteInfo },
        contact: { ...prev.contact, ...config.contact },
        promotions: { ...prev.promotions, ...config.promotions }
      }));
    }
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, {
        ...form,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "تم تحديث النظام", description: "تم تطبيق كافة التغييرات على المتجر بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحفظ", description: "تأكد من اتصالك بالإنترنت وصلاحياتك." });
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
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10">
        <div className="text-right">
          <h1 className="text-5xl font-headline font-bold gold-text">سيادة المتجر: تحكم مطلق</h1>
          <p className="text-zinc-500 mt-3 font-bold uppercase tracking-widest text-[10px]">XMOOD Engine: 30+ Control Points Active</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ الإعدادات الكلية</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-zinc-950 p-2 rounded-3xl h-20 border border-white/5 mb-10 flex gap-2 px-4 overflow-x-auto custom-scrollbar">
          <TabsTrigger value="visual" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black min-w-[120px]">
            <Palette size={16} className="ml-2" /> المظهر
          </TabsTrigger>
          <TabsTrigger value="site" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white min-w-[120px]">
            <Globe size={16} className="ml-2" /> الموقع
          </TabsTrigger>
          <TabsTrigger value="social" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-white min-w-[120px]">
            <Share2 size={16} className="ml-2" /> التواصل الاجتماعي
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white min-w-[120px]">
            <Phone size={16} className="ml-2" /> معلومات التواصل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-8">
          <Card className="luxury-card p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">اللون الأساسي (Primary)</Label>
              <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 w-full bg-zinc-900 border-none rounded-xl" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">لون اللمسات (Accent)</Label>
              <Input type="color" value={form.appearance.accentColor} onChange={e => setForm({...form, appearance: {...form.appearance, accentColor: e.target.value}})} className="h-14 w-full bg-zinc-900 border-none rounded-xl" />
            </div>
            <div className="col-span-2 space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">رابط الشعار الرئيسي (Logo URL)</Label>
              <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} placeholder="URL..." className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-8">
          <Card className="luxury-card p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">عنوان الموقع (Title)</Label>
                <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">الوصف الفرعي (Subtitle)</Label>
                <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">حقوق النشر (Copyright Text)</Label>
              <Input value={form.siteInfo.copyright} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, copyright: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">وصف الموقع العام (SEO)</Label>
              <Textarea value={form.siteInfo.description} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, description: e.target.value}})} className="min-h-[100px] bg-zinc-900 border-none rounded-2xl p-6" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-8">
          <Card className="luxury-card p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
             {[
               { key: 'whatsapp', label: 'واتساب الدعم', icon: MessageSquare },
               { key: 'telegram', label: 'تيليجرام', icon: Send },
               { key: 'instagram', label: 'إنستقرام', icon: Instagram },
               { key: 'facebook', label: 'فيسبوك', icon: Facebook },
               { key: 'tiktok', label: 'تيك توك', icon: Video },
               { key: 'youtube', label: 'يوتيوب', icon: Youtube },
             ].map((social) => (
               <div key={social.key} className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4 flex items-center gap-2">
                    <social.icon size={12} className="text-primary" /> {social.label}
                  </Label>
                  <Input 
                    value={form.contact[social.key as keyof typeof form.contact]} 
                    onChange={e => setForm({...form, contact: {...form.contact, [social.key]: e.target.value}})} 
                    placeholder="الرابط أو المعرف..."
                    className="h-12 bg-zinc-900 border-none rounded-xl px-4"
                  />
               </div>
             ))}
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-8">
           <Card className="luxury-card p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Mail size={12}/> البريد الرسمي</Label>
                    <Input value={form.contact.email} onChange={e => setForm({...form, contact: {...form.contact, email: e.target.value}})} className="h-12 bg-zinc-900 border-none rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Phone size={12}/> رقم الهاتف</Label>
                    <Input value={form.contact.phone} onChange={e => setForm({...form, contact: {...form.contact, phone: e.target.value}})} className="h-12 bg-zinc-900 border-none rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><MapPin size={12}/> العنوان</Label>
                    <Input value={form.contact.address} onChange={e => setForm({...form, contact: {...form.contact, address: e.target.value}})} className="h-12 bg-zinc-900 border-none rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Clock size={12}/> ساعات العمل</Label>
                    <Input value={form.contact.workHours} onChange={e => setForm({...form, contact: {...form.contact, workHours: e.target.value}})} className="h-12 bg-zinc-900 border-none rounded-xl" />
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Share2 } from "lucide-react";
