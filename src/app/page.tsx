"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import { STORE_PRODUCTS, AGENTS } from "@/app/lib/mock-data";
import { ShieldCheck, Zap, HeartHandshake, Smartphone, Send, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-body selection:bg-primary/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 text-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center mb-8">
            <Badge variant="outline" className="py-2 px-6 text-xs font-bold tracking-[0.3em] bg-primary/5 text-primary border-primary/20 rounded-full animate-fade-in uppercase">
              Digital Excellence & Luxury
            </Badge>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-bold mb-8 tracking-tighter leading-[1.1]">
            XMOOD STORE <br/> 
            <span className="text-primary drop-shadow-sm">فخامة العالم الرقمي</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-14 leading-relaxed font-light px-4">
            ارتقِ بتجربتك مع المنصة الرائدة في خدمات شحن الألعاب، اقتناء الحسابات النادرة، والحلول الرقمية المبتكرة بنظام وساطة يضمن لك الأمان المطلق.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-28">
            <Link href="/store">
              <Button size="lg" className="h-16 px-12 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-primary/30 text-lg">
                اكتشف المتجر
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="h-16 px-12 border-primary text-primary font-bold rounded-2xl hover:bg-primary/5 transition-all text-lg">
                سوق المستخدمين
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: ShieldCheck, title: "وساطة آمنة", desc: "نظام ضمان وحماية متطور يضمن حق البائع والمشتري." },
              { icon: HeartHandshake, title: "وكلاء معتمدون", desc: "شبكة واسعة من الوكلاء الموثوقين لتسهيل عملياتك المالية." },
              { icon: Zap, title: "تنفيذ ذكي", desc: "عمليات شحن تلقائية وتوصيل فوري للخدمات الرقمية." },
              { icon: Send, title: "دعم متميز", desc: "فريق دعم متخصص ومساعد ذكي متاح على مدار الساعة." },
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-primary/5 flex flex-col items-center text-center group hover:-translate-y-3 transition-all duration-500">
                <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <item.icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-foreground">{item.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="container mx-auto px-4 py-32 border-t border-primary/5">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-20 gap-8">
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-primary">
              <Star size={18} fill="currentColor" />
              <span className="text-sm font-bold tracking-widest uppercase">Premium Selection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">خدمات مختارة بعناية</h2>
            <p className="text-muted-foreground text-lg max-w-xl">نقدم لك نخبة من المنتجات الرقمية والحسابات الحصرية التي تلبي تطلعاتك كلاعب محترف.</p>
          </div>
          <Link href="/store">
            <Button variant="ghost" className="text-primary font-bold text-lg group gap-3 hover:bg-primary/5 px-6 rounded-xl">
              عرض كافة الخدمات <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {STORE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Deposit System Section */}
      <section className="bg-[#FAF9F6] py-32 border-y border-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-8 text-foreground">المنظومة المالية الآمنة</h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-light">
              في XMOOD STORE، نضع أمانك المالي كأولوية قصوى. نعتمد نظام شحن المحفظة عبر الوكلاء المعتمدين لتوفير تجربة خالية من المخاطر وبعيدة عن التعقيدات التقنية التقليدية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="bg-white p-10 rounded-[3rem] border border-primary/10 flex flex-col sm:flex-row items-center justify-between group hover:shadow-3xl hover:shadow-primary/5 transition-all duration-500 gap-8">
                <div className="flex items-center gap-8 text-center sm:text-right">
                  <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-all shadow-inner">
                    {agent.contactType === 'WhatsApp' ? <Smartphone size={40} /> : <Send size={40} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl mb-2 text-foreground">{agent.name}</h4>
                    <p className="text-sm text-primary font-bold uppercase tracking-widest mb-1">{agent.contactType}</p>
                    <p className="text-sm text-muted-foreground">متاح: {agent.availability}</p>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl px-10 h-16 shadow-xl shadow-primary/20 text-lg w-full sm:w-auto">
                  تواصل مع الوكيل
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-14 flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-2 shadow-inner">
                <ShieldCheck size={40} strokeWidth={1.5} />
             </div>
             <span className="font-headline text-4xl font-bold tracking-tight text-primary">XMOOD STORE</span>
             <p className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase">The Pinnacle of Digital Luxury</p>
          </div>
          <p className="text-base text-muted-foreground mb-16 max-w-md mx-auto leading-relaxed">حقوق النشر © 2024 XMOOD STORE. نلتزم بتقديم أرقى الخدمات الرقمية بمعايير عالمية.</p>
          <div className="flex justify-center gap-16 text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-primary transition-colors">الشروط</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">الخصوصية</Link>
            <Link href="/help" className="hover:text-primary transition-colors">المساعدة</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
