"use client";

import { useState } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, Image as ImageIcon, Type, Save, 
  Loader2, Crop, Scissors, Sliders, RefreshCw, Upload, Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminDesignTools() {
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
      fontFamily: "PT Sans",
      borderRadius: "1rem"
    }
  });

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await updateDoc(settingsRef, {
        ...form,
        updatedAt: serverTimestamp()
      });
      toast({ title: "تم تحديث الهوية البصرية بنجاح" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Loading Design Suite...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b pb-8">
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">أدوات التصميم والهوية PRO</h1>
          <p className="text-muted-foreground mt-1 text-[10px] font-bold uppercase tracking-widest">Universal Visual Identity Control</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-12 px-10 text-[10px] uppercase">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={14} className="ml-2" /> حفظ الهوية الجديدة</>}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="luxury-card p-0 border-none bg-card/60 backdrop-blur-xl shadow-xl">
             <Tabs defaultValue="identity" className="w-full">
                <TabsList className="w-full bg-muted/20 border-b p-0 h-14 rounded-none">
                   <TabsTrigger value="identity" className="flex-1 rounded-none h-full data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold text-[9px] uppercase tracking-widest gap-2"><Palette size={14}/> الألوان</TabsTrigger>
                   <TabsTrigger value="images" className="flex-1 rounded-none h-full data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold text-[9px] uppercase tracking-widest gap-2"><ImageIcon size={14}/> دليل الصور</TabsTrigger>
                   <TabsTrigger value="fonts" className="flex-1 rounded-none h-full data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold text-[9px] uppercase tracking-widest gap-2"><Type size={14}/> الخطوط</TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">لون العلامة التجارية</Label>
                         <div className="flex gap-4 items-center">
                            <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 w-20 bg-muted border-none p-1 rounded-xl cursor-pointer shadow-sm" />
                            <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 flex-1 bg-muted border-none rounded-xl text-center font-mono font-bold tracking-widest" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">انحناء الحواف (UI Radius)</Label>
                         <Input value={form.appearance.borderRadius} onChange={e => setForm({...form, appearance: {...form.appearance, borderRadius: e.target.value}})} placeholder="1rem" className="h-14 bg-muted border-none rounded-xl font-bold text-center" />
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="images" className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "شعار الموقع (Logo)", ratio: "4:1", size: "400x100px" },
                        { label: "صورة المنتجات", ratio: "16:9", size: "800x450px" },
                        { label: "بانر الواجهة (Hero)", ratio: "21:9", size: "1920x820px" },
                        { label: "المساعد (Avatar)", ratio: "1:1", size: "200x200px" }
                      ].map((spec, i) => (
                        <Card key={i} className="p-5 bg-primary/5 border-dashed border-primary/20 rounded-2xl flex items-center justify-between">
                           <div>
                              <p className="font-bold text-sm mb-1">{spec.label}</p>
                              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Ratio: {spec.ratio}</p>
                           </div>
                           <Badge variant="outline" className="text-[8px] font-mono">{spec.size}</Badge>
                        </Card>
                      ))}
                   </div>
                   
                   <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                      <Info size={20} className="text-blue-500 shrink-0" />
                      <p className="text-[10px] text-blue-300 leading-relaxed font-medium">
                        تأكد دائماً من مطابقة أبعاد الصور للمواصفات أعلاه لمنع تشوه العناصر في الواجهة الأمامية. النظام يقوم بقص الصور تلقائياً (Object Cover) للحفاظ على التناسق.
                      </p>
                   </div>
                </TabsContent>

                <TabsContent value="fonts" className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">اسم الخط الأساسي (System Font)</Label>
                         <Input value={form.appearance.fontFamily} onChange={e => setForm({...form, appearance: {...form.appearance, fontFamily: e.target.value}})} className="h-14 bg-muted border-none rounded-xl font-bold" />
                      </div>
                   </div>
                </TabsContent>
             </Tabs>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="luxury-card p-8 border-none bg-primary/5 flex flex-col items-center text-center shadow-lg">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-8 flex items-center gap-2"><RefreshCw size={14}/> معاينة الهوية الحية</h3>
              <div className="w-full space-y-6">
                 <div className="p-8 bg-background rounded-3xl border shadow-2xl space-y-6">
                    <div className="flex items-center justify-center gap-4">
                       <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: form.appearance.primaryColor }} />
                       <span className="font-black text-lg tracking-tighter">BRAND PREVIEW</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full w-full" />
                    <div className="h-2 bg-muted rounded-full w-2/3 mx-auto" />
                    <Button style={{ backgroundColor: form.appearance.primaryColor }} className="w-full h-10 rounded-xl text-white font-bold text-[10px] uppercase shadow-lg">Action Button</Button>
                 </div>
                 <p className="text-[9px] text-muted-foreground leading-relaxed font-black uppercase tracking-widest">Real-time Visual Context Analysis</p>
              </div>
           </Card>

           <Card className="luxury-card p-8 border-none bg-muted/20 shadow-lg">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Sliders size={14}/> حالة الأنظمة البصرية</h3>
              <ul className="space-y-4">
                 {[
                   { label: "تحسين الجودة الآلي", status: "Active" },
                   { label: "تقييد الأبعاد (Aspect)", status: "Active" },
                   { label: "ضغط الملفات (800KB)", status: "Active" }
                 ].map((item, i) => (
                   <li key={i} className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-muted-foreground uppercase">{item.label}</span>
                      <Badge className="bg-green-500/10 text-green-600 border-none px-3 font-black">{item.status}</Badge>
                   </li>
                 ))}
              </ul>
           </Card>
        </div>
      </div>
    </div>
  );
}