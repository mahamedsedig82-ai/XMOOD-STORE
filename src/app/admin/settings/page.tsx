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
  ShieldCheck, Zap, Activity, Facebook, Youtube, Video, MapPin, Clock,
  Share2, Send, Info, DollarSign
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
      subtitle: "الوجهة الأولى للخدمات الرقمية الموثوقة",
      heroTitle: "حلول رقمية متقدمة لراحتك",
      heroDescription: "نقدم لك أفضل باقات شحن الألعاب، الحسابات المميزة، والخدمات الاحترافية بأعلى معايير الأمان والسرعة.",
      description: "منصة متكاملة لتقديم الحلول والخدمات الرقمية المعتمدة.",
      copyright: "© 2025 XMOOD PROFESSIONAL SERVICES. ALL RIGHTS RESERVED.",
      usdRate: "5400"
    },
    contact: {
      email: "SUPPORT@XMOOD.COM",
      phone: "+966500000000",
      whatsapp: "+966500000000",
      telegram: "XMOOD_SUPPORT",
      instagram: "",
      facebook: "",
      tiktok: "",
      youtube: "",
      address: "مركز الخدمات الرقمية المعتمد",
      workHours: "24/7 Professional Access"
    }
  });

  useEffect(() => {
    if (config) {
      setForm(prev => ({
        ...prev,
        ...config,
        appearance: { ...prev.appearance, ...config.appearance },
        siteInfo: { ...prev.siteInfo, ...config.siteInfo },
        contact: { ...prev.contact, ...config.contact }
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
      toast({ title: "تم تحديث إعدادات المنصة", description: "تم تطبيق كافة التغييرات على الهوية والبصرية والمعلومات بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
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
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-10">
        <div className="text-right">
          <h1 className="text-5xl font-headline font-bold gold-text">إعدادات المنصة والهوية</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Site Identity & Global Communication Control</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ كافة التغييرات</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 rounded-3xl h-20 border mb-10 flex gap-2 px-4 overflow-x-auto custom-scrollbar">
          <TabsTrigger value="visual" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black min-w-[120px]">
            <Palette size={16} className="ml-2" /> المظهر البصري
          </TabsTrigger>
          <TabsTrigger value="site" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black min-w-[120px]">
            <Globe size={16} className="ml-2" /> معلومات الموقع
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black min-w-[120px]">
            <DollarSign size={16} className="ml-2" /> الإعدادات المالية
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black min-w-[120px]">
            <Phone size={16} className="ml-2" /> معلومات التواصل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-8">
          <Card className="luxury-card p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">اللون الأساسي للهوية</Label>
              <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 w-full bg-muted border-none rounded-xl" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رابط الشعار الرئيسي (SVG/PNG)</Label>
              <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} placeholder="URL..." className="h-14 bg-muted border-none rounded-xl px-6 font-bold" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-8">
          <Card className="luxury-card p-10 space-y-8 bg-green-500/5 border-green-500/10">
            <div className="flex items-center gap-4 text-green-600 mb-4">
              <DollarSign size={32} />
              <h3 className="text-2xl font-bold">تحديث سعر الصرف المركزي</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">سعر صرف الدولار (SDG مقابل 1 USD)</Label>
                <Input type="number" value={form.siteInfo.usdRate} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, usdRate: e.target.value}})} className="h-16 text-center text-3xl font-black bg-white border-green-500/20 rounded-2xl text-green-600" />
              </div>
              <div className="p-6 bg-white/50 rounded-2xl border flex items-center">
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   تنبيه: تحديث هذا السعر سيغير كافة عرض الأسعار في الموقع (بالعملة المحلية) بشكل فوري. تأكد من دقة البيانات المدخلة قبل الحفظ.
                 </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-8">
          <Card className="luxury-card p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">اسم المنصة (Title)</Label>
                <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-14 bg-muted border-none rounded-xl px-6 font-bold" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">الوصف الفرعي (Subtitle)</Label>
                <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-14 bg-muted border-none rounded-xl px-6 font-bold" />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">حقوق النشر والملكية (Copyright)</Label>
              <Input value={form.siteInfo.copyright} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, copyright: e.target.value}})} className="h-14 bg-muted border-none rounded-xl px-6 font-bold" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">وصف المنصة العام (SEO Description)</Label>
              <Textarea value={form.siteInfo.description} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, description: e.target.value}})} className="min-h-[100px] bg-muted border-none rounded-2xl p-6 font-medium" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-8">
           <Card className="luxury-card p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2"><Mail size={12}/> البريد الرسمي للدعم</Label>
                    <Input value={form.contact.email} onChange={e => setForm({...form, contact: {...form.contact, email: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2"><Phone size={12}/> رقم الهاتف الدولي</Label>
                    <Input value={form.contact.phone} onChange={e => setForm({...form, contact: {...form.contact, phone: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2"><MessageSquare size={12}/> واتساب الدعم المباشر</Label>
                    <Input value={form.contact.whatsapp} onChange={e => setForm({...form, contact: {...form.contact, whatsapp: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2"><Send size={12}/> رابط تيليجرام</Label>
                    <Input value={form.contact.telegram} onChange={e => setForm({...form, contact: {...form.contact, telegram: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2"><Instagram size={12}/> رابط إنستغرام</Label>
                    <Input value={form.contact.instagram} onChange={e => setForm({...form, contact: {...form.contact, instagram: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2"><Facebook size={12}/> رابط فيسبوك</Label>
                    <Input value={form.contact.facebook} onChange={e => setForm({...form, contact: {...form.contact, facebook: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
              </div>
              <div className="pt-6 border-t">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2"><Clock size={12}/> ساعات العمل والدعم</Label>
                    <Input value={form.contact.workHours} onChange={e => setForm({...form, contact: {...form.contact, workHours: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
