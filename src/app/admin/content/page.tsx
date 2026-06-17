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
  ShoppingCart, FileText, Bot, AlignRight, Power, 
  LayoutGrid, Link as LinkIcon, Upload, Eye, Star, Users, Briefcase
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    appearance: { primaryColor: "#d4af37", logoUrl: "", faviconUrl: "" },
    siteInfo: { title: "XMOOD STORE", subtitle: "", description: "", copyright: "" },
    gallerySettings: {
      title: "معرض الإبداع الرقمي",
      subtitle: "استلهم من أرقى التصاميم والهويات البصرية التي نفذتها أنامل خبراء الإبداع.",
      buttonText: "طلب تصميم احترافي"
    },
    agentSettings: {
      title: "الوكلاء المعتمدون",
      subtitle: "شبكة من الخبراء المعتمدين لتنفيذ عمليات الشحن والوساطة المالية بأعلى معايير الأمان.",
      ratingLabel: "تقييم العملاء",
      allowPublicRating: true
    },
    contact: { whatsapp: "", email: "" },
    footer: {
      isActive: true,
      logoUrl: "",
      aboutText: "المرجع الأول والأكثر موثوقية في تقديم الخدمات الرقمية والحلول الإبداعية المتكاملة.",
      copyright: "© 2025 XMOOD SOVEREIGN. ALL RIGHTS RESERVED.",
      address: "المنطقة السيادية، مركز الخدمات الرقمية الموحد",
      showSocial: true,
      showAddress: true
    },
    cartLabels: {
      cartTitle: "سلة المقتنيات",
      checkoutTitle: "تأكيد الاستحواذ الآلي",
      emptyCartMsg: "السلة السيادية فارغة حالياً",
      successMsg: "تم التسليم بنجاح!"
    }
  });

  useEffect(() => {
    if (config) {
      setForm(prev => ({ 
        ...prev, 
        ...config,
        gallerySettings: { ...prev.gallerySettings, ...(config.gallerySettings || {}) },
        agentSettings: { ...prev.agentSettings, ...(config.agentSettings || {}) },
        appearance: { ...prev.appearance, ...(config.appearance || {}) },
        footer: { ...prev.footer, ...(config.footer || {}) },
        cartLabels: { ...prev.cartLabels, ...(config.cartLabels || {}) }
      }));
    }
  }, [config]);

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
          <TabsTrigger value="sections" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <LayoutGrid size={16} className="text-primary" /> نصوص الأقسام
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <AlignRight size={16} className="text-primary" /> التذييل
          </TabsTrigger>
          <TabsTrigger value="cart" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <ShoppingCart size={16} className="text-primary" /> نصوص السلة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لوقو الموقع الرسمي</Label>
                       <Input 
                          value={form.appearance.logoUrl} 
                          onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} 
                          className="h-16 bg-muted/40 border-none rounded-2xl font-mono text-xs" 
                          placeholder="رابط الصورة المباشر..." 
                       />
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
                    {form.appearance.logoUrl ? <img src={form.appearance.logoUrl} className="h-24 w-auto object-contain" alt="" /> : <Eye size={40} className="opacity-20" />}
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="sections">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="luxury-card p-10 space-y-6 border-none bg-primary/5">
                 <h3 className="text-xl font-black flex items-center gap-3"><Users className="text-primary" /> نصوص الوكلاء والتقييم</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-muted-foreground">عنوان صفحة الوكلاء</Label>
                       <Input value={form.agentSettings.title} onChange={e => setForm({...form, agentSettings: {...form.agentSettings, title: e.target.value}})} className="h-12 bg-background border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-muted-foreground">وصف صفحة الوكلاء</Label>
                       <Textarea value={form.agentSettings.subtitle} onChange={e => setForm({...form, agentSettings: {...form.agentSettings, subtitle: e.target.value}})} className="bg-background border-none rounded-xl min-h-[80px]" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-primary/10">
                       <div><p className="font-bold text-sm">تفعيل نظام تقييم العملاء</p><p className="text-[8px] text-muted-foreground">السماح للأعضاء بتقييم أداء الوكلاء</p></div>
                       <Switch checked={form.agentSettings.allowPublicRating} onCheckedChange={(v) => setForm({...form, agentSettings: {...form.agentSettings, allowPublicRating: v}})} />
                    </div>
                 </div>
              </Card>

              <Card className="luxury-card p-10 space-y-6 border-none bg-primary/5">
                 <h3 className="text-xl font-black flex items-center gap-3"><Briefcase className="text-primary" /> نصوص معرض الإبداع</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-muted-foreground">عنوان المعرض</Label>
                       <Input value={form.gallerySettings.title} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, title: e.target.value}})} className="h-12 bg-background border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-muted-foreground">وصف المعرض</Label>
                       <Textarea value={form.gallerySettings.subtitle} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, subtitle: e.target.value}})} className="bg-background border-none rounded-xl min-h-[80px]" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-muted-foreground">نص زر الطلب</Label>
                       <Input value={form.gallerySettings.buttonText} onChange={e => setForm({...form, gallerySettings: {...form.gallerySettings, buttonText: e.target.value}})} className="h-12 bg-background border-none rounded-xl font-bold" />
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="footer">
           <Card className="luxury-card p-8 md:p-12 space-y-8 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">نص "عن المتجر"</Label>
                    <Textarea value={form.footer.aboutText} onChange={e => setForm({...form, footer: {...form.footer, aboutText: e.target.value}})} className="bg-muted/40 border-none rounded-2xl min-h-[120px] p-4" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">حقوق النشر</Label>
                    <Input value={form.footer.copyright} onChange={e => setForm({...form, footer: {...form.footer, copyright: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="cart">
           <Card className="luxury-card p-8 md:p-12 space-y-8 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">عنوان السلة</Label>
                    <Input value={form.cartLabels.cartTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, cartTitle: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">رسالة السلة الفارغة</Label>
                    <Input value={form.cartLabels.emptyCartMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, emptyCartMsg: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl" />
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
