import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import { STORE_PRODUCTS, AGENTS } from "@/app/lib/mock-data";
import { ShieldCheck, Zap, HeartHandshake, Smartphone, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderById } from "@/lib/placeholder-images";

export default function Home() {
  const heroImg = getPlaceholderById('hero-luxury');

  return (
    <main className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImg.imageUrl} 
            alt={heroImg.description}
            fill
            className="object-cover opacity-20"
            priority
            data-ai-hint={heroImg.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-6 py-2 px-4 text-xs font-bold tracking-[0.2em] bg-primary/10 text-primary border-primary/20">
            DIGITAL EXCELLENCE
          </Badge>
          <h1 className="text-6xl md:text-8xl font-headline font-bold mb-6 tracking-tight leading-none">
            إكسيجو <br/> <span className="text-primary">فخامة العالم الرقمي</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            المنصة المتكاملة لشحن الألعاب، شراء الحسابات، الخدمات الرقمية، ونظام الوساطة الآمن. كل ما تحتاجه في مكان واحد فخم.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/store">
              <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
                تصفح المتجر
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="h-14 px-8 border-primary text-primary font-bold rounded-full hover:bg-primary/5">
                سوق المستخدمين
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Features */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, label: "وساطة آمنة", desc: "نظام ضمان وحماية متقدم" },
            { icon: Zap, label: "تسليم فوري", desc: "خدمات شحن تلقائية وسريعة" },
            { icon: HeartHandshake, label: "وكلاء معتمدون", desc: "طرق دفع سهلة وموثوقة" },
            { icon: Send, label: "دعم فني", desc: "مساعد ذكي وموظفون حقيقيون" },
          ].map((feat, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
              <feat.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-1">{feat.label}</h3>
              <p className="text-sm text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-headline font-bold mb-2">خدمات مميزة</h2>
            <p className="text-muted-foreground">أفضل العروض والخدمات الرقمية المختارة لك بعناية</p>
          </div>
          <Link href="/store" className="text-primary font-bold hover:underline">عرض الكل ←</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {STORE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Agents Section */}
      <section className="bg-primary/5 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-headline font-bold mb-4">نظام شحن الرصيد</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              لا يوجد دفع مباشر داخل الموقع. يرجى التواصل مع أحد وكلائنا المعتمدين خارج الموقع (واتساب/تليجرام) لشحن محفظتك، ثم يمكنك الشراء مباشرة من المنصة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between border-2 border-transparent hover:border-primary transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                    {agent.contactType === 'WhatsApp' ? <Smartphone className="text-green-600" /> : <Send className="text-blue-500" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground">متواجد: {agent.availability}</p>
                  </div>
                </div>
                <Button className="font-bold bg-primary text-white">تواصل الآن</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center items-center gap-2">
             <ShieldCheck className="w-8 h-8 text-primary" />
             <span className="font-headline text-2xl font-bold tracking-tighter text-primary">EXIGO</span>
          </div>
          <p className="text-muted-foreground mb-8">&copy; 2024 إكسيجو ماركت بليس - جميع الحقوق محفوظة.</p>
          <div className="flex justify-center space-x-6 rtl:space-x-reverse">
            <Link href="/terms" className="text-sm hover:text-primary transition-colors">الشروط والأحكام</Link>
            <Link href="/privacy" className="text-sm hover:text-primary transition-colors">سياسة الخصوصية</Link>
            <Link href="/help" className="text-sm hover:text-primary transition-colors">مركز المساعدة</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
