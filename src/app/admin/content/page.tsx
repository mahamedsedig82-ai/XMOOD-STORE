"use client";

import { useState, useEffect, useRef } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Palette, ImageIcon, Upload, DollarSign, Globe, Smartphone, ShoppingCart, MessageSquare, Zap, LayoutGrid, ShieldCheck, Send, Instagram, Youtube, Facebook, Bot, Type, Layout } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function AdminContentManager() {
  const db = useFirestore();
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: { primaryColor: "#d4af37", logoUrl: "" },
    siteInfo: { title: "XMOOD STORE", subtitle: "مركز الخدمات الرقمية المعتمدة", description: "", usdRate: 5400 },
    navLabels: { home: "الرئيسية", store: "المتجر", services: "سوق الخدمات", gallery: "معرض الإبداع", agents: "الوكلاء" },
    cartLabels: { cartTitle: "تجهيز الشحن الفوري", emptyCartMsg: "لم يتم تحديد أي باقات للشحن حالياً", checkoutTitle: "تأكيد الاستحواذ الآلي", successMsg: "تم التسليم بنجاح!", summaryTitle: "ملخص أمر الشحن" },
    gallerySettings: { title: "معرض الإبداع الرقمي", subtitle: "استلهم من أرقى التصاميم والهويات البصرية.", badge: "بورتفوليو نخبة المصممين", buttonText: "طلب تصميم مشابه" },
    agentSettings: { title: "الوكلاء المعتمدون", subtitle: "شبكة من الخبراء المعتمدين لتنفيذ عمليات الشحن والوساطة.", badge: "دليل الوكلاء والوسطاء" },
    bot: { name: "X-GUIDE", greeting: "مرحباً بك! أنا مرشدك الذكي في متجر XMOOD STORE. كيف يمكنني مساعدتك اليوم؟ ✨", avatarUrl: "", primaryColor: "#d4af37" },
    contact: { whatsapp: "", email: "", telegram: "", facebook: "", instagram: "", youtube: "" },
    footer: { isActive: true, aboutText: "المرجع الأول والأكثر موثوقية في تقديم الخدمات الرقمية والحلول الإبداعية.", copyright: "© 2025 XMOOD STORE. ALL RIGHTS RESERVED." }
  });

  useEffect(() => {
    if (config) {
      setForm(prev => ({ ...prev, ...config }));
    }
  }, [config]);

  const handleSave = async () => {
    if (!db || !settingsRef) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم حفظ التعديلات الشاملة بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center p-40 gap-4"><Loader2 className="animate-spin text-primary" size={60} /></div>;

  return (
    <div className="space-y-10 animate-fade-in pb-40 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text">إدارة المحتوى واللوقو</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[9px] opacity-60">Universal Content Controller</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> تثبيت التعديلات</>}
        </Button>
      </header>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="bg-card p-1.5 rounded-2xl h-auto border mb-10 flex flex-wrap gap-2 justify-center shadow-lg">
          <TabsTrigger value="site" className="flex-1 rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">اللوقو والهوية</TabsTrigger>
          <TabsTrigger value="nav" className="flex-1 rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">القوائم</TabsTrigger>
          <TabsTrigger value="sections" className="flex-1 rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">الأقسام</TabsTrigger>
          <TabsTrigger value="bot" className="flex-1 rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">المساعد الذكي</TabsTrigger>
          <TabsTrigger value="footer" className="flex-1 rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">التواصل والتذييل</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-8 animate-fade-in">
           <Card className="luxury-card p-8 md:p-12 border-none bg-card shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">رابط لوقو المتجر (يحل محل النص)</Label>
                       <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} placeholder="https://..." className="h-14 font-mono text-xs" />
                       {form.appearance.logoUrl && (
                         <div className="mt-4 p-4 bg-muted/40 rounded-2xl flex items-center justify-center border border-dashed border-primary/20">
                            <img src={form.appearance.logoUrl} className="h-16 w-auto object-contain" alt="Preview" />
                         </div>
                       )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2"><Label className="text-[10px] font-black text-primary/70 pr-3">اسم المتجر ( fallback )</Label><Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-14 font-black" /></div>
                       <div className="space-y-2"><Label className="text-[10px] font-black text-primary/70 pr-3">العنوان الفرعي (Subtitle)</Label><Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-14 font-bold" /></div>
                    </div>
                 </div>
                 <div className="p-8 bg-zinc-950/60 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center shadow-2xl space-y-8">
                    <div className="w-full space-y-3">
                       <Label className="text-[10px] font-black uppercase text-primary pr-3 flex items-center gap-2"><DollarSign size={14}/> سعر صرف الدولار (SDG)</Label>
                       <Input type="number" value={form.siteInfo.usdRate} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, usdRate: Number(e.target.value)}})} className="h-16 font-black text-3xl text-primary text-center bg-white/5 border-primary/20" />
                    </div>
                 </div>
              </div>
              <div className="space-y-3 mt-8"><Label className="text-[10px] font-black text-primary/70 pr-3">وصف المتجر العام (SEO)</Label><Textarea value={form.siteInfo.description} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, description: e.target.value}})} className="min-h-[120px]" /></div>
           </Card>
        </TabsContent>

        <TabsContent value="nav" className="animate-fade-in">
           <Card className="luxury-card p-10 space-y-10 border-none bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {Object.entries(form.navLabels).map(([key, value]) => (
                   <div key={key} className="space-y-2"><Label className="text-[10px] font-black text-primary/70 pr-3">تسمية قائمة: {key}</Label><Input value={value} onChange={e => setForm({...form, navLabels: {...form.navLabels, [key]: e.target.value}})} className="h-14 font-bold" /></div>
                 ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="sections" className="animate-fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="luxury-card p-8 md:p-12 space-y-8 bg-zinc-950/60 text-white border-none">
                 <h3 className="text-xl font-black flex items-center gap-3 gold-text uppercase"><Layout size={20} /> نصوص المعرض</h3>
                 <div className="space-y-6">
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">عنوان المعرض</Label><Input value={form.gallerySettings.title} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, title: e.target.value}})} className="bg-white/5 border-white/5" /></div>
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">وصف المعرض</Label><Textarea value={form.gallerySettings.subtitle} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, subtitle: e.target.value}})} className="min-h-[100px] bg-white/5 border-white/5" /></div>
                 </div>
              </Card>
              <Card className="luxury-card p-8 md:p-12 space-y-8 bg-primary/5 border-none">
                 <h3 className="text-xl font-black flex items-center gap-3 text-primary uppercase"><ShoppingCart size={20} /> نصوص نظام الشحن</h3>
                 <div className="space-y-6">
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-primary/60">عنوان صفحة السلة</Label><Input value={form.cartLabels.cartTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, cartTitle: e.target.value}})} className="bg-card border-none" /></div>
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-primary/60">رسالة السلة الفارغة</Label><Input value={form.cartLabels.emptyCartMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, emptyCartMsg: e.target.value}})} className="bg-card border-none" /></div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="bot" className="animate-fade-in">
           <Card className="luxury-card p-8 md:p-12 border-none bg-blue-500/5">
              <div className="space-y-8">
                 <h3 className="text-2xl font-black flex items-center gap-4 text-blue-600 uppercase"><Bot size={32} /> إعدادات المساعد الذكي</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60">اسم البوت</Label><Input value={form.bot.name} onChange={e => setForm({...form, bot: {...form.bot, name: e.target.value}})} /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60">الرسالة الترحيبية</Label><Textarea value={form.bot.greeting} onChange={e => setForm({...form, bot: {...form.bot, greeting: e.target.value}})} /></div>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="footer" className="animate-fade-in">
           <Card className="luxury-card p-10 space-y-12 border-none bg-zinc-950 text-white shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-2"><Label className="text-[10px] font-black text-primary/70 pr-3 flex items-center gap-2"><Smartphone size={14}/> واتساب</Label><Input value={form.contact.whatsapp} onChange={e => setForm({...form, contact: {...form.contact, whatsapp: e.target.value}})} className="bg-white/5 border-primary/20 h-14" /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black text-primary/70 pr-3 flex items-center gap-2"><Instagram size={14}/> انستجرام</Label><Input value={form.contact.instagram} onChange={e => setForm({...form, contact: {...form.contact, instagram: e.target.value}})} className="bg-white/5 border-primary/20 h-14" /></div>
              </div>
              <div className="pt-10 border-t border-white/10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><Label className="text-[10px] font-black opacity-60 pr-3">عن المتجر</Label><Textarea value={form.footer.aboutText} onChange={e => setForm({...form, footer: {...form.footer, aboutText: e.target.value}})} className="bg-white/5 border-white/10 p-6 min-h-[120px]" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-black opacity-60 pr-3">حقوق الملكية</Label><Input value={form.footer.copyright} onChange={e => setForm({...form, footer: {...form.footer, copyright: e.target.value}})} className="bg-white/5 border-white/10 h-14" /></div>
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
