
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Save, Loader2, Zap, ShieldCheck, CreditCard, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminCartSettings() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading } = useDoc(settingsRef);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    cartLabels: {
      cartTitle: "سلة المقتنيات",
      checkoutTitle: "تأكيد الاستحواذ الآلي",
      emptyCartMsg: "السلة السيادية فارغة حالياً",
      successMsg: "تم التسليم بنجاح!",
      summaryTitle: "ملخص الحساب المركزي"
    }
  });

  useEffect(() => {
    if (config?.cartLabels) {
      setForm({ cartLabels: { ...form.cartLabels, ...config.cartLabels } });
    }
  }, [config]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم تحديث نظام السلة والدفع" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Loading Cart Systems...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-10">
        <div className="text-right">
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text">إدارة نظام السلة والدفع</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">Cart & Checkout Logistics Control</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="royal-button h-16 px-16 text-lg">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="ml-3" /> تثبيت الإعدادات</>}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="luxury-card border-none bg-primary/5 p-10 space-y-8">
           <h3 className="text-2xl font-black flex items-center gap-4 text-primary"><ShoppingCart size={28} /> نصوص واجهة السلة</h3>
           <div className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase pr-4">عنوان السلة الرئيسي</Label>
                 <Input value={form.cartLabels.cartTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, cartTitle: e.target.value}})} />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase pr-4">رسالة السلة الفارغة</Label>
                 <Input value={form.cartLabels.emptyCartMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, emptyCartMsg: e.target.value}})} />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase pr-4">عنوان ملخص الحساب</Label>
                 <Input value={form.cartLabels.summaryTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, summaryTitle: e.target.value}})} />
              </div>
           </div>
        </Card>

        <Card className="luxury-card border-none bg-zinc-950/60 p-10 space-y-8 text-white">
           <h3 className="text-2xl font-black flex items-center gap-4 gold-text"><CreditCard size={28} /> نصوص صفحة الدفع</h3>
           <div className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase pr-4 text-primary">عنوان صفحة التأكيد</Label>
                 <Input value={form.cartLabels.checkoutTitle} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, checkoutTitle: e.target.value}})} className="bg-zinc-900 border-primary/20" />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase pr-4 text-primary">رسالة النجاح النهائية</Label>
                 <Input value={form.cartLabels.successMsg} onChange={e => setForm({...form, cartLabels: {...form.cartLabels, successMsg: e.target.value}})} className="bg-zinc-900 border-primary/20" />
              </div>
           </div>
           
           <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 mt-10">
              <ShieldCheck className="text-red-500 shrink-0" size={24} />
              <div>
                 <p className="text-sm font-bold text-red-500">حماية المخزون نشطة</p>
                 <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
                   النظام يقوم حالياً بمنع أي عملية بيع إذا كان المخزون فارغاً (0). يتم فحص الأكواد المتوفرة لحظياً قبل خصم الرصيد من محفظة العميل.
                 </p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
