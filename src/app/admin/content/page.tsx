"use client";

import { useState, useEffect, useRef } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, Loader2, Palette, ImageIcon, 
  Upload, DollarSign, Globe, Smartphone, 
  ShoppingCart, MessageSquare, Zap, LayoutGrid, ShieldCheck, Send, Instagram, Youtube, Facebook
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
    siteInfo: { title: "XMOOD STORE", subtitle: "مركز الخدمات الرقمية المعتمدة", description: "", usdRate: 5400 },
    navLabels: { home: "الرئيسية", store: "المتجر", services: "سوق الخدمات", gallery: "معرض الإبداع", agents: "الوكلاء" },
    cartLabels: { cartTitle: "سلة المقتنيات", emptyCartMsg: "السلة السيادية فارغة حالياً", checkoutTitle: "تأكيد الاستحواذ الآلي", successMsg: "تم التسليم بنجاح!", summaryTitle: "ملخص الحساب المركزي" },
    gallerySettings: { title: "معرض الإبداع الرقمي", subtitle: "استلهم من أرقى التصاميم والهويات البصرية.", badge: "بورتفوليو نخبة المصممين", buttonText: "طلب تصميم مشابه" },
    agentSettings: { title: "الوكلاء المعتمدون", subtitle: "شبكة من الخبراء المعتمدين لتنفيذ عمليات الشحن.", badge: "دليل الوكلاء والوسطاء" },
    contact: { whatsapp: "", email: "", telegram: "", facebook: "", instagram: "", youtube: "" },
    footer: { isActive: true, aboutText: "المرجع الأول والأكثر موثوقية.", copyright: "© 2025 XMOOD. ALL RIGHTS RESERVED." }
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
        toast({ title: "تم تجهيز اللوقو بنعومة، يرجى حفظ التغييرات" });
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
      toast({ title: "تم تثبيت التغييرات السيادية بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-6">
       <Loader2 className="animate-spin text-primary" size={60} />
       <p className="text-[10px] font-black uppercase tracking-widest gold-text">Initializing Identity Suite...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in pb-40 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight">مركز التحكم بالهوية</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">Universal Identity & Content Controller</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-12 text-lg shadow-primary/20">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ التغييرات</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-card p-1.5 rounded-2xl h-auto border mb-10 flex flex-wrap gap-2 justify-center shadow-xl">
          <TabsTrigger value="visual" className="flex-1 min-w-[140px] rounded-xl font-black text-[9px] uppercase tracking-widest py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">الهوية واللوقو</TabsTrigger>
          <TabsTrigger value="site" className="flex-1 min-w-[140px] rounded-xl font-black text-[9px] uppercase tracking-widest py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">بيانات الموقع</TabsTrigger>
          <TabsTrigger value="sections" className="flex-1 min-w-[140px] rounded-xl font-black text-[9px] uppercase tracking-widest py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">نصوص الأقسام</TabsTrigger>
          <TabsTrigger value="footer" className="flex-1 min-w-[140px] rounded-xl font-black text-[9px] uppercase tracking-widest py-4 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">التواصل والتذييل</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
           <Card className="luxury-card p-8 md:p-12 space-y-12 border-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-primary pr-4 tracking-widest">لوقو الموقع الرسمي</Label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="h-64 bg-muted/40 border-2 border-dashed border-primary/20 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden relative group shadow-inner"
                       >
                          {form.appearance.logoUrl ? (
                            <img src={form.appearance.logoUrl} className="h-full w-full object-contain p-8" style={{ borderRadius: '2rem' }} alt="Logo Preview" />
                          ) : (
                            <div className="text-center space-y-4">
                               <Upload className="text-primary mx-auto" size={48} />
                               <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">رفع صورة من الاستوديو</p>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-primary pr-4 tracking-widest">لون الهوية الأساسي</Label>
                       <div className="flex gap-4">
                          <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 w-24 bg-muted/40 border-none rounded-2xl cursor-pointer p-1" />
                          <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 flex-1 bg-muted/40 border-none rounded-2xl text-center font-mono font-black text-xl" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-10 bg-zinc-950/60 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center shadow-2xl space-y-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">معاينة العلامة التجارية</p>
                    <div className="p-10 bg-card rounded-[2rem] border border-primary/10 w-full flex items-center justify-center">
                       {form.appearance.logoUrl ? (
                         <img src={form.appearance.logoUrl} className="h-16 w-auto object-contain" style={{ borderRadius: '1rem' }} alt="" />
                       ) : (
                         <span className="handwritten-logo text-4xl">XMOOD <span>Store</span></span>
                       )}
                    </div>
                    <Button style={{ backgroundColor: form.appearance.primaryColor }} className="w-full h-14 rounded-xl text-black font-black text-[9px] uppercase tracking-widest shadow-2xl">Action Button Preview</Button>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="site">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-primary pr-4">عنوان الموقع</Label>
                    <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-14 font-black" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-primary pr-4">العنوان الفرعي</Label>
                    <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-14 font-bold" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-primary pr-4 flex items-center gap-2"><DollarSign size={14}/> سعر صرف الدولار (SDG)</Label>
                    <Input type="number" value={form.siteInfo.usdRate} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, usdRate: Number(e.target.value)}})} className="h-14 font-black text-2xl text-primary text-center" />
                 </div>
                 <div className="col-span-full space-y-2">
                    <Label className="text-[10px] font-black uppercase text-primary pr-4">وصف الموقع (SEO)</Label>
                    <Textarea value={form.siteInfo.description} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, description: e.target.value}})} className="min-h-[120px] rounded-3xl" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="sections">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="luxury-card p-8 space-y-8 bg-primary/5">
                 <h3 className="text-2xl font-black flex items-center gap-3 text-primary"><LayoutGrid size={24} /> نصوص المعرض</h3>
                 <div className="space-y-4">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60 pr-3">العنوان</Label><Input value={form.gallerySettings.title} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, title: e.target.value}})} /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60 pr-3">الوصف</Label><Textarea value={form.gallerySettings.subtitle} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, subtitle: e.target.value}})} className="min-h-[100px]" /></div>
                 </div>
              </Card>
              <Card className="luxury-card p-8 space-y-8 bg-zinc-950/60 text-white">
                 <h3 className="text-2xl font-black flex items-center gap-3 gold-text"><ShoppingCart size={24} /> نصوص السلة</h3>
                 <div className="space-y-4">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-primary pr-3">عنوان السلة</Label><Input value={form.cartLabels.cartTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, cartTitle: e.target.value}})} className="bg-white/5 border-primary/20" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-primary pr-3">رسالة النجاح</Label><Input value={form.cartLabels.successMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, successMsg: e.target.value}})} className="bg-white/5 border-primary/20" /></div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="footer">
           <Card className="luxury-card p-10 space-y-12 border-none bg-zinc-950 text-white shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary pr-4 flex items-center gap-2"><Smartphone size={14}/> واتساب</Label><Input value={form.contact.whatsapp} onChange={e => setForm({...form, contact: {...form.contact, whatsapp: e.target.value}})} className="bg-white/5 border-primary/20 text-center font-black" /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary pr-4 flex items-center gap-2"><Send size={14}/> تيليجرام</Label><Input value={form.contact.telegram} onChange={e => setForm({...form, contact: {...form.contact, telegram: e.target.value}})} className="bg-white/5 border-primary/20 text-center font-bold" /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary pr-4 flex items-center gap-2"><Instagram size={14}/> انستجرام</Label><Input value={form.contact.instagram} onChange={e => setForm({...form, contact: {...form.contact, instagram: e.target.value}})} className="bg-white/5 border-primary/20 text-center font-bold" /></div>
              </div>
              <div className="pt-10 border-t border-white/10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60 pr-4">نص "عن المتجر"</Label><Textarea value={form.footer.aboutText} onChange={e => setForm({...form, footer: {...form.footer, aboutText: e.target.value}})} className="bg-white/5 border-white/10 rounded-2xl p-6" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60 pr-4">حقوق الملكية</Label><Input value={form.footer.copyright} onChange={e => setForm({...form, footer: {...form.footer, copyright: e.target.value}})} className="bg-white/5 border-white/10" /></div>
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}