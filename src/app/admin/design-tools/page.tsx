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
  Palette, Image as ImageIcon, Type, Layout, Save, 
  Loader2, Maximize, Crop, Scissors, Sliders, RefreshCw, Upload, Link as LinkIcon
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

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b pb-8">
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">أدوات التصميم والهوية</h1>
          <p className="text-muted-foreground mt-1 text-sm">إدارة العلامة التجارية وتنسيق الأصول الرقمية للمنصة.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-12 px-10">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} className="ml-2" /> حفظ التعديلات</>}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="luxury-card p-0 border-none bg-card/60 backdrop-blur-xl">
             <Tabs defaultValue="identity" className="w-full">
                <TabsList className="w-full bg-muted/20 border-b p-0 h-14 rounded-none">
                   <TabsTrigger value="identity" className="flex-1 rounded-none h-full data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold text-[10px] uppercase tracking-widest gap-2"><Palette size={14}/> الهوية</TabsTrigger>
                   <TabsTrigger value="images" className="flex-1 rounded-none h-full data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold text-[10px] uppercase tracking-widest gap-2"><ImageIcon size={14}/> الصور</TabsTrigger>
                   <TabsTrigger value="fonts" className="flex-1 rounded-none h-full data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold text-[10px] uppercase tracking-widest gap-2"><Type size={14}/> الخطوط</TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">اللون الرئيسي للمنصة</Label>
                         <div className="flex gap-4 items-center">
                            <Input type="color" value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 w-20 bg-muted border-none p-1 rounded-xl cursor-pointer" />
                            <Input value={form.appearance.primaryColor} onChange={e => setForm({...form, appearance: {...form.appearance, primaryColor: e.target.value}})} className="h-14 flex-1 bg-muted border-none rounded-xl text-center font-mono font-bold" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">انحناء الحواف (Radius)</Label>
                         <Input value={form.appearance.borderRadius} onChange={e => setForm({...form, appearance: {...form.appearance, borderRadius: e.target.value}})} placeholder="1rem" className="h-14 bg-muted border-none rounded-xl font-bold" />
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="images" className="p-8 space-y-8">
                   <div className="space-y-6">
                      <div className="p-6 border-2 border-dashed rounded-3xl flex flex-col items-center gap-4 bg-muted/10">
                         <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Upload size={28}/></div>
                         <div className="text-center">
                            <p className="font-bold text-sm">اسحب الصور هنا أو اضغط للرفع</p>
                            <p className="text-[10px] text-muted-foreground mt-1">الأحجام المدعومة: PNG, JPG, WebP (أقل من 800KB)</p>
                         </div>
                         <Button variant="outline" className="rounded-xl h-10 px-8 text-[9px] font-black uppercase">تصفح الملفات</Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {[1,2,3,4].map(i => (
                           <div key={i} className="aspect-square bg-muted/20 rounded-2xl border border-border/50 relative group overflow-hidden">
                              <img src={`https://picsum.photos/seed/tool${i}/200/200`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                 <Button size="icon" variant="ghost" className="h-8 w-8 text-white"><Crop size={14}/></Button>
                                 <Button size="icon" variant="ghost" className="h-8 w-8 text-white"><Scissors size={14}/></Button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="fonts" className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground pr-4">خط العناوين الرئيسية</Label>
                         <Input value={form.appearance.fontFamily} onChange={e => setForm({...form, appearance: {...form.appearance, fontFamily: e.target.value}})} className="h-14 bg-muted border-none rounded-xl font-bold" />
                      </div>
                   </div>
                </TabsContent>
             </Tabs>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="luxury-card p-8 border-none bg-primary/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2"><RefreshCw size={14}/> معاينة الهوية</h3>
              <div className="space-y-6">
                 <div className="p-6 bg-background rounded-2xl border shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: form.appearance.primaryColor }} />
                       <span className="font-bold text-sm">XMOOD Logo</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full w-full" />
                    <div className="h-2 bg-muted rounded-full w-2/3" />
                 </div>
                 <p className="text-[9px] text-muted-foreground leading-relaxed text-center font-medium">هذه المعاينة توضح تداخل الألوان المختارة مع عناصر الواجهة الأساسية.</p>
              </div>
           </Card>

           <Card className="luxury-card p-8 border-none bg-muted/20">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Sliders size={14}/> خصائص الصور</h3>
              <ul className="space-y-4">
                 {[
                   { label: "تحسين الجودة الآلي", status: "نشط" },
                   { label: "تصغير الحجم عند الرفع", status: "نشط" },
                   { label: "تحويل الصيغ لـ WebP", status: "نشط" }
                 ].map((item, i) => (
                   <li key={i} className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-muted-foreground">{item.label}</span>
                      <Badge className="bg-green-500/10 text-green-600 border-none">{item.status}</Badge>
                   </li>
                 ))}
              </ul>
           </Card>
        </div>
      </div>
    </div>
  );
}
