
"use client";

import { useState, useEffect, useRef } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, Loader2, Layout, MessageSquare, Zap, Megaphone, 
  Palette, Share2, Info, Image as ImageIcon, Shield, Wallet, 
  Settings, Type, Smartphone, Eye, Sparkles, Mail, Globe, Upload, Link as LinkIcon, 
  LayoutGrid, Power, AlignRight, ShoppingCart, FileText
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminContentManager() {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const footerLogoRef = useRef<HTMLInputElement>(null);
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: { primaryColor: "#d4af37", logoUrl: "", faviconUrl: "" },
    siteInfo: { title: "XMOOD STORE", subtitle: "", description: "", copyright: "" },
    contact: { whatsapp: "", email: "", telegram: "", facebook: "", instagram: "", youtube: "", tiktok: "", workHours: "" },
    ads: { headerBanner: "", promoText: "", isActive: false, buttonText: "اطلب الآن" },
    footer: {
      isActive: true,
      logoUrl: "",
      aboutText: "المرجع الأول والأكثر موثوقية في تقديم الخدمات الرقمية والحلول الإبداعية المتكاملة.",
      copyright: "© 2025 XMOOD SOVEREIGN. ALL RIGHTS RESERVED.",
      address: "المنطقة السيادية، مركز الخدمات الرقمية الموحد",
      showSocial: true,
      showAddress: true
    },
    loginPage: {
      title: "تأمين الهوية الرقمية",
      subtitle: "انضم لنخبة متداولي الخدمات الرقمية عبر نظام دخول مشفر يضمن حماية بياناتك.",
      cardTitle: "بوابة الوصول المعتمدة",
      cardSubtitle: "Identity & Trust Management"
    },
    walletPage: {
      title: "المحفظة السيادية",
      uidTitle: "بروتوكول الإيداع السيادي",
      uidDesc: "زود محفظتك بالرصيد عبر أحد وكلائنا المعتمدين؛ قدم معرفك الرقمي (UID) الموحد أدناه لضمان وصول الحوالة في الوقت الفعلي.",
      ledgerTitle: "سجل التدفقات والعمليات"
    },
    cartLabels: {
      cartTitle: "سلة المقتنيات",
      checkoutTitle: "تأكيد الاستحواذ الآلي",
      emptyCartMsg: "السلة السيادية فارغة حالياً",
      successMsg: "تم التسليم بنجاح!",
      summaryTitle: "ملخص الاستحواذ"
    },
    legal: {
      terms: "الشروط والأحكام الخاصة بالمنصة...",
      privacy: "سياسة الخصوصية وحماية البيانات...",
      faq: "الأسئلة الشائعة حول الخدمات..."
    }
  });

  useEffect(() => {
    if (config) {
      setForm(prev => ({ 
        ...prev, 
        ...config,
        appearance: { ...prev.appearance, ...(config.appearance || {}) },
        contact: { ...prev.contact, ...(config.contact || {}) },
        loginPage: { ...prev.loginPage, ...(config.loginPage || {}) },
        walletPage: { ...prev.walletPage, ...(config.walletPage || {}) },
        cartLabels: { ...prev.cartLabels, ...(config.cartLabels || {}) },
        footer: { ...prev.footer, ...(config.footer || {}) },
        legal: { ...prev.legal, ...(config.legal || {}) }
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
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'footerLogo') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const b64 = await compressImage(file);
        if (target === 'logo') {
           setForm({ ...form, appearance: { ...form.appearance, logoUrl: b64 } });
        } else {
           setForm({ ...form, footer: { ...form.footer, logoUrl: b64 } });
        }
        toast({ title: "تم معالجة الصورة بنجاح" });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل معالجة الصورة" });
      }
    }
  };

  const handleSave = async () => {
    if (!db || !settingsRef) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم تثبيت المحتوى والنصوص السيادية بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-6">
       <Loader2 className="animate-spin text-primary" size={60} />
       <p className="text-[10px] font-black uppercase tracking-widest gold-text">Loading Content Engine...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-12">
        <div className="text-right">
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight">مركز التحكم بالمحتوى</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Universal Content & Identity Master</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg w-full md:w-auto">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ كافة التعديلات</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-muted/30 p-2 rounded-[2.5rem] h-auto border mb-12 flex flex-wrap gap-2 px-4 justify-center">
          <TabsTrigger value="visual" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <Palette size={16} className="text-primary" /> الهوية واللوقو
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <AlignRight size={16} className="text-primary" /> التذييل
          </TabsTrigger>
          <TabsTrigger value="cart" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <ShoppingCart size={16} className="text-primary" /> نصوص السلة
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <FileText size={16} className="text-primary" /> السياسات والقوانين
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <Wallet size={16} className="text-primary" /> نصوص المحفظة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لوقو الموقع الرسمي</Label>
                       <Tabs defaultValue="url" className="w-full">
                         <TabsList className="bg-muted p-1 rounded-xl mb-4">
                            <TabsTrigger value="url" className="flex-1 gap-2"><LinkIcon size={12} /> رابط</TabsTrigger>
                            <TabsTrigger value="upload" className="flex-1 gap-2"><Upload size={12} /> رفع من المعرض</TabsTrigger>
                         </TabsList>
                         <TabsContent value="url">
                            <Input 
                              value={form.appearance.logoUrl} 
                              onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} 
                              className="h-16 bg-muted/40 border-none rounded-2xl font-mono text-xs" 
                              placeholder="https://..." 
                            />
                         </TabsContent>
                         <TabsContent value="upload">
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="h-16 bg-muted/40 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all"
                            >
                               <span className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                  <Upload size={14} /> اختر صورة من المعرض
                               </span>
                               <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'logo')} accept="image/*" className="hidden" />
                            </div>
                         </TabsContent>
                       </Tabs>
                    </div>
                    
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لون الهوية الرئيسي</Label>
                       <div className="flex gap-4">
                          <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 w-24 bg-muted/40 border-none rounded-2xl cursor-pointer p-1 shadow-inner" />
                          <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-16 flex-1 bg-muted/40 border-none rounded-2xl text-center font-mono font-black" />
                       </div>
                    </div>
                 </div>

                 <div className="bg-muted/20 rounded-[3rem] p-10 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                       <Eye size={14} /> معاينة اللوقو الذكية
                    </div>
                    <div className="relative group">
                       <div className="relative w-48 h-48 md:w-64 md:h-24 bg-white dark:bg-zinc-950 luxury-image overflow-hidden flex items-center justify-center border-none shadow-none">
                          {form.appearance.logoUrl ? (
                            <img src={form.appearance.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center opacity-20">
                               <ImageIcon size={40} />
                               <span className="text-[10px] font-black mt-2">NO LOGO</span>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="footer">
           <Card className="luxury-card p-8 md:p-12 space-y-12 border-none">
              <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border border-primary/10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                       <Power size={24} />
                    </div>
                    <div>
                       <h4 className="font-black text-lg">حالة تذييل الموقع</h4>
                       <p className="text-xs text-muted-foreground">تعطيل أو تفعيل قسم Footer في كافة الصفحات</p>
                    </div>
                 </div>
                 <Switch 
                   checked={form.footer.isActive} 
                   onCheckedChange={(val) => setForm({...form, footer: {...form.footer, isActive: val}})}
                 />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لوقو التذييل (Footer Logo)</Label>
                       <div 
                         onClick={() => footerLogoRef.current?.click()}
                         className="h-24 bg-muted/40 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden"
                       >
                          {form.footer.logoUrl ? (
                             <img src={form.footer.logoUrl} className="h-full w-full object-contain luxury-image border-none shadow-none" alt="" />
                          ) : (
                             <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Upload size={14} /> رفع لوقو طرفي
                             </span>
                          )}
                          <input type="file" ref={footerLogoRef} onChange={(e) => handleImageUpload(e, 'footerLogo')} accept="image/*" className="hidden" />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">حقوق النشر (Copyright)</Label>
                       <Input value={form.footer.copyright} onChange={e => setForm({...form, footer: {...form.footer, copyright: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">نص "عن المتجر" في التذييل</Label>
                       <Textarea value={form.footer.aboutText} onChange={e => setForm({...form, footer: {...form.footer, aboutText: e.target.value}})} className="bg-muted/40 border-none rounded-2xl min-h-[120px] p-6 text-sm font-medium" />
                    </div>
                    
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">العنوان الطرفي (Physical Address)</Label>
                       <Input value={form.footer.address} onChange={e => setForm({...form, footer: {...form.footer, address: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-medium" />
                    </div>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="cart">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">عنوان صفحة السلة</Label>
                    <Input value={form.cartLabels.cartTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, cartTitle: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">عنوان صفحة الدفع</Label>
                    <Input value={form.cartLabels.checkoutTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, checkoutTitle: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">رسالة السلة الفارغة</Label>
                    <Input value={form.cartLabels.emptyCartMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, emptyCartMsg: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">رسالة النجاح النهائي</Label>
                    <Input value={form.cartLabels.successMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, successMsg: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="legal">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="space-y-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">الشروط والأحكام (Terms & Conditions)</Label>
                    <Textarea value={form.legal.terms} onChange={e => setForm({...form, legal: {...form.legal, terms: e.target.value}})} className="bg-muted/40 border-none rounded-2xl min-h-[150px] p-6 text-sm font-medium" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">سياسة الخصوصية (Privacy Policy)</Label>
                    <Textarea value={form.legal.privacy} onChange={e => setForm({...form, legal: {...form.legal, privacy: e.target.value}})} className="bg-muted/40 border-none rounded-2xl min-h-[150px] p-6 text-sm font-medium" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">الأسئلة الشائعة (FAQ)</Label>
                    <Textarea value={form.legal.faq} onChange={e => setForm({...form, legal: {...form.legal, faq: e.target.value}})} className="bg-muted/40 border-none rounded-2xl min-h-[150px] p-6 text-sm font-medium" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="wallet">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">عنوان صفحة المحفظة</Label>
                    <Input value={form.walletPage.title} onChange={e => setForm({...form, walletPage: {...form.walletPage, title: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-black" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">عنوان قسم الإيداع</Label>
                    <Input value={form.walletPage.uidTitle} onChange={e => setForm({...form, walletPage: {...form.walletPage, uidTitle: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="col-span-full space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">وصف بروتوكول الإيداع</Label>
                    <Textarea value={form.walletPage.uidDesc} onChange={e => setForm({...form, walletPage: {...form.walletPage, uidDesc: e.target.value}})} className="bg-muted/40 border-none rounded-2xl min-h-[100px] p-4" />
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
