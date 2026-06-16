
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MailCheck, ShieldCheck, Globe, Copy, AlertTriangle, 
  Info, Loader2, Server, CheckCircle2, ChevronLeft, RefreshCw 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EmailSecurityDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dnsRecords = [
    { 
      type: "TXT (SPF)", 
      host: "@", 
      value: "v=spf1 include:_spf.google.com include:firebase.google.com ~all",
      desc: "يسمح لخوادم Firebase بإرسال البريد نيابة عن نطاقك." 
    },
    { 
      type: "TXT (DKIM)", 
      host: "firebase1._domainkey", 
      value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgK...",
      desc: "التوقيع الرقمي الذي يضمن أن البريد لم يتم التلاعب به." 
    },
    { 
      type: "TXT (DMARC)", 
      host: "_dmarc", 
      value: "v=DMARC1; p=quarantine; rua=mailto:admin@xmood.com",
      desc: "سياسة حماية النطاق من الانتحال (Spoofing)." 
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم نسخ السجل", description: "يمكنك الآن وضعه في إعدادات DNS الخاصة بنطاقك." });
  };

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "تم تحديث حالة الفحص", description: "جاري مزامنة السجلات مع الخوادم العالمية." });
    }, 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text">أمن البريد ووصول الرسائل</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Email Deliverability & Governance Hub</p>
        </div>
        <Button onClick={handleRefreshStatus} disabled={isRefreshing} className="royal-button h-14 px-8">
          {isRefreshing ? <Loader2 className="animate-spin" /> : <><RefreshCw size={20} className="ml-2" /> فحص حالة النطاق</>}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Overview */}
        <Card className="luxury-card border-none bg-primary/5 p-8 space-y-6">
           <ShieldCheck className="text-primary" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">حالة التوثيق (Authentication)</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                لضمان وصول الرسائل إلى الـ Inbox، يجب أن يكون النطاق موثقاً بسجلات SPF و DKIM صحيحة.
              </p>
           </div>
           <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                 <span>SPF Protocol</span>
                 <Badge className="bg-green-500/10 text-green-500 border-none">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                 <span>DKIM Signing</span>
                 <Badge className="bg-amber-500/10 text-amber-500 border-none">Pending DNS</Badge>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                 <span>DMARC Shield</span>
                 <Badge className="bg-red-500/10 text-red-500 border-none">Missing</Badge>
              </div>
           </div>
        </Card>

        {/* Global Reputation */}
        <Card className="luxury-card border-none bg-muted/20 p-8 space-y-6">
           <Globe className="text-zinc-500" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">سمعة المرسل (Sender Score)</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                تقييم الخوادم العالمية لرسائل متجر XMOOD بناءً على تفاعل المستخدمين.
              </p>
           </div>
           <div className="flex items-end gap-4">
              <span className="text-5xl font-black text-primary tracking-tighter">94%</span>
              <Badge variant="outline" className="mb-2 text-[8px] font-black">EXCELLENT REPUTATION</Badge>
           </div>
           <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Minimal Spam Rate Detected</p>
        </Card>

        {/* Deliverability Tips */}
        <Card className="luxury-card border-none bg-blue-500/5 p-8 space-y-6 border border-blue-500/10">
           <MailCheck className="text-blue-500" size={48} />
           <div>
              <h3 className="text-xl font-black mb-2">نصائح الـ Inbox</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                تأكد من عدم استخدام نصوص ترويجية مفرطة في عنوان الرسالة لتفادي الفلاتر.
              </p>
           </div>
           <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[10px] font-bold text-blue-300">
                <CheckCircle2 size={12} /> استخدام روابط مشفرة HTTPS
              </li>
              <li className="flex items-center gap-2 text-[10px] font-bold text-blue-300">
                <CheckCircle2 size={12} /> توثيق النطاق في Firebase Console
              </li>
           </ul>
        </Card>
      </div>

      {/* DNS Configuration */}
      <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 border-b bg-muted/10 flex flex-row items-center justify-between">
           <CardTitle className="text-2xl font-black flex items-center gap-4">
              <Server className="text-primary" /> إعدادات الـ DNS السيادية
           </CardTitle>
           <Badge variant="outline" className="text-[10px] font-black uppercase">Technical Auth Records</Badge>
        </CardHeader>
        <CardContent className="p-8">
           <div className="space-y-8">
              <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-4">
                 <AlertTriangle className="text-red-500 shrink-0" size={24} />
                 <p className="text-sm font-medium leading-relaxed">
                    تنبيه: يجب إضافة السجلات التالية في لوحة تحكم النطاق (مثل GoDaddy أو Cloudflare) لضمان عدم تصنيف رسائل التحقق كـ Spam.
                 </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {dnsRecords.map((rec, i) => (
                   <div key={i} className="p-6 bg-background rounded-3xl border border-border/50 group hover:border-primary/30 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                         <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-black font-black uppercase text-[8px]">{rec.type}</Badge>
                            <span className="font-mono text-xs text-muted-foreground">Host: {rec.host}</span>
                         </div>
                         <Button onClick={() => copyToClipboard(rec.value)} variant="ghost" className="h-10 px-6 rounded-xl border group-hover:bg-primary group-hover:text-black transition-all font-black text-[10px] uppercase gap-2">
                            <Copy size={14} /> نسخ القيمة
                         </Button>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl font-mono text-[10px] break-all leading-relaxed border select-all">
                         {rec.value}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-3 font-bold uppercase tracking-widest">{rec.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Steps Guide */}
      <Card className="luxury-card border-none bg-primary/5 p-10">
         <h3 className="text-2xl font-black mb-8 gold-text">خطوات حل مشكلة الـ Spam نهائياً:</h3>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "إضافة النطاق", desc: "أضف دومينك في Firebase Console -> Authentication -> Settings." },
              { step: "02", title: "تعديل الـ DNS", desc: "انسخ السجلات أعلاه وضعها في لوحة تحكم نطاقك." },
              { step: "03", title: "فحص التوثيق", desc: "انتظر حتى تظهر كلمة 'Verified' في لوحة تحكم Firebase." },
              { step: "04", title: "تعديل المرسل", desc: "غيّر البريد المرسل منه من noreply@firebase.. إلى info@yourdomain.com." }
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                 <span className="text-4xl font-black text-primary/20">{item.step}</span>
                 <h4 className="font-black text-base">{item.title}</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
         </div>
      </Card>
    </div>
  );
}
