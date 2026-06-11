"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import { STORE_PRODUCTS, AGENTS } from "@/app/lib/mock-data";
import { ShieldCheck, Zap, HeartHandshake, Smartphone, Send, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Clean White Design */}
      <section className="relative pt-20 pb-32 border-b">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-8 py-1.5 px-4 text-xs font-bold tracking-[0.2em] border-primary/30 text-primary uppercase">
            Exigo Digital Marketplace
          </Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-8 tracking-tight leading-tight text-foreground">
            إكسيجو <br/> <span className="text-primary">الوجهة الأولى للخدمات الرقمية</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            منصة احترافية متكاملة لشحن الألعاب، شراء الحسابات، والخدمات الرقمية الآمنة. نجمع بين الفخامة والأمان في كل عملية.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/store">
              <Button size="lg" className="h-12 px-10 bg-primary text-white font-bold rounded-full hover:bg-primary/90 shadow-md">
                تصفح المتجر
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="h-12 px-10 border-primary text-primary font-bold rounded-full hover:bg-primary/5">
                سوق المستخدمين
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, title: "وساطة آمنة", desc: "نظام حماية متطور لضمان حقوقك" },
            { icon: Zap, title: "تسليم فوري", desc: "عمليات شحن تلقائية وسريعة جداً" },
            { icon: HeartHandshake, title: "وكلاء معتمدون", desc: "شبكة واسعة من الوكلاء الموثوقين" },
            { icon: Send, title: "دعم فني", desc: "فريق دعم متواجد لخدمتكم دائماً" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center text-center group hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                <item.icon size={24} />
              </div>
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div className="text-right">
            <h2 className="text-3xl font-headline font-bold mb-2 text-foreground">المنتجات الأكثر طلباً</h2>
            <p className="text-muted-foreground">مجموعة مختارة من أفضل الخدمات المتاحة حالياً</p>
          </div>
          <Link href="/store" className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
            عرض الكل <ArrowRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {STORE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Agents / Wallet Info Section */}
      <section className="bg-muted/30 py-24 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-headline font-bold mb-4">كيفية شحن محفظتك؟</h2>
            <p className="text-muted-foreground leading-relaxed">
              إكسيجو ماركت بليس يعتمد نظام شحن المحفظة عبر الوكلاء المعتمدين لتوفير أعلى مستويات الأمان وسهولة الدفع في المنطقة. تواصل مع وكيلك المفضل واشحن رصيدك فوراً.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="bg-white p-6 rounded-xl border flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-primary">
                    {agent.contactType === 'WhatsApp' ? <Smartphone size={24} /> : <Send size={24} />}
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold">{agent.name}</h4>
                    <p className="text-xs text-muted-foreground">التوفر: {agent.availability}</p>
                  </div>
                </div>
                <Button variant="secondary" className="font-bold text-xs rounded-full px-6">
                  تواصل الآن
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center items-center gap-2 opacity-80">
             <ShieldCheck className="w-6 h-6 text-primary" />
             <span className="font-headline text-xl font-bold tracking-tight text-primary">EXIGO</span>
          </div>
          <p className="text-xs text-muted-foreground mb-8">© 2024 إكسيجو ماركت بليس. جميع الحقوق محفوظة.</p>
          <div className="flex justify-center gap-8 text-xs font-medium text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">الشروط</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">الخصوصية</Link>
            <Link href="/help" className="hover:text-primary transition-colors">المساعدة</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}