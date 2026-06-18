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
  ShoppingCart, MessageSquare, Zap, LayoutGrid, ShieldCheck, Heart, Facebook, Instagram, Youtube, Send
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    appearance: { primaryColor: "#d4af37", logoUrl: "", logoRounded: true },
    siteInfo: { title: "XMOOD STORE", subtitle: "مركز الخدمات الرقمية المعتمدة", description: "", copyright: "", usdRate: 5400 },
    navLabels: { home: "الرئيسية", store: "المتجر", services: "سوق الخدمات", gallery: "معرض الإبداع", agents: "الوكلاء" },
    cartLabels: { cartTitle: "سلة المقتنيات", emptyCartMsg: "السلة السيادية فارغة حالياً", checkoutTitle: "تأكيد الاستحواذ الآلي", successMsg: "تم التسليم بنجاح!", summaryTitle: "ملخص الحساب المركزي" },
    gallerySettings: { title: "معرض الإبداع الرقمي", subtitle: "استلهم من أرقى التصاميم والهويات البصرية.", badge: "بورتفوليو نخبة المصممين", buttonText: "طلب تصميم مشابه" },
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
          const MAX_WIDTH = 600;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
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

  const handleSave = () => {
    if (!db || !settingsRef) return;
    setIsSaving(true);
    const data = { ...form, updatedAt: serverTimestamp() };
    
    setDoc(settingsRef, data, { merge: true })
      .then(() => {
        toast({ title: "تم تثبيت التغييرات السيادية بنجاح" });
      })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: settingsRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      })
      .finally(() => setIsSaving(false));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-6">
       <Loader2 className="animate-spin text-primary" size={80} />
       <p className="text-[11px] font-black uppercase tracking-[0.5em] gold-text">Initializing Identity Master Suite...</p>
    </div>
  );

  return (
    <div className="space-y-16 animate-fade-in pb-40 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-10 border-b pb-12">
        <div>
          <h1 className="text-5xl md:text-7xl font-headline font-black gold-text">مركز التحكم بالهوية</h1>
          <p className="text-muted-foreground mt-4 font-bold uppercase tracking-[0.4em] text-[11px]">Universal Identity & Content Controller 8.0</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-20 px-20 text-xl w-full md:w-auto shadow-primary/30">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={32} className="ml-4" /> حفظ التغييرات الأسطورية</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-card p-3 rounded-[3.5rem] h-auto border mb-16 flex flex-wrap gap-3 px-8 justify-center shadow-2xl">
          <TabsTrigger value="visual" className="flex-1 min-w-[160px] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest py-6 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">الهوية واللوقو</TabsTrigger>
          <TabsTrigger value="site" className="flex-1 min-w-[160px] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest py-6 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">بيانات الموقع</TabsTrigger>
          <TabsTrigger value="sections" className="flex-1 min-w-[160px] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest py-6 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">نصوص الأقسام</TabsTrigger>
          <TabsTrigger value="footer" className="flex-1 min-w-[160px] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest py-6 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">التواصل والتذييل</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
           <Card className="luxury-card p-10 md:p-20 space-y-16 border-none bg-card shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                 <div className="space-y-12">
                    <div className="space-y-6">
                       <Label className="text-[11px] font-black uppercase text-primary pr-6 tracking-widest">لوقو الموقع الرسمي (تطبيق حواف ناعمة)</Label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="h-80 bg-muted/40 border-4 border-dashed border-primary/20 rounded-[4rem] flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden relative group shadow-inner"
                       >
                          {form.appearance.logoUrl ? (
                            <img src={form.appearance.logoUrl} className="h-full w-full object-contain p-10" style={{ borderRadius: '3.5rem' }} alt="Logo Preview" />
                          ) : (
                            <div className="text-center space-y-4">
                               <Upload className="text-primary mx-auto" size={64} />
                               <p className="text-[11px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">انقر لاختيار صورة من استوديو الهاتف</p>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                       </div>
                    </div>
                    <div className="space-y-6">
                       <Label className="text-[11px] font-black uppercase text-primary pr-6 tracking-widest">لون الهوية الأساسي (Gold/Primary)</Label>
                       <div className="flex gap-6">
                          <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-20 w-32 bg-muted/40 border-none rounded-[1.8rem] cursor-pointer p-1 shadow-inner" />
                          <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-20 flex-1 bg-muted/40 border-none rounded-[1.8rem] text-center font-mono font-black text-3xl" />
                       </div>
                    </div>
                 </div>
                 <div className="bg-emerald-950/10 rounded-[5rem] p-12 flex flex-col items-center justify-center border-4 border-dashed border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] -mr-20 -mt-20" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-primary mb-16 relative z-10">معاينة العلامة التجارية الأسطورية</h4>
                    <div className="p-20 bg-card rounded-[4.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border flex flex-col items-center gap-12 min-w-[360px] relative z-10">
                       <div className="h-28 w-auto flex items-center justify-center">
                          {form.appearance.logoUrl ? (
                            <img src={form.appearance.logoUrl} className="h-full w-auto object-contain" style={{ borderRadius: '2.5rem' }} alt="" />
                          ) : (
                            <span className="handwritten-logo text-6xl">XMOOD <span>Store</span></span>
                          )}
                       </div>
                       <div className="h-2.5 bg-muted rounded-full w-full opacity-30 shadow-inner" />
                       <div className="h-2.5 bg-muted rounded-full w-2/3 opacity-30 shadow-inner" />
                       <Button style={{ backgroundColor: form.appearance.primaryColor }} className="w-full h-18 rounded-[1.5rem] text-white font-black text-[11px] uppercase shadow-2xl tracking-[0.3em]">Identity Action Preview</Button>
                    </div>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="site">
           <Card className="luxury-card p-12 md:p-20 space-y-16 border-none bg-primary/5 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase text-primary pr-6">عنوان الموقع الرئيسي</Label>
                    <Input value={form.siteInfo.title} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, title: e.target.value}})} className="h-16 font-black text-2xl" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase text-primary pr-6">العنوان الفرعي للمنصة</Label>
                    <Input value={form.siteInfo.subtitle} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, subtitle: e.target.value}})} className="h-16 font-bold text-lg" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase text-primary pr-6 flex items-center gap-3"><DollarSign size={16}/> سعر صرف الدولار (SDG)</Label>
                    <Input type="number" value={form.siteInfo.usdRate} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, usdRate: Number(e.target.value)}})} className="h-20 font-black text-4xl text-primary text-center" />
                 </div>
                 <div className="col-span-full space-y-4">
                    <Label className="text-[11px] font-black uppercase text-primary pr-6">وصف الموقع الاستراتيجي (SEO)</Label>
                    <Textarea value={form.siteInfo.description} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, description: e.target.value}})} className="min-h-[160px] rounded-[2.5rem] text-lg font-medium p-10" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="sections">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="luxury-card p-12 space-y-10 bg-card shadow-2xl">
                 <h3 className="text-3xl font-black flex items-center gap-5 text-primary"><LayoutGrid size={32} /> نصوص معرض الإبداع</h3>
                 <div className="space-y-8">
                    <div className="space-y-3"><Label className="text-[10px] font-black uppercase opacity-60 tracking-widest pr-4">العنوان الرئيسي</Label><Input value={form.gallerySettings.title} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, title: e.target.value}})} /></div>
                    <div className="space-y-3"><Label className="text-[10px] font-black uppercase opacity-60 tracking-widest pr-4">نص زر الطلب</Label><Input value={form.gallerySettings.buttonText} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, buttonText: e.target.value}})} /></div>
                    <div className="space-y-3"><Label className="text-[10px] font-black uppercase opacity-60 tracking-widest pr-4">الوصف التحفيزي</Label><Textarea value={form.gallerySettings.subtitle} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, subtitle: e.target.value}})} className="min-h-[140px]" /></div>
                 </div>
              </Card>
              <Card className="luxury-card p-12 space-y-10 bg-zinc-950 shadow-2xl text-white">
                 <h3 className="text-3xl font-black flex items-center gap-5 gold-text"><ShieldCheck size={32} /> نصوص الوكلاء والسلة</h3>
                 <div className="space-y-8">
                    <div className="space-y-3"><Label className="text-[10px] font-black uppercase text-primary tracking-widest pr-4">عنوان صفحة الوكلاء</Label><Input value={form.agentSettings.title} onChange={e => setForm({...form, agentSettings: {...form.agentSettings, title: e.target.value}})} className="bg-zinc-900 border-primary/20" /></div>
                    <div className="space-y-3"><Label className="text-[10px] font-black uppercase text-primary tracking-widest pr-4">عنوان السلة الرئيسي</Label><Input value={form.cartLabels.cartTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, cartTitle: e.target.value}})} className="bg-zinc-900 border-primary/20" /></div>
                    <div className="space-y-3"><Label className="text-[10px] font-black uppercase text-primary tracking-widest pr-4">رسالة نجاح التسليم</Label><Input value={form.cartLabels.successMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, successMsg: e.target.value}})} className="bg-zinc-900 border-primary/20" /></div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="footer">
           <Card className="luxury-card p-12 md:p-20 space-y-16 border-none bg-zinc-950 text-white shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 <div className="space-y-4"><Label className="text-[11px] font-black uppercase text-primary pr-6 flex items-center gap-3"><Smartphone size={16}/> واتساب الدعم</Label><Input value={form.contact.whatsapp} onChange={e => setForm({...form, contact: {...form.contact, whatsapp: e.target.value}})} className="bg-white/5 border-primary/20 text-center text-xl font-black" /></div>
                 <div className="space-y-4"><Label className="text-[11px] font-black uppercase text-primary pr-6 flex items-center gap-3"><Send size={16}/> تيليجرام</Label><Input value={form.contact.telegram} onChange={e => setForm({...form, contact: {...form.contact, telegram: e.target.value}})} className="bg-white/5 border-primary/20 text-center font-bold" /></div>
                 <div className="space-y-4"><Label className="text-[11px] font-black uppercase text-primary pr-6 flex items-center gap-3"><Instagram size={16}/> انستجرام</Label><Input value={form.contact.instagram} onChange={e => setForm({...form, contact: {...form.contact, instagram: e.target.value}})} className="bg-white/5 border-primary/20 text-center font-bold" /></div>
              </div>
              <div className="pt-16 border-t border-white/10 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4"><Label className="text-[11px] font-black uppercase opacity-60 tracking-widest pr-6">نص "عن المتجر" في التذييل</Label><Textarea value={form.footer.aboutText} onChange={e => setForm({...form, footer: {...form.footer, aboutText: e.target.value}})} className="bg-white/5 border-primary/10 rounded-[2.5rem] p-8" /></div>
                    <div className="space-y-4"><Label className="text-[11px] font-black uppercase opacity-60 tracking-widest pr-6">حقوق الملكية الفكرية</Label><Input value={form.footer.copyright} onChange={e => setForm({...form, footer: {...form.footer, copyright: e.target.value}})} className="bg-white/5 border-primary/10" /></div>
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}