
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Globe, Save, Loader2, Phone, Instagram, Mail, Megaphone, Sparkles, Layout, MessageSquare, ShieldCheck, Zap, Activity } from "lucide-react";
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
      fontFamily: "PT Sans",
      logoUrl: ""
    },
    siteInfo: {
      title: "XMOOD STORE",
      subtitle: "الوجهة الأولى للألعاب والخدمات الرقمية",
      heroTitle: "عالمك الرقمي بلمسة احترافية",
      heroDescription: "نقدم لك أفضل باقات شحن الألعاب، الحسابات المميزة، والخدمات الاحترافية بأعلى معايير الأمان والسرعة."
    },
    contact: {
      email: "XMOODSTORE.SUPPORT@GMAIL.COM",
      phone: "+249999484771",
      instagram: "X3O_D",
      whatsapp: "+249999484771",
      telegram: "XMOOD_SUPPORT"
    },
    promotions: {
      banner1Title: "خصم حصري على شحن UC",
      banner1Subtitle: "لفترة محدودة فقط لعملاء بريميوم",
      banner1Link: "/store",
      banner2Title: "هوية بصرية كاملة",
      banner2Subtitle: "اطلب تصميمك الآن بأرقى المعايير",
      banner2Link: "/designs/request",
      banner3Title: "وساطة مضمونة 100%",
      banner3Subtitle: "اضمن حقك مع نظام الوساطة المبتكر",
      banner3Link: "/middleman"
    },
    bot: {
      greeting: "مرحباً بك! أنا المحلل الذكي لمتجر XMOOD. كيف يمكنني مساعدتك في تحليل خياراتك اليوم؟ ✨",
      tip1: "بناءً على تحليل المبيعات، قسم شحن الألعاب هو الأكثر طلباً حالياً.",
      tip2: "أنصحك بشحن المحفظة مسبقاً لتفادي ضياع العروض المحدودة.",
      tip3: "نظام التحويل لدينا يخضع لبروتوكول أمان عالٍ لضمان سلامة رصيدك.",
      analysisStyle: "professional_analytical"
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
        promotions: { ...prev.promotions, ...config.promotions },
        bot: { ...prev.bot, ...config.bot }
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
          <p className="text-zinc-500 mt-3 font-bold uppercase tracking-widest text-[10px]">XMOOD Engine: 25 Global Control Points Active</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ الإعدادات الكلية</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-zinc-950 p-2 rounded-3xl h-20 border border-white/5 mb-10 flex gap-2 px-4 overflow-x-auto">
          <TabsTrigger value="visual" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
            <Palette size={16} className="ml-2" /> المظهر
          </TabsTrigger>
          <TabsTrigger value="site" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Globe size={16} className="ml-2" /> الموقع
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            <Phone size={16} className="ml-2" /> التواصل
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Megaphone size={16} className="ml-2" /> الإعلانات
          </TabsTrigger>
          <TabsTrigger value="bot" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Sparkles size={16} className="ml-2" /> المساعد
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
                <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">عنوان الموقع</Label>
                <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">الوصف الفرعي (Subtitle)</Label>
                <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">عنوان الهيرو الرئيسي</Label>
              <Input value={form.siteInfo.heroTitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroTitle: e.target.value}})} className="h-16 bg-zinc-900 border-none rounded-xl px-8 font-black text-2xl text-primary" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">وصف الهيرو التفصيلي</Label>
              <Textarea value={form.siteInfo.heroDescription} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, heroDescription: e.target.value}})} className="min-h-[120px] bg-zinc-900 border-none rounded-2xl p-6 font-bold leading-relaxed" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-8">
          <Card className="luxury-card p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4 flex items-center gap-2"><Mail size={12} /> بريد الدعم والشكاوي</Label>
              <Input value={form.contact.email} onChange={e => setForm({...form, contact: {...form.contact, email: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4 flex items-center gap-2"><Phone size={12} /> رقم التواصل والواتساب</Label>
              <Input value={form.contact.phone} onChange={e => setForm({...form, contact: {...form.contact, phone: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4 flex items-center gap-2"><Instagram size={12} /> إنستقرام الإدارة</Label>
              <Input value={form.contact.instagram} onChange={e => setForm({...form, contact: {...form.contact, instagram: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4 flex items-center gap-2"><Activity size={12} /> معرف التليجرام</Label>
              <Input value={form.contact.telegram} onChange={e => setForm({...form, contact: {...form.contact, telegram: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-8">
          <Card className="luxury-card p-10 space-y-10">
            <div className="p-8 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-6">
              <h4 className="text-primary font-black uppercase text-xs tracking-widest">إعلان الواجهة 1</h4>
              <Input value={form.promotions.banner1Title} onChange={e => setForm({...form, promotions: {...form.promotions, banner1Title: e.target.value}})} placeholder="العنوان" className="h-12 bg-black border-none px-6 font-bold" />
              <Input value={form.promotions.banner1Subtitle} onChange={e => setForm({...form, promotions: {...form.promotions, banner1Subtitle: e.target.value}})} placeholder="الوصف" className="h-12 bg-black border-none px-6" />
              <Input value={form.promotions.banner1Link} onChange={e => setForm({...form, promotions: {...form.promotions, banner1Link: e.target.value}})} placeholder="الرابط" className="h-12 bg-black border-none px-6" />
            </div>
            <div className="p-8 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-6">
              <h4 className="text-primary font-black uppercase text-xs tracking-widest">إعلان الواجهة 2</h4>
              <Input value={form.promotions.banner2Title} onChange={e => setForm({...form, promotions: {...form.promotions, banner2Title: e.target.value}})} placeholder="العنوان" className="h-12 bg-black border-none px-6 font-bold" />
              <Input value={form.promotions.banner2Subtitle} onChange={e => setForm({...form, promotions: {...form.promotions, banner2Subtitle: e.target.value}})} placeholder="الوصف" className="h-12 bg-black border-none px-6" />
              <Input value={form.promotions.banner2Link} onChange={e => setForm({...form, promotions: {...form.promotions, banner2Link: e.target.value}})} placeholder="الرابط" className="h-12 bg-black border-none px-6" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bot" className="space-y-8">
          <Card className="luxury-card p-10 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-500 pr-4">رسالة ترحيب المساعد (التحليلية)</Label>
              <Input value={form.bot.greeting} onChange={e => setForm({...form, bot: {...form.bot, greeting: e.target.value}})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold text-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase">نصيحة تحليلية 1</Label>
                <Input value={form.bot.tip1} onChange={e => setForm({...form, bot: {...form.bot, tip1: e.target.value}})} className="bg-zinc-900 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase">نصيحة تحليلية 2</Label>
                <Input value={form.bot.tip2} onChange={e => setForm({...form, bot: {...form.bot, tip2: e.target.value}})} className="bg-zinc-900 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase">نصيحة تحليلية 3</Label>
                <Input value={form.bot.tip3} onChange={e => setForm({...form, bot: {...form.bot, tip3: e.target.value}})} className="bg-zinc-900 border-none font-bold" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
