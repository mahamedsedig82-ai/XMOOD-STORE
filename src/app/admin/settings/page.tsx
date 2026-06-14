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
  ShieldCheck, Zap, Facebook, Youtube, Clock,
  Send, Info, DollarSign, Image as ImageIcon, Store, Monitor
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
      backgroundColor: "#09090b",
      logoUrl: "",
      faviconUrl: "",
      previewImageUrl: ""
    },
    siteInfo: {
      title: "XMOOD STORE",
      subtitle: "مركز الخدمات الرقمية المعتمدة",
      description: "منصة متكاملة لتقديم الحلول والخدمات الرقمية الموثوقة.",
      copyright: "© 2025 XMOOD PROFESSIONAL SERVICES. ALL RIGHTS RESERVED.",
      usdRate: "5400"
    },
    pageContent: {
      heroTitle: "حلول رقمية متقدمة وموثوقة",
      heroDescription: "نقدم لك أفضل باقات شحن الألعاب، الحسابات المميزة، والخدمات الاحترافية بأعلى معايير الأمان والسرعة.",
      footerAbout: "المنصة الرائدة والموثوقة لتقديم كافة الحلول والخدمات الرقمية المتكاملة، نسعى دائماً للابتكار والسرعة لخدمة عملائنا."
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
        pageContent: { ...prev.pageContent, ...config.pageContent },
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
      toast({ title: "تم تحديث كافة الإعدادات", description: "تم تطبيق التغييرات على الهوية والمحتوى بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest opacity-50">Loading Central Control...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-10">
        <div className="text-right">
          <h1 className="text-5xl font-headline font-bold gold-text">مركز التحكم الكامل</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Site Identity & Content Master Console</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> حفظ كافة التعديلات</>}
        </Button>
      </header>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 rounded-3xl h-auto border mb-10 flex flex-wrap gap-2 px-4">
          <TabsTrigger value="visual" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black py-4">
            <Palette size={16} className="ml-2" /> الهوية البصرية
          </TabsTrigger>
          <TabsTrigger value="site" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black py-4">
            <Globe size={16} className="ml-2" /> محتوى الصفحات
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black py-4">
            <DollarSign size={16} className="ml-2" /> الإعدادات المالية
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black py-4">
            <Phone size={16} className="ml-2" /> التواصل الاجتماعي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
          <Card className="luxury-card p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رابط اللوقو الرئيسي</Label>
                <Input value={form.appearance.logoUrl} onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} placeholder="https://..." className="h-14 bg-muted border-none rounded-xl" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">رابط الأيقونة (Favicon)</Label>
                <Input value={form.appearance.faviconUrl} onChange={e => setForm({...form, appearance: {...form.appearance, faviconUrl: e.target.value}})} placeholder="https://..." className="h-14 bg-muted border-none rounded-xl" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">صورة المعاينة (OpenGraph)</Label>
                <Input value={form.appearance.previewImageUrl} onChange={e => setForm({...form, appearance: {...form.appearance, previewImageUrl: e.target.value}})} placeholder="https://..." className="h-14 bg-muted border-none rounded-xl" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">اللون الأساسي</Label>
                <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 w-full bg-muted border-none rounded-xl cursor-pointer" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="site">
          <Card className="luxury-card p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">عنوان الصفحة الرئيسية (Hero)</Label>
                  <Input value={form.pageContent.heroTitle} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroTitle: e.target.value}})} className="h-14 bg-muted border-none rounded-xl font-bold" />
               </div>
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">الوصف الفرعي (Hero)</Label>
                  <Textarea value={form.pageContent.heroDescription} onChange={e => setForm({...form, pageContent: {...form.pageContent, heroDescription: e.target.value}})} className="bg-muted border-none rounded-xl min-h-[100px]" />
               </div>
               <div className="space-y-4 col-span-full">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">وصف التذييل (Footer About)</Label>
                  <Textarea value={form.pageContent.footerAbout} onChange={e => setForm({...form, pageContent: {...form.pageContent, footerAbout: e.target.value}})} className="bg-muted border-none rounded-xl min-h-[100px]" />
               </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card className="luxury-card p-10 bg-green-500/5 border-green-500/10 space-y-8">
            <div className="flex items-center gap-4 text-green-600">
              <DollarSign size={32} />
              <h3 className="text-2xl font-bold">تحديث سعر الصرف المركزي</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">سعر صرف الدولار (SDG مقابل 1 USD)</Label>
                <Input type="number" value={form.siteInfo.usdRate} onChange={e => setForm({...form, siteInfo: {...form.siteInfo, usdRate: e.target.value}})} className="h-16 text-center text-3xl font-black bg-white border-green-500/20 rounded-2xl text-green-600 shadow-inner" />
              </div>
              <div className="p-8 bg-white/40 rounded-3xl border flex items-center">
                 <p className="text-xs text-muted-foreground leading-relaxed italic">
                   ملاحظة: سيتم تطبيق هذا السعر فوراً على كافة حسابات المستخدمين وعرض أسعار المنتجات بالعملة المحلية في الموقع.
                 </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
           <Card className="luxury-card p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { label: "رابط واتساب", key: "whatsapp", icon: MessageSquare },
                   { label: "رابط تيليجرام", key: "telegram", icon: Send },
                   { label: "رابط فيسبوك", key: "facebook", icon: Facebook },
                   { label: "رابط يوتيوب", key: "youtube", icon: Youtube },
                   { label: "رابط إنستغرام", key: "instagram", icon: Instagram },
                   { label: "البريد الرسمي", key: "email", icon: Mail },
                   { label: "ساعات العمل", key: "workHours", icon: Clock },
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