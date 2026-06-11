
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Globe, DollarSign, Bell, Shield, Database, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";

export default function AdminSettings() {
  const db = useFirestore();
  const [exchangeRate, setExchangeRate] = useState("5400");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSave = () => {
    toast({ title: "تم الحفظ", description: "تم تحديث إعدادات المتجر بنجاح" });
  };

  const handleSeedProducts = async () => {
    setIsSeeding(true);
    try {
      for (const product of STORE_PRODUCTS) {
        await addDoc(collection(db, "products"), {
          ...product,
          createdAt: new Date().toISOString(),
          status: 'active'
        });
      }
      toast({ title: "تمت التهيئة", description: "تم رفع المنتجات الافتراضية بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل رفع المنتجات" });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-3xl font-headline font-bold mb-1">إعدادات النظام الشاملة</h1>
        <p className="text-muted-foreground text-sm">التحكم في أسعار الصرف، تهيئة البيانات، وحالة المنصة.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 p-8">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="text-primary" /> الإعدادات المالية والعملات
            </CardTitle>
            <CardDescription>تعديل سعر صرف العملة المحلية (SDG) مقابل الدولار.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <Label className="font-bold">سعر صرف الدولار (SDG)</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  value={exchangeRate} 
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-none text-2xl font-black text-center" 
                />
                <span className="font-bold text-slate-400">SDG</span>
              </div>
            </div>
            <Button onClick={handleSave} className="h-14 w-full rounded-2xl bg-primary text-white font-bold gap-2 shadow-lg shadow-primary/20">
              <Save size={18} /> حفظ تحديث السعر
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle className="flex items-center gap-2">
              <Database className="text-primary" /> تهيئة البيانات (Setup)
            </CardTitle>
            <CardDescription className="text-slate-400">رفع المنتجات الافتراضية وإدارة قاعدة البيانات.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-muted-foreground mb-4">سيؤدي هذا الإجراء إلى رفع كافة باقات فري فاير وببجي المخزنة في النظام إلى Firestore.</p>
              <Button 
                onClick={handleSeedProducts} 
                disabled={isSeeding}
                variant="outline" 
                className="w-full h-12 rounded-xl border-primary text-primary font-bold hover:bg-primary/5"
              >
                {isSeeding ? "جاري الرفع..." : "رفع المنتجات الافتراضية"}
              </Button>
            </div>
            <Button variant="destructive" className="w-full h-12 rounded-xl font-bold gap-2">
              <Trash2 size={18} /> مسح الكاش المؤقت
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden lg:col-span-2">
          <CardHeader className="p-8 border-b">
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-primary" /> حماية النظام والوصول
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
              <div className="space-y-1 text-right">
                <Label className="font-bold text-lg">وضع الصيانة</Label>
                <p className="text-xs text-muted-foreground">إغلاق المتجر مؤقتاً لإجراء تحديثات.</p>
              </div>
              <Switch checked={isMaintenance} onCheckedChange={setIsMaintenance} />
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
              <div className="space-y-1 text-right">
                <Label className="font-bold text-lg">سوق التداول (P2P)</Label>
                <p className="text-xs text-muted-foreground">تفعيل أو تعطيل قسم تبادل المستخدمين.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
