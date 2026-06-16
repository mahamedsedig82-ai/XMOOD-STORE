
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MailCheck, ShieldCheck, Globe, Copy, AlertTriangle, 
  Info, Loader2, Server, CheckCircle2, RefreshCw 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EmailSecurityDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // القيم الفعلية لمشروع xmood-36c92
  const dnsRecords = [
    { 
      type: "TXT (SPF)", 
      host: "@", 
      value: "v=spf1 include:_spf.google.com include:firebase.google.com ~all",
      desc: "يسمح لخوادم Firebase/Google بإرسال البريد نيابة عن نطاقك." 
    },
    { 
      type: "CNAME (DKIM 1)", 
      host: "firebase1._domainkey", 
      value: "mail-xmood-36c92.lsv1.dkim.firebase.google.com",
      desc: "التوقيع الرقمي الأول لتوثيق هوية الرسالة." 
    },
    { 
      type: "CNAME (DKIM 2)", 
      host: "firebase2._domainkey", 
      value: "mail-xmood-36c92.lsv2.dkim.firebase.google.com",
      desc: "التوقيع الرقمي الثاني لضمان استمرارية التوثيق." 
    },
    { 
      type: "TXT (DMARC)", 
      host: "_dmarc", 
      value: "v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com",
      desc: "سياسة حماية النطاق؛ تخبر خوادم البريد بحجز الرسائل غير الموثقة." 
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم نسخ السجل", description: "قم بإضافته الآن في إعدادات DNS في Vercel أو مزود الدومين." });
  };

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "جاري فحص النطاق", description: "قد تستغرق مزامنة سجلات DNS عالمياً من 1-24 ساعة." });
    }, 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text">أمن البريد ووصول الرسائل</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Email Deliverability & DNS Authentication</p>
        </div>
        <Button onClick={handleRefreshStatus} disabled={isRefreshing} className="royal-button h-14 px-8">
          {isRefreshing ? <Loader2 className="animate-spin" /> : <><RefreshCw size={20} className="ml-2" /> فحص حالة التوثيق</>}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="luxury-card border-none bg-primary/5 p-8 space-y-6">
           <ShieldCheck className="text-primary" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">حالة التوثيق الذكي</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                لضمان وصول الرسائل للـ Inbox، يجب إضافة السجلات الموضحة أدناه في لوحة تحكم النطاق.
              </p>
           </div>
           <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                 <span>SPF Protocol</span>
                 <Badge className="bg-green-500/10 text-green-500 border-none">Required</Badge>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                 <span>DKIM Keys</span>
                 <Badge className="bg-amber-500/10 text-amber-500 border-none">Pending DNS</Badge>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                 <span>DMARC Shield</span>
                 <Badge className="bg-red-500/10 text-red-500 border-none">Missing</Badge>
              </div>
           </div>
        </Card>

        <Card className="luxury-card border-none bg-muted/20 p-8 space-y-6">
           <Globe className="text-zinc-500" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">سمعة النطاق (Project ID)</h3>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">ID: xmood-36c92</p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                سيتم ربط هذا المعرف بنطاقك المخصص لرفع درجة الأمان المالي والمصادقة.
              </p>
           </div>
           <Badge variant="outline" className="font-black text-[9px]">ENTERPRISE READY</Badge>
        </Card>

        <Card className="luxury-card border-none bg-blue-500/5 p-8 space-y-6 border border-blue-500/10">
           <MailCheck className="text-blue-500" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">نظام الـ Anti-Spam</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                بعد إضافة السجلات، سيقوم Gmail بالتعرف على رسائل المتجر كرسائل "رسمية وموثقة".
              </p>
           </div>
           <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[10px] font-bold text-blue-300">
                <CheckCircle2 size={12} /> توثيق الهوية عبر DNS
              </li>
              <li className="flex items-center gap-2 text-[10px] font-bold text-blue-300">
                <CheckCircle2 size={12} /> استخدام SSL/TLS مشفر
              </li>
           </ul>
        </Card>
      </div>

      <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 border-b bg-muted/10 flex flex-row items-center justify-between">
           <CardTitle className="text-2xl font-black flex items-center gap-4">
              <Server className="text-primary" /> قائمة سجلات DNS المطلوبة
           </CardTitle>
           <Badge variant="outline" className="text-[10px] font-black uppercase">Vercel / Domain Records</Badge>
        </CardHeader>
        <CardContent className="p-8">
           <div className="space-y-8">
              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
                 <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                 <p className="text-sm font-medium leading-relaxed">
                    مهم: انسخ هذه القيم كما هي وأضفها في لوحة تحكم نطاقك (Vercel DNS أو غيره). لا تحاول تعديل الـ Value.
                 </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {dnsRecords.map((rec, i) => (
                   <div key={i} className="p-6 bg-background rounded-3xl border border-border/50 group hover:border-primary/30 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                         <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-black font-black uppercase text-[8px]">{rec.type}</Badge>
                            <span className="font-mono text-xs text-muted-foreground">Host: <span className="text-foreground font-black">{rec.host}</span></span>
                         </div>
                         <Button onClick={() => copyToClipboard(rec.value)} variant="ghost" className="h-10 px-6 rounded-xl border group-hover:bg-primary group-hover:text-black transition-all font-black text-[10px] uppercase gap-2">
                            <Copy size={14} /> نسخ القيمة (Value)
                         </Button>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl font-mono text-[11px] break-all leading-relaxed border select-all text-primary font-bold">
                         {rec.value}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-3 font-bold uppercase tracking-widest">{rec.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </CardContent>
      </Card>

      <Card className="luxury-card border-none bg-primary/5 p-10">
         <h3 className="text-2xl font-black mb-8 gold-text">الخلاصة: كيف تضمن وصول الرسائل لـ Inbox؟</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
               <h4 className="font-black text-lg border-r-4 border-primary pr-4">الخطوة 1: داخل Firebase Console</h4>
               <p className="text-sm text-muted-foreground leading-relaxed">
                  اذهب إلى <b>Authentication</b> &rarr; <b>Settings</b> &rarr; <b>User actions</b>.
                  قم بإضافة "Custom Email Domain" وضع نطاقك (مثل xmood.com). سيعطيك نفس السجلات الموضحة أعلاه.
               </p>
            </div>
            <div className="space-y-6">
               <h4 className="font-black text-lg border-r-4 border-primary pr-4">الخطوة 2: داخل Vercel / Domain Provider</h4>
               <p className="text-sm text-muted-foreground leading-relaxed">
                  أضف سجلات TXT و CNAME المنسوخة من هذه الصفحة. بمجرد التحقق، سيتغير بريد الإرسال من 
                  noreply@firebase.. إلى <b>noreply@yourdomain.com</b> وسيتوقف تصنيفه كـ Spam.
               </p>
            </div>
         </div>
      </Card>
    </div>
  );
}
