"use client";

import { useState, useEffect, useRef } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, Loader2, Palette, ImageIcon, 
  Upload, DollarSign, Globe, Smartphone, 
  ShoppingCart, MessageSquare, Zap, LayoutGrid, ShieldCheck, Send, Instagram, Youtube, Facebook, Bot, Type, Layout
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function AdminContentManager() {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: { primaryColor: "#d4af37", logoUrl: "" },
    siteInfo: { title: "XMOOD STORE", subtitle: "SOVEREIGN ASSETS DISPATCH", description: "", usdRate: 5400 },
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
      setForm(prev => ({ 
        ...prev, 
        ...config,
        appearance: { ...prev.appearance, ...(config.appearance || {}) },
        siteInfo: { ...prev.siteInfo, ...(config.siteInfo || {}) },
        navLabels: { ...prev.navLabels, ...(config.navLabels || {}) },
        cartLabels: { ...prev.cartLabels, ...(config.cartLabels || {}) },
        gallerySettings: { ...prev.gallerySettings, ...(config.gallerySettings || {}) },
        agentSettings: { ...prev.agentSettings, ...(config.agentSettings || {}) },
        bot: { ...prev.bot, ...(config.bot || {}) },
        contact: { ...prev.contact, ...(config.contact || {}) },
        footer: { ...prev.footer, ...(config.footer || {}) }
      }));
    }
  }, [config]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png", 0.8));
        };
      };
      reader.onerror = reject;
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      try {
        const b64 = await compressImage(file);
        setForm(prev => ({ ...prev, appearance: { ...prev.appearance, logoUrl: b64 } }));
        toast({ title: "تم تجهيز اللوقو بنجاح" });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل معالجة الصورة" });
      } finally {
        setIsSaving(false);
      }
    }
  };

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-4">
       <Loader2 className="animate-spin text-primary" size={60} />
       <p className="text-[10px] font-black uppercase tracking-widest gold-text">Loading Content Suite...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-40 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight uppercase tracking-widest">إدارة المحتوى السيادي</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[9px] opacity-60">Universal Content & Strings Controller</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg shadow-xl shadow-primary/10">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> تثبيت كافة التعديلات</>}
        </Button>
      </header>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="bg-card p-1.5 rounded-2xl h-auto border mb-10 flex flex-wrap gap-2 justify-center shadow-lg">
          <TabsTrigger value="site" className="flex-1 min-w-[130px] rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">البيانات والهوية</TabsTrigger>
          <TabsTrigger value="nav" className="flex-1 min-w-[130px] rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">القوائم</TabsTrigger>
          <TabsTrigger value="sections" className="flex-1 min-w-[130px] rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">الأقسام</TabsTrigger>
          <TabsTrigger value="bot" className="flex-1 min-w-[130px] rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">المساعد الذكي</TabsTrigger>
          <TabsTrigger value="footer" className="flex-1 min-w-[130px] rounded-xl font-black text-[9px] uppercase py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">التواصل والتذييل</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-8 animate-fade-in">
           <Card className="luxury-card p-8 md:p-12 border-none bg-card shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">لوقو الموقع الرسمي</Label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="h-56 bg-muted/30 border-2 border-dashed border-primary/20 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden relative shadow-inner"
                       >
                          {form.appearance.logoUrl ? (
                            <img src={form.appearance.logoUrl} className="h-full w-full object-contain p-6 rounded-2xl" alt="Logo" />
                          ) : (
                            <div className="text-center space-y-4 opacity-40">
                               <Upload className="mx-auto" size={40} />
                               <p className="text-[10px] font-black uppercase tracking-widest">رفع من الاستوديو</p>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary/70 pr-3">عنوان الموقع الرئيسي</Label>
                          <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-14 font-black uppercase bg-muted/40 border-none" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-primary/70 pr-3">العنوان الفرعي</Label>
                          <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-14 font-bold bg-muted/40 border-none" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-8">
                    <div className="p-8 bg-zinc-950/60 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center shadow-2xl space-y-8">
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">BRAND PREVIEW</p>
                       <div className="p-8 bg-card rounded-3xl border border-primary/10 w-full flex items-center justify-center">
                          <span className="handwritten-logo text-3xl">XMOOD <span>STORE</span></span>
                       </div>
                       <div className="w-full space-y-3">
                          <Label className="text-[10px] font-black uppercase text-primary pr-3 flex items-center gap-2"><DollarSign size={14}/> سعر صرف الدولار (SDG)</Label>
                          <Input type="number" value={form.siteInfo.usdRate} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, usdRate: Number(e.target.value)}})} className="h-16 font-black text-3xl text-primary text-center bg-white/5 border-primary/20" />
                       </div>
                    </div>
                 </div>
              </div>
              <div className="space-y-3 mt-8">
                 <Label className="text-[10px] font-black uppercase text-primary/70 pr-3">وصف المتجر العام</Label>
                 <Textarea value={form.siteInfo.description} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, description: e.target.value}})} className="min-h-[120px] bg-muted/40 border-none p-6" />
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="nav" className="animate-fade-in">
           <Card className="luxury-card p-10 space-y-10 border-none bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {Object.entries(form.navLabels).map(([key, value]) => (
                   <div key={key} className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary/70 pr-3">تسمية قائمة: {key}</Label>
                      <Input value={value} onChange={e => setForm({...form, navLabels: {...form.navLabels, [key]: e.target.value}})} className="h-14 font-bold bg-card border-none" />
                   </div>
                 ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="sections" className="animate-fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="luxury-card p-8 md:p-12 space-y-8 bg-zinc-950/60 text-white border-none">
                 <h3 className="text-xl font-black flex items-center gap-3 gold-text uppercase"><Layout size={20} /> نصوص المعرض</h3>
                 <div className="space-y-6">
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60 pr-2">عنوان المعرض</Label><Input value={form.gallerySettings.title} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, title: e.target.value}})} className="bg-white/5 border-white/5 h-14" /></div>
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60 pr-2">وصف المعرض</Label><Textarea value={form.gallerySettings.subtitle} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, subtitle: e.target.value}})} className="min-h-[100px] bg-white/5 border-white/5" /></div>
                 </div>
              </Card>
              <Card className="luxury-card p-8 md:p-12 space-y-8 bg-primary/5 border-none">
                 <h3 className="text-xl font-black flex items-center gap-3 text-primary uppercase"><ShoppingCart size={20} /> نصوص نظام الشحن</h3>
                 <div className="space-y-6">
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-primary/60 pr-2">عنوان صفحة السلة</Label><Input value={form.cartLabels.cartTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, cartTitle: e.target.value}})} className="bg-card border-none h-14" /></div>
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-primary/60 pr-2">رسالة السلة الفارغة</Label><Input value={form.cartLabels.emptyCartMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, emptyCartMsg: e.target.value}})} className="bg-card border-none h-14" /></div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="bot" className="animate-fade-in">
           <Card className="luxury-card p-8 md:p-12 border-none bg-blue-500/5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div className="space-y-8">
                    <h3 className="text-2xl font-black flex items-center gap-4 text-blue-600 uppercase"><Bot size={32} /> إعدادات المساعد الإرشادي</h3>
                    <div className="space-y-6">
                       <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60">اسم البوت الذكي</Label><Input value={form.bot.name} onChange={e => setForm({...form, bot: {...form.bot, name: e.target.value}})} className="h-14 bg-card border-none" /></div>
                       <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60">رسالة الترحيب الأولى</Label><Textarea value={form.bot.greeting} onChange={e => setForm({...form, bot: {...form.bot, greeting: e.target.value}})} className="min-h-[120px] bg-card border-none" /></div>
                    </div>
                 </div>
                 <div className="p-10 bg-card rounded-[2.5rem] border border-blue-500/10 shadow-2xl flex flex-col items-center text-center gap-6">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-600/20">
                       <Bot size={40} />
                    </div>
                    <div>
                       <p className="text-xl font-black text-blue-600 uppercase tracking-widest">{form.bot.name}</p>
                       <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">{form.bot.greeting}</p>
                    </div>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="footer" className="animate-fade-in">
           <Card className="luxury-card p-10 space-y-12 border-none bg-zinc-950 text-white shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary/70 pr-3 flex items-center gap-2"><Smartphone size={14}/> واتساب</Label><Input value={form.contact.whatsapp} onChange={e => setForm({...form, contact: {...form.contact, whatsapp: e.target.value}})} className="bg-white/5 border-primary/20 text-center font-black h-14" /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary/70 pr-3 flex items-center gap-2"><Send size={14}/> تيليجرام</Label><Input value={form.contact.telegram} onChange={e => setForm({...form, contact: {...form.contact, telegram: e.target.value}})} className="bg-white/5 border-primary/20 text-center font-bold h-14" /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary/70 pr-3 flex items-center gap-2"><Instagram size={14}/> انستجرام</Label><Input value={form.contact.instagram} onChange={e => setForm({...form, contact: {...form.contact, instagram: e.target.value}})} className="bg-white/5 border-primary/20 text-center font-bold h-14" /></div>
              </div>
              <div className="pt-10 border-t border-white/10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60 pr-3">نص "عن المتجر" في التذييل</Label><Textarea value={form.footer.aboutText} onChange={e => setForm({...form, footer: {...form.footer, aboutText: e.target.value}})} className="bg-white/5 border-white/10 rounded-2xl p-6 min-h-[120px]" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60 pr-3">حقوق الملكية (Copyright)</Label><Input value={form.footer.copyright} onChange={e => setForm({...form, footer: {...form.footer, copyright: e.target.value}})} className="bg-white/5 border-white/10 h-14" /></div>
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}