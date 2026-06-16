"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, Loader2, Globe, Layout, MessageSquare, Zap, Megaphone, 
  Palette, Share2, Info, Image as ImageIcon, Shield, Wallet, 
  ArrowRightLeft, Settings, Type, Smartphone, Eye, Sparkles, Mail
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminContentManager() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    appearance: { primaryColor: "#d4af37", logoUrl: "", faviconUrl: "" },
    siteInfo: { title: "XMOOD STORE", subtitle: "", description: "", copyright: "" },
    pageContent: { heroTitle: "", heroDescription: "", footerAbout: "" },
    contact: { whatsapp: "", email: "", telegram: "", facebook: "", instagram: "", youtube: "", tiktok: "", workHours: "" },
    emailBranding: { senderName: "XMOOD SECURITY", senderEmail: "", footerText: "© 2025 XMOOD STORE. All Rights Reserved." },
    ads: { headerBanner: "", promoText: "", isActive: false, buttonText: "اطلب الآن" },
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
    navLabels: {
      home: "الرئيسية",
      store: "المتجر",
      services: "سوق الخدمات",
      gallery: "معرض الإبداع",
      agents: "الوكلاء"
    }
  });

  useEffect(() => {
    if (config) {
      setForm(prev => ({ 
        ...prev, 
        ...config,
        appearance: { ...prev.appearance, ...(config.appearance || {}) },
        emailBranding: { ...prev.emailBranding, ...(config.emailBranding || {}) },
        contact: { ...prev.contact, ...(config.contact || {}) },
        loginPage: { ...prev.loginPage, ...(config.loginPage || {}) },
        walletPage: { ...prev.walletPage, ...(config.walletPage || {}) },
        navLabels: { ...prev.navLabels, ...(config.navLabels || {}) }
      }));
    }
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم تثبيت المحتوى والنصوص السيادية بنجاح" });
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
          <TabsTrigger value="emails" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <Mail size={16} className="text-primary" /> هوية المراسلات
          </TabsTrigger>
          <TabsTrigger value="login" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <Shield size={16} className="text-primary" /> نصوص الدخول
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <Wallet size={16} className="text-primary" /> نصوص المحفظة
          </TabsTrigger>
          <TabsTrigger value="nav" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <Layout size={16} className="text-primary" /> التفرعات
          </TabsTrigger>
          <TabsTrigger value="social" className="flex-1 min-w-[140px] rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest py-5 gap-2">
            <Share2 size={16} className="text-primary" /> التواصل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لوقو الموقع (URL)</Label>
                       <Input 
                         value={form.appearance.logoUrl} 
                         onChange={e => setForm({...form, appearance: {...form.appearance, logoUrl: e.target.value}})} 
                         className="h-16 bg-muted/40 border-none rounded-2xl font-mono text-xs" 
                         placeholder="https://..." 
                       />
                       <p className="text-[8px] text-muted-foreground pr-4">سيتم قص اللوقو تلقائياً وجعل حوافه دائرية انسيابية (Smart Crop).</p>
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
                       <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150 opacity-50 group-hover:opacity-100 transition-opacity" />
                       <div className="relative w-48 h-48 md:w-64 md:h-24 bg-white dark:bg-zinc-950 rounded-[2rem] border-4 border-white dark:border-zinc-800 shadow-2xl overflow-hidden flex items-center justify-center">
                          {form.appearance.logoUrl ? (
                            <img 
                              src={form.appearance.logoUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                            />
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

        <TabsContent value="emails">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">اسم المرسل (From Name)</Label>
                    <Input value={form.emailBranding.senderName} onChange={e => setForm({...form, emailBranding: {...form.emailBranding, senderName: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" placeholder="XMOOD SECURITY" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">بريد الإرسال (للعرض فقط)</Label>
                    <Input value={form.emailBranding.senderEmail} readOnly className="h-14 bg-muted/20 border-none rounded-2xl font-mono text-xs opacity-60" placeholder="noreply@xmood-36c92.firebaseapp.com" />
                 </div>
                 <div className="col-span-full space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">تذييل الرسالة (Footer)</Label>
                    <Textarea value={form.emailBranding.footerText} onChange={e => setForm({...form, emailBranding: {...form.emailBranding, footerText: e.target.value}})} className="bg-muted/40 border-none rounded-2xl min-h-[100px] p-4" />
                 </div>
              </div>
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
                 <Info size={24} className="text-primary shrink-0" />
                 <p className="text-xs font-bold leading-relaxed">
                   <b>مهم:</b> بما أنك تستخدم النطاق الافتراضي، قم بنسخ "اسم المرسل" و "التذييل" أعلاه وضعهما يدوياً في <b>Firebase Console &rarr; Authentication &rarr; Templates</b> لتحسين وصول الرسائل.
                 </p>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="login">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">عنوان الصفحة الكبير</Label>
                    <Input value={form.loginPage.title} onChange={e => setForm({...form, loginPage: {...form.loginPage, title: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">وصف الهوية الرقمية</Label>
                    <Input value={form.loginPage.subtitle} onChange={e => setForm({...form, loginPage: {...form.loginPage, subtitle: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-medium" />
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
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">عنوان قسم الإيداع (UID)</Label>
                    <Input value={form.walletPage.uidTitle} onChange={e => setForm({...form, walletPage: {...form.walletPage, uidTitle: e.target.value}})} className="h-14 bg-muted/40 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="col-span-full space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">وصف بروتوكول الإيداع</Label>
                    <Textarea value={form.walletPage.uidDesc} onChange={e => setForm({...form, walletPage: {...form.walletPage, uidDesc: e.target.value}})} className="bg-muted/40 border-none rounded-2xl min-h-[100px] p-4" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="nav">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[
                   { label: "رابط الرئيسية", key: "home" },
                   { label: "رابط المتجر", key: "store" },
                   { label: "رابط سوق الخدمات", key: "services" },
                   { label: "رابط المعرض", key: "gallery" },
                   { label: "رابط الوكلاء", key: "agents" },
                 ].map((item) => (
                   <div key={item.key} className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3">{item.label}</Label>
                      <Input 
                        value={(form.navLabels as any)[item.key]} 
                        onChange={e => setForm({...form, navLabels: {...form.navLabels, [item.key]: e.target.value}})} 
                        className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-bold" 
                      />
                   </div>
                 ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="social">
           <Card className="luxury-card p-8 md:p-12 space-y-10 border-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[
                   { label: "واتساب الدعم", key: "whatsapp", icon: Smartphone },
                   { label: "تيليجرام", key: "telegram", icon: Zap },
                   { label: "فيسبوك", key: "facebook", icon: Share2 },
                   { label: "إنستغرام", key: "instagram", icon: Layout },
                   { label: "يوتيوب", key: "youtube", icon: Megaphone },
                   { label: "البريد الرسمي", key: "email", icon: Globe },
                 ].map((item) => (
                   <div key={item.key} className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground pr-3 flex items-center gap-2">
                        <item.icon size={12} className="text-primary" /> {item.label}
                      </Label>
                      <Input 
                        value={(form.contact as any)[item.key]} 
                        onChange={e => setForm({...form, contact: {...form.contact, [item.key]: e.target.value}})} 
                        className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-bold text-sm" 
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