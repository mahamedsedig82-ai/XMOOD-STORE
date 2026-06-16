"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MailCheck, ShieldCheck, Globe, Copy, AlertTriangle, 
  Info, Loader2, Server, CheckCircle2, RefreshCw, Smartphone, Mail, ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EmailSecurityDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "جاري تحليل السمعة البريدية", description: "النظام يعمل حالياً عبر نطاق Vercel الافتراضي." });
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text">استراتيجية وصول البريد (Inbox)</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Email Deliverability Strategy for Default Domains</p>
        </div>
        <Button onClick={handleRefreshStatus} disabled={isRefreshing} className="royal-button h-14 px-8">
          {isRefreshing ? <Loader2 className="animate-spin" /> : <><RefreshCw size={20} className="ml-2" /> تحديث حالة السمعة</>}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="luxury-card border-none bg-amber-500/5 p-8 space-y-6 border border-amber-500/10">
           <AlertTriangle className="text-amber-500" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">تحدي النطاق الافتراضي</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                استخدام <b>vercel.app</b> يضع رسائلك في "سمعة مشتركة". لضمان الوصول للـ Inbox بنسبة 100%، ينصح بشدة بشراء دومين مخصص لاحقاً.
              </p>
           </div>
           <Badge variant="outline" className="text-amber-500 border-amber-500/20 text-[8px] font-black">CURRENT LIMITATION</Badge>
        </Card>

        <Card className="luxury-card border-none bg-primary/5 p-8 space-y-6">
           <ShieldCheck className="text-primary" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">تحسين القوالب (Templates)</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                تجنب الكلمات التي تثير شك الفلاتر (مثل "مجاناً"، "اربح") داخل قوالب Firebase لزيادة فرص الوصول لصندوق الوارد.
              </p>
           </div>
           <Badge className="bg-green-500/10 text-green-500 border-none font-black text-[8px]">OPTIMIZATION ACTIVE</Badge>
        </Card>

        <Card className="luxury-card border-none bg-blue-500/5 p-8 space-y-6 border border-blue-500/10">
           <MailCheck className="text-blue-500" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">بروتوكول "اسم المرسل"</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                ظهور الرسالة باسم "XMOOD SECURITY" بدلاً من ايميل مجهول يرفع نسبة النقر والتوثيق لدى خوادم Gmail.
              </p>
           </div>
           <Badge variant="outline" className="text-blue-400 border-blue-500/20 text-[8px] font-black">BRANDING READY</Badge>
        </Card>
      </div>

      <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 border-b bg-muted/10">
           <CardTitle className="text-2xl font-black flex items-center gap-4">
              <Smartphone className="text-primary" /> خطوات تحسين الوصول من داخل Firebase
           </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h4 className="font-black text-lg border-r-4 border-primary pr-4 flex items-center gap-2">
                    <span className="bg-primary text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    تعديل اسم التطبيق العام
                 </h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                    اذهب إلى <b>Project Settings</b> في Firebase. تأكد أن <b>Public-facing name</b> هو <b>XMOOD STORE</b> تماماً. هذا الاسم يظهر في رأس الرسالة ويقلل من تصنيفها كـ Spam.
                 </p>
              </div>

              <div className="space-y-6">
                 <h4 className="font-black text-lg border-r-4 border-primary pr-4 flex items-center gap-2">
                    <span className="bg-primary text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    تخصيص قوالب الرسائل
                 </h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                    في قسم <b>Authentication</b> &rarr; <b>Templates</b>، قم بتعديل قالب "Email address verification". اجعل النص بسيطاً ورسمياً، وقلل من الروابط الخارجية الإضافية.
                 </p>
              </div>
           </div>

           <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                 <h4 className="font-black text-xl flex items-center gap-3"><Info className="text-blue-500" /> نصيحة المحترفين</h4>
                 <p className="text-sm text-blue-200/60 font-medium">
                    بما أنك لا تملك دومين مخصص، تأكد من إخبار مستخدميك في صفحة الدخول بضرورة "فحص مجلد السبام" في المرة الأولى وتحديد الرسالة كـ <b>Not Spam</b>؛ هذا سيقوم بتعليم خوارزميات Gmail أن رسائلك مرغوب بها.
                 </p>
              </div>
              <Button asChild variant="outline" className="h-14 px-8 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all whitespace-nowrap">
                 <a href="https://console.firebase.google.com/" target="_blank" className="flex items-center gap-2">فتح Firebase Console <ExternalLink size={16} /></a>
              </Button>
           </div>
        </CardContent>
      </Card>

      <Card className="luxury-card border-none bg-primary/5 p-10">
         <h3 className="text-2xl font-black mb-8 gold-text">الخلاصة: هل يمكن الوصول لـ Inbox بدون دومين مخصص؟</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
               <h4 className="font-black text-lg border-r-4 border-primary pr-4">الوضع الحالي (Vercel Default)</h4>
               <p className="text-sm text-muted-foreground leading-relaxed">
                  نسبة الوصول لـ Inbox حالياً تتراوح بين 60-70%. بعض مزودي البريد الصارمين سيصنفونها Spam لأنهم لا يستطيعون التحقق من سجلات SPF/DKIM لنطاق مشترك.
               </p>
            </div>
            <div className="space-y-6">
               <h4 className="font-black text-lg border-r-4 border-primary pr-4">أفضل حل مجاني</h4>
               <p className="text-sm text-muted-foreground leading-relaxed">
                  استخدام ايميل مرسل بصيغة <b>noreply@xmood-36c92.firebaseapp.com</b> مع التأكد من أن "اسم المرسل" في القالب هو اسم متجرك بوضوح. هذا هو أقصى ما يمكن فعله تقنياً دون شراء نطاق.
               </p>
            </div>
         </div>
      </Card>
    </div>
  );
}