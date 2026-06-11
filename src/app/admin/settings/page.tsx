
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Globe, DollarSign, Bell, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const [exchangeRate, setExchangeRate] = useState("5400");
  const [isMaintenance, setIsMaintenance] = useState(false);

  const handleSave = () => {
    toast({ title: "تم الحفظ", description: "تم تحديث إعدادات المتجر بنجاح" });
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-3xl font-headline font-bold mb-1">إعدادات النظام</h1>
        <p className="text-muted-foreground text-sm">التحكم في أسعار الصرف، حالة المتجر، والسياسات العامة.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 p-8">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="text-primary" /> الإعدادات المالية
            </CardTitle>
            <CardDescription>تعديل سعر صرف العملة المحلية مقابل الدولار.</CardDescription>
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
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">تحديث سعر الصرف سيغير الأسعار المعروضة فوراً للعملاء</p>
            </div>
            <Button onClick={handleSave} className="h-14 w-full rounded-2xl bg-primary text-white font-bold gap-2">
              <Save size={18} /> حفظ التعديلات
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-primary" /> حماية النظام
            </CardTitle>
            <CardDescription className="text-slate-400">التحكم في وصول المستخدمين وحالة المنصة.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="space-y-1 text-right">
                <Label className="font-bold">وضع الصيانة</Label>
                <p className="text-xs text-muted-foreground">إغلاق المتجر مؤقتاً لإجراء تحديثات فنية.</p>
              </div>
              <Switch checked={isMaintenance} onCheckedChange={setIsMaintenance} />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="space-y-1 text-right">
                <Label className="font-bold">تفعيل التسجيل الجديد</Label>
                <p className="text-xs text-muted-foreground">السماح للمستخدمين الجدد بإنشاء حسابات.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="space-y-1 text-right">
                <Label className="font-bold">التحقق بخطوتين</Label>
                <p className="text-xs text-muted-foreground">إلزام المديرين باستخدام رمز التحقق الأمني.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
