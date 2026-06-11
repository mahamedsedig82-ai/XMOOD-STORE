"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import { STORE_PRODUCTS, AGENTS } from "@/app/lib/mock-data";
import { ShieldCheck, Zap, HeartHandshake, Smartphone, Send, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-body selection:bg-primary/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-48 text-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-6xl md:text-8xl font-headline font-bold mb-6 tracking-tight leading-tight">
            XMOOD STORE <br/> 
            <span className="text-primary drop-shadow-sm">فخامة العالم الرقمي</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            المنصة المتكاملة لشحن الألعاب، شراء الحسابات، الخدمات الرقمية، ونظام الوساطة الآمن. كل ما تحتاجه في مكان واحد فخم.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-24">
            <Link href="/store">
              <Button size="lg" className="h-14 px-10 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
                تصفح المتجر
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="h-14 px-10 border-primary text-primary font-bold rounded-full hover:bg-primary/5 transition-all">
                سوق المستخدمين
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: ShieldCheck, title: "وساطة آمنة", desc: "نظام ضمان وحماية متطور" },
              { icon: HeartHandshake, title: "وكلاء معتمدون", desc: "شبكة واسعة وموثوقة" },
              { icon: Zap, title: "تسليم فوري", desc: "عمليات شحن تلقائية" },
              { icon: Send, title: "دعم فني", desc: "مساعد ذكي وموظفون" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-primary/5 shadow-lg shadow-primary/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <item.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="container mx-auto px-4 py-24 border-t border-primary/5">
        <div className="flex justify-between items-end mb-16">
          <div className="text-right">
            <h2 className="text-4xl font-headline font-bold mb-3">خدمات مميزة</h2>
            <p className="text-muted-foreground text-lg">أفضل العروض والخدمات الرقمية المختارة لك بعناية</p>
          </div>
          <Link href="/store" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
            عرض الكل <ArrowRight size={20} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {STORE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Deposit System Section */}
      <section className="bg-[#FAF9F6] py-32 border-y border-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-headline font-bold mb-6 text-foreground">نظام شحن الرصيد</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              XMOOD STORE يعتمد نظام شحن المحفظة عبر الوكلاء المعتمدين لتوفير أعلى مستويات الأمان. تواصل مع وكيلك المفضل واشحن رصيدك فوراً.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="bg-white p-8 rounded-[2rem] border border-primary/10 flex items-center justify-between group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {agent.contactType === 'WhatsApp' ? <Smartphone size={32} /> : <Send size={32} />}
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-xl mb-1">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground font-medium">التوفر: {agent.availability}</p>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-8 h-12 shadow-lg shadow-primary/20">
                  تواصل الآن
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-10 flex flex-col items-center gap-2">
             <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2">
                <ShieldCheck size={32} strokeWidth={1.5} />
             </div>
             <span className="font-headline text-3xl font-bold tracking-tight text-primary">XMOOD STORE</span>
          </div>
          <p className="text-sm text-muted-foreground mb-12">© 2024 XMOOD STORE. الفخامة الرقمية في خدمتك.</p>
          <div className="flex justify-center gap-12 text-sm font-bold text-muted-foreground/60">
            <Link href="/terms" className="hover:text-primary transition-colors">الشروط</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">الخصوصية</Link>
            <Link href="/help" className="hover:text-primary transition-colors">المساعدة</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
