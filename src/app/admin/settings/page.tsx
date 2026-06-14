
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
  Palette, Globe, Save, Loader2, Phone, 
  Mail, Megaphone, Sparkles, Layout, MessageSquare, 
  ShieldCheck, Zap, Facebook, Youtube, Clock,
  Send, Info, DollarSign, Image as ImageIcon, Store, Monitor, Cpu, ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsUniversalControl() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: {
      primaryColor: "#d4af37",
      backgroundColor: "#ffffff",
      logoUrl: "",
      faviconUrl: "",
      previewImageUrl: ""
    },
    siteInfo: {
      title: "XMOOD STORE",
      subtitle: "مركز الخدمات الرقمية المعتمدة",
      description: "منصة متخصصة في الخدمات الرقمية والألعاب...",
      copyright: "© 2025 XMOOD STORE. ALL RIGHTS RESERVED.",
      usdRate: "5400"
    },
    pageContent: {
      heroTitle: "خدمات رقمية احترافية وموثوقة",
      heroDescription: "نقدم لك أفضل باقات شحن الألعاب والخدمات التقنية بأعلى معايير الأمان والسرعة.",
      footerAbout: "المنصة الرائدة لتقديم الحلول والخدمات الرقمية المتكاملة."
    },
    contact: {
      email: "support@xmood.com",
      phone: "+966500000000",
      whatsapp: "+966500000000",
      telegram: "xmood_support",
      instagram: "",
      facebook: "",
      tiktok: "",
      youtube: "",
      workHours: "24/7 Professional Support"
    },
    bot: {
      name: "X-ANALYST",
      avatarUrl: "",
      greeting: "مرحباً بك! أنا المحلل الذكي لمتجر XMOOD. كيف يمكنني مساعدتك اليوم؟",
      personality: "professional",
      primaryColor: "#d4af37",
      tip1: "بناءً على تحليل المبيعات، قسم شحن الألعاب هو الأكثر طلباً حالياً. 🎮",
      tip2: "أنصحك بشحن المحفظة مسبقاً لتفادي ضياع العروض المحدودة. 💸",
      tip3: "نظام التحويل لدينا يخضع لبروتوكول أمان عالٍ لضمان سلامة رصيدك. 🚀"
    }
  });

  useEffect(() => {
    if (config) {
      setForm(prev => ({
        ...prev,
        ...config,
        appearance: { ...prev.appearance, ...config.appearance },
        siteInfo: { ...prev.siteInfo, ...config.siteInfo },
        pageContent: { ...prev.pageContent, ...config.pageContent },
        contact: { ...prev.contact, ...config.contact },
        bot: { ...prev.bot, ...config.bot }
      }));
    }
  }, [config]);

  const handleSave = () => {
    if (!db) return;
    setIsSaving(true);
    setDoc(settingsRef, {
      ...form,
      updatedAt: serverTimestamp(),
    }, { merge: true }).then(() => {
      toast({ title: "تم تحديث الإعدادات بنجاح", description: "تم تطبيق التغييرات على الهوية البصرية والمحتوى." });
    }).finally(() => setIsSaving(false));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest opacity-50">جاري تحميل مركز التحكم المركزي...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-10">
        <div className="text-right">
          <h1 className="text-5xl font-headline font-bold gold-text">مركز التحكم بالهوية</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Site Identity & Brand Master Console</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ كافة التغييرات</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 rounded-3xl h-auto border mb-10 flex flex-wrap gap-2 px-4">
          <TabsTrigger value="visual" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest py-4">
            <Palette size={16} className="ml-2" /> الهوية البصرية
          </TabsTrigger>
          <TabsTrigger value="site" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest py-4">
            <Globe size={16} className="ml-2" /> محتوى الصفحات
          </TabsTrigger>
          <TabsTrigger value="bot" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest py-4">
            <Cpu size={16} className="ml-2" /> المساعد الذكي
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest py-4">
            <DollarSign size={16} className="ml-2" /> الإعدادات المالية
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest py-4">
            <Phone size={16} className="ml-2" /> التواصل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
          <Card className="luxury-card p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رابط الشعار الرئيسي (SVG/PNG)</Label>
                <div className="flex gap-4">
                  <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} placeholder="https://..." className="h-14 bg-muted border-none rounded-xl flex-1" />
                  {form.appearance.logoUrl && <Button variant="outline" className="h-14 w-14 rounded-xl" asChild><a href={form.appearance.logoUrl} target="_blank"><ExternalLink size={20}/></a></Button>}
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رابط الأيقونة (Favicon)</Label>
                <Input value={form.appearance.faviconUrl} onChange={e => setForm({...form, appearance: {...form.appearance, faviconUrl: e.target.value}})} placeholder="https://..." className="h-14 bg-muted border-none rounded-xl" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">صورة المعاينة الخارجية (OpenGraph)</Label>
                <Input value={form.appearance.previewImageUrl} onChange={e => setForm({...form, appearance: {...form.appearance, previewImageUrl: e.target.value}})} placeholder="https://..." className="h-14 bg-muted border-none rounded-xl" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لون الهوية الرئيسي</Label>
                <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 w-full bg-muted border-none rounded-xl cursor-pointer" />
              </div>
            </div>
            
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
               <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><ImageIcon size={18} /> معاينة الشعار الحالي</h4>
               {form.appearance.logoUrl ? (
                 <img src={form.appearance.logoUrl} className="max-h-20 object-contain mx-auto" alt="Logo Preview" />
               ) : (
                 <div className="h-20 flex items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground italic text-xs">لا يوجد شعار محدد</div>
               )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bot">
           <Card className="luxury-card p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">اسم المساعد الذكي</Label>
                    <Input value={form.bot.name} onChange={e => setForm({...form, bot: {...form.bot, name: e.target.value}})} className="h-14 bg-muted border-none rounded-xl font-bold" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رابط صورة المساعد</Label>
                    <Input value={form.bot.avatarUrl} onChange={e => setForm({...form, bot: {...form.bot, avatarUrl: e.target.value}})} placeholder="https://..." className="h-14 bg-muted border-none rounded-xl" />
                 </div>
                 <div className="space-y-4 col-span-full">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">الرسالة الترحيبية</Label>
                    <Textarea value={form.bot.greeting} onChange={e => setForm({...form, bot: {...form.bot, greeting: e.target.value}})} className="bg-muted border-none rounded-xl min-h-[100px]" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">نصيحة إرشادية 1</Label>
                    <Input value={form.bot.tip1} onChange={e => setForm({...form, bot: {...form.bot, tip1: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">نصيحة إرشادية 2</Label>
                    <Input value={form.bot.tip2} onChange={e => setForm({...form, bot: {...form.bot, tip2: e.target.value}})} className="h-12 bg-muted border-none rounded-xl" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="site">
          <Card className="luxury-card p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">عنوان الصفحة الرئيسية</Label>
                  <Input value={form.pageContent.heroTitle} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroTitle: e.target.value}})} className="h-14 bg-muted border-none rounded-xl font-bold" />
               </div>
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">الوصف التعريفي للخدمات</Label>
                  <Textarea value={form.pageContent.heroDescription} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroDescription: e.target.value}})} className="bg-muted border-none rounded-xl min-h-[100px]" />
               </div>
               <div className="space-y-4 col-span-full">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">عن المتجر (التذييل)</Label>
                  <Textarea value={form.pageContent.footerAbout} onChange={e => setForm({...form, pageContent: {...form.pageContent, footerAbout: e.target.value}})} className="bg-muted border-none rounded-xl min-h-[100px]" />
               </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card className="luxury-card p-10 bg-green-500/5 border-green-500/10 space-y-8">
            <div className="flex items-center gap-4 text-green-600">
              <DollarSign size={32} />
              <h3 className="text-2xl font-bold">المرجع المالي الموحد</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">سعر صرف الدولار المعتمد (SDG مقابل 1 USD)</Label>
                <Input type="number" value={form.siteInfo.usdRate} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, usdRate: e.target.value}})} className="h-16 text-center text-3xl font-black bg-white border-green-500/20 rounded-2xl text-green-600" />
              </div>
              <div className="p-8 bg-white/40 rounded-3xl border flex items-center">
                 <p className="text-xs text-muted-foreground leading-relaxed italic">
                   تنبيه سيادي: تحديث هذا الرقم سيغير فوراً عرض كافة الأسعار المحلية في المتجر والمحفظة. يرجى التأكد من الدقة.
                 </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
           <Card className="luxury-card p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { label: "واتساب الدعم المباشر", key: "whatsapp", icon: MessageSquare },
                   { label: "قناة التيليجرام الرسمية", key: "telegram", icon: Send },
                   { label: "رابط صفحة فيسبوك", key: "facebook", icon: Facebook },
                   { label: "البريد الإلكتروني الرسمي", key: "email", icon: Mail },
                   { label: "ساعات العمل الرسمية", key: "workHours", icon: Clock },
                 ].map((item) => (
                   <div key={item.key} className="space-y-3">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2">
                        <item.icon size={12}/> {item.label}
                      </Label>
                      <Input 
                        value={(form.contact as any)[item.key]} 
                        onChange={e => setForm({...form, contact: {...form.contact, [item.key]: e.target.value}})} 
                        className="h-12 bg-muted border-none rounded-xl" 
                      />
                   </div>
                 ))}
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
