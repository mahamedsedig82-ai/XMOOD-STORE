"use client";

import { useState, useEffect, useRef } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, Loader2, Palette, ImageIcon, Wallet, 
  ShoppingCart, FileText, Bot, AlignRight, LayoutGrid, 
  Link as LinkIcon, Upload, Eye, Star, Users, Briefcase, DollarSign
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
    appearance: { primaryColor: "#d4af37", logoUrl: "", faviconUrl: "", logoRounded: true },
    siteInfo: { title: "XMOOD STORE", subtitle: "مركز الخدمات الرقمية المعتمدة", description: "", copyright: "", usdRate: 5400 },
    navLabels: { home: "الرئيسية", store: "المتجر", services: "سوق الخدمات", gallery: "معرض الإبداع", agents: "الوكلاء" },
    cartLabels: { cartTitle: "سلة المقتنيات", emptyCartMsg: "السلة السيادية فارغة حالياً", checkoutTitle: "تأكيد الاستحواذ الآلي", successMsg: "تم التسليم بنجاح!" },
    gallerySettings: { title: "معرض الإبداع الرقمي", subtitle: "استلهم من أرقى التصاميم والهويات البصرية.", buttonText: "طلب تصميم احترافي" },
    agentSettings: { title: "الوكلاء المعتمدون", subtitle: "شبكة من الخبراء المعتمدين لتنفيذ عمليات الشحن.", badge: "دليل الوكلاء والوسطاء" },
    contact: { whatsapp: "", email: "", telegram: "", facebook: "", instagram: "", youtube: "" },
    footer: { isActive: true, aboutText: "المرجع الأول والأكثر موثوقية.", address: "المنطقة السيادية", copyright: "© 2025 XMOOD. ALL RIGHTS RESERVED." }
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
          const MAX_WIDTH = 500;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
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
        toast({ title: "تم تجهيز اللوقو للرفع" });
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
      toast({ title: "تم تثبيت المحتوى الملكي بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-6">
       <Loader2 className="animate-spin text-primary" size={60} />
       <p className="text-[10px] font-black uppercase tracking-widest gold-text">Loading Content Master...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in pb-32 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text">مركز التحكم بالهوية والمحتوى</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Universal Identity & Content Controller</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg w-full md:w-auto">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ التغييرات الشاملة</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-muted/30 p-2 rounded-[2.5rem] h-auto border mb-12 flex flex-wrap gap-2 px-4 justify-center">
          <TabsTrigger value="visual" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">الهوية واللوقو</TabsTrigger>
          <TabsTrigger value="site" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">بيانات الموقع</TabsTrigger>
          <TabsTrigger value="nav" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">نصوص القوائم</TabsTrigger>
          <TabsTrigger value="sections" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">نصوص السلة والأقسام</TabsTrigger>
          <TabsTrigger value="footer" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">التواصل والتذييل</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لوقو الموقع (حواف ناعمة)</Label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="h-48 bg-muted/40 border-2 border-dashed border-primary/20 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden relative group shadow-inner"
                       >
                          {form.appearance.logoUrl ? (
                            <img src={form.appearance.logoUrl} className="h-full w-full object-contain p-6" alt="Logo Preview" />
                          ) : (
                            <div className="text-center space-y-3">
                               <Upload className="text-primary mx-auto" size={36} />
                               <p className="text-[10px] font-black uppercase text-muted-foreground">انقر لرفع اللوقو من الهاتف</p>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لون الهوية الرئيسي</Label>
                       <div className="flex gap-4">
                          <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 w-24 bg-muted/40 border-none rounded-2xl cursor-pointer p-1 shadow-inner" />
                          <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 flex-1 bg-muted/40 border-none rounded-2xl text-center font-mono font-black" />
                       </div>
                    </div>
                 </div>
                 <div className="bg-muted/20 rounded-[3rem] p-10 flex flex-col items-center justify-center border-2 border-dashed border-primary/20">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8">معاينة العلامة التجارية</h4>
                    <div className="p-12 bg-card rounded-[2.5rem] shadow-2xl border flex flex-col items-center gap-6 min-w-[280px]">
                       <div className="h-20 w-auto flex items-center justify-center">
                          {form.appearance.logoUrl ? (
                            <img src={form.appearance.logoUrl} className="h-full w-auto object-contain rounded-[1.5rem]" alt="" />
                          ) : (
                            <span className="handwritten-logo text-4xl">XMOOD <span>Store</span></span>
                          )}
                       </div>
                       <div className="h-2 bg-muted rounded-full w-full opacity-20" />
                       <div className="h-2 bg-muted rounded-full w-2/3 opacity-20" />
                       <Button style={{ backgroundColor: form.appearance.primaryColor }} className="w-full h-12 rounded-xl text-white font-black text-[10px] uppercase shadow-lg">Action Button</Button>
                    </div>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="site">
           <Card className="luxury-card p-10 space-y-10 border-none bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">عنوان الموقع الرئيسي</Label>
                    <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">العنوان الفرعي</Label>
                    <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4 flex items-center gap-2"><DollarSign size={12}/> سعر صرف الدولار (SDG)</Label>
                    <Input type="number" value={form.siteInfo.usdRate} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, usdRate: Number(e.target.value)}})} className="font-black text-xl text-primary" />
                 </div>
                 <div className="col-span-full space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">وصف الموقع (SEO)</Label>
                    <Textarea value={form.siteInfo.description} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, description: e.target.value}})} className="min-h-[100px]" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="nav">
           <Card className="luxury-card p-10 space-y-8 bg-muted/20 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">الرئيسية</Label><Input value={form.navLabels.home} onChange={e => setForm({...form, navLabels: {...form.navLabels, home: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">المتجر</Label><Input value={form.navLabels.store} onChange={e => setForm({...form, navLabels: {...form.navLabels, store: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">الخدمات</Label><Input value={form.navLabels.services} onChange={e => setForm({...form, navLabels: {...form.navLabels, services: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">المعرض</Label><Input value={form.navLabels.gallery} onChange={e => setForm({...form, navLabels: {...form.navLabels, gallery: e.target.value}})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">الوكلاء</Label><Input value={form.navLabels.agents} onChange={e => setForm({...form, navLabels: {...form.navLabels, agents: e.target.value}})} /></div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="sections">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="luxury-card p-10 space-y-6 bg-primary/5 border-none">
                 <h3 className="text-xl font-black flex items-center gap-3 text-primary"><ShoppingCart size={24} /> نصوص السلة والدفع</h3>
                 <div className="space-y-4">
                    <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">عنوان السلة</Label><Input value={form.cartLabels.cartTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, cartTitle: e.target.value}})} /></div>
                    <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">رسالة السلة الفارغة</Label><Input value={form.cartLabels.emptyCartMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, emptyCartMsg: e.target.value}})} /></div>
                    <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">عنوان صفحة الدفع</Label><Input value={form.cartLabels.checkoutTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, checkoutTitle: e.target.value}})} /></div>
                 </div>
              </Card>
              <Card className="luxury-card p-10 space-y-6 bg-muted/20 border-none">
                 <h3 className="text-xl font-black flex items-center gap-3"><Users size={24} /> نصوص المعرض والوكلاء</h3>
                 <div className="space-y-4">
                    <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">عنوان المعرض</Label><Input value={form.gallerySettings.title} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, title: e.target.value}})} /></div>
                    <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">عنوان صفحة الوكلاء</Label><Input value={form.agentSettings.title} onChange={e => setForm({...form, agentSettings: {...form.agentSettings, title: e.target.value}})} /></div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="footer">
           <Card className="luxury-card p-10 space-y-10 border-none bg-zinc-950 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary">واتساب الدعم</Label>
                    <Input value={form.contact.whatsapp} onChange={e => setForm({...form, contact: {...form.contact, whatsapp: e.target.value}})} className="bg-white/5 border-primary/20 text-center" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary">تيليجرام</Label>
                    <Input value={form.contact.telegram} onChange={e => setForm({...form, contact: {...form.contact, telegram: e.target.value}})} className="bg-white/5 border-primary/20 text-center" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary">البريد الرسمي</Label>
                    <Input value={form.contact.email} onChange={e => setForm({...form, contact: {...form.contact, email: e.target.value}})} className="bg-white/5 border-primary/20 text-center" />
                 </div>
              </div>
              <div className="pt-10 border-t border-white/10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase opacity-60">نص "عن المتجر" في التذييل</Label>
                       <Textarea value={form.footer.aboutText} onChange={e => setForm({...form, footer: {...form.footer, aboutText: e.target.value}})} className="bg-white/5 border-primary/10" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase opacity-60">العنوان الرسمي</Label>
                       <Input value={form.footer.address} onChange={e => setForm({...form, footer: {...form.footer, address: e.target.value}})} className="bg-white/5 border-primary/10" />
                    </div>
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
