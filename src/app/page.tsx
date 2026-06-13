"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Trophy, Cpu, Heart, Sparkles, ArrowRight, 
  Zap, Instagram, Mail, Phone, MessageSquare, Palette, 
  Facebook, Youtube, Video, Globe, Award, CheckCircle,
  Store
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function HomeProfessional() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  return (
    <main className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />
      
      {/* Modern Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none dark:opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center animate-fade-in">
          <Badge className="mb-8 py-2 px-6 bg-primary/5 text-primary border-primary/20 rounded-full font-bold text-[10px] tracking-wide uppercase">
            {config?.siteInfo?.subtitle || "منصة متكاملة للخدمات الرقمية والتقنية الموثوقة"}
          </Badge>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl mb-8 font-headline font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
             عالمك الرقمي <span className="gold-text">بلمسة احترافية</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            {config?.siteInfo?.heroDescription || "نقدم باقات شحن ألعاب، حسابات مميزة، وخدمات إبداعية تضمن لك الجودة والسرعة والأمان التام."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Button asChild className="royal-button h-14 px-10 text-base">
              <Link href="/store"><Store className="ml-2" size={18} /> تصفح المتجر</Link>
            </Button>
            <Button asChild className="accent-button h-14 px-10 text-base">
              <Link href="/designs/gallery"><Palette className="ml-2" size={18} /> معرض الأعمال</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "حماية البيانات", desc: "أنظمة تشفير متطورة تضمن خصوصية تعاملاتك الرقمية.", color: "text-blue-500" },
              { icon: Award, title: "جودة مضمونة", desc: "خدمات مختارة بعناية تلبي أعلى معايير الاحترافية.", color: "text-amber-500" },
              { icon: Zap, title: "تنفيذ سريع", desc: "نظام آلي وبشري يضمن تسليم طلباتك في وقت قياسي.", color: "text-red-500" },
              { icon: CheckCircle, title: "وكلاء معتمدون", desc: "نخبة من الوكلاء الموثوقين لضمان حقوقك في كل صفقة.", color: "text-green-500" },
            ].map((item, i) => (
              <Card key={i} className="luxury-card p-8 border-none group hover:-translate-y-2 transition-all">
                <div className={`w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ${item.color} mb-6 transition-colors group-hover:bg-primary group-hover:text-white`}>
                  <item.icon size={28} />
                </div>
                <h4 className="font-bold text-xl text-zinc-900 dark:text-white mb-3">{item.title}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white dark:bg-background border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="decorative-logo text-4xl mb-8">{config?.siteInfo?.title || "XMOOD"}</div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-10 text-base leading-relaxed">
            {config?.siteInfo?.description || "الوجهة الأولى والموثوقة للخدمات الرقمية في المنطقة، نسعى دائماً لتقديم حلول مبتكرة وبسيطة لعملائنا."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-12">
             {config?.contact?.whatsapp && (
               <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-primary transition-all font-bold text-sm">
                  <MessageSquare size={16} className="text-green-500" /> دعم العملاء (WhatsApp)
               </a>
             )}
             {config?.contact?.email && (
               <a href={`mailto:${config.contact.email}`} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-primary transition-all font-bold text-sm">
                  <Mail size={16} className="text-red-500" /> المراسلة الرسمية
               </a>
             )}
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <Link href="/marketplace" className="hover:text-primary transition-all">المجتمع الرقمي</Link>
            <Link href="/designs/gallery" className="hover:text-primary transition-all">معرض الأعمال</Link>
            <Link href="/middleman" className="hover:text-primary transition-all">الوكلاء المعتمدون</Link>
            <Link href="/admin" className="hover:text-primary transition-all">لوحة الإدارة</Link>
          </div>
          
          <div className="mt-16 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {config?.siteInfo?.copyright || "© 2025 XMOOD DIGITAL SERVICES. ALL RIGHTS RESERVED."}
          </div>
        </div>
      </footer>
    </main>
  );
}
