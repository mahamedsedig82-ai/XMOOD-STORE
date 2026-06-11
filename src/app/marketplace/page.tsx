
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { STORE_PRODUCTS, MARKETPLACE_PRODUCTS } from "@/app/lib/mock-data";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, ShoppingBag, Coins, ArrowLeftRight, UserCheck, ShieldCheck, Zap, TrendingUp, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD, formatSDG } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredP2P = MARKETPLACE_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      
      {/* Hero Section Professional */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pro" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pro)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
           <div className="max-w-3xl">
              <Badge className="mb-6 bg-primary text-white border-none py-2 px-6 rounded-full font-bold tracking-widest animate-fade-in uppercase">
                 Verified P2P Marketplace
              </Badge>
              <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 leading-tight animate-fade-in">سوق التداول الاحترافي</h1>
              <p className="text-xl text-slate-400 leading-relaxed font-light animate-fade-in">المنصة الآمنة الأولى لتبادل الحسابات النادرة والعملات الرقمية بين المستخدمين بنظام الضمان الذكي.</p>
           </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <Tabs defaultValue="market" className="space-y-12">
          <TabsList className="bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] h-24 shadow-2xl border flex gap-3 w-fit mx-auto lg:mx-0 luxury-shadow">
            <TabsTrigger value="market" className="rounded-2xl px-12 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">سوق الحسابات</TabsTrigger>
            <TabsTrigger value="exchange" className="rounded-2xl px-12 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">تبادل العملات</TabsTrigger>
            <TabsTrigger value="escrow" className="rounded-2xl px-12 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">نظام الضمان</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-10 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-6 mb-4">
              <div className="relative flex-1">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                <Input 
                  placeholder="ابحث عن حساب فري فاير قديم، شدات، أو خدمات نادرة..." 
                  className="pr-16 h-16 rounded-[2rem] bg-white border-none shadow-xl text-lg luxury-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="h-16 rounded-[2rem] bg-slate-900 text-white font-bold px-12 shadow-2xl hover:bg-primary transition-all">
                أضف عرضك للبيع
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredP2P.map((product) => (
                <div key={product.id} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <ProductCard product={product} />
                  <div className="absolute top-6 left-6 z-30">
                     <Badge className="bg-white/90 backdrop-blur text-primary border-none shadow-sm flex gap-1 items-center px-3 py-1 rounded-full text-[10px] font-black">
                        <BadgeCheck size={14} /> موثوق P2P
                     </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exchange" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden luxury-shadow">
                  <CardHeader className="bg-slate-50 p-10 border-b">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                      <ArrowLeftRight className="text-primary" /> منصة تحويل الأرصدة الفورية
                    </CardTitle>
                    <p className="text-muted-foreground">تحويل رصيد المحفظة بين العملات الصعبة والمحلية بأسعار اللحظة.</p>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">من رصيد (USD)</label>
                        <div className="relative">
                          <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-primary" />
                          <Input type="number" placeholder="100.00" className="h-20 rounded-[2rem] bg-slate-50 border-none text-3xl font-black text-center pr-14" />
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-90 lg:rotate-0">
                           <ArrowLeftRight size={24} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">إلى رصيد (SDG)</label>
                        <Input readOnly placeholder="540,000" className="h-20 rounded-[2rem] bg-slate-50 border-none text-3xl font-black text-center text-primary" />
                      </div>
                    </div>
                    <Button className="w-full h-20 rounded-[2rem] bg-slate-900 text-white font-bold text-xl hover:bg-primary shadow-2xl transition-all">
                      تأكيد عملية التبادل والتحويل للمحفظة
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="border-none shadow-xl rounded-[2rem] p-8 bg-white flex items-center justify-between luxury-shadow">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">سعر الشراء الحالي</p>
                        <p className="text-2xl font-black text-slate-900">1 USD = 5400 SDG</p>
                      </div>
                      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <TrendingUp size={28} />
                      </div>
                   </Card>
                   <Card className="border-none shadow-xl rounded-[2rem] p-8 bg-white flex items-center justify-between luxury-shadow">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">سعر البيع الحالي</p>
                        <p className="text-2xl font-black text-slate-900">1 USD = 5450 SDG</p>
                      </div>
                      <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                        <Coins size={28} />
                      </div>
                   </Card>
                </div>
              </div>

              <div className="space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden p-10 relative luxury-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">نظام الضمان XMOOD</h3>
                  <p className="text-lg text-slate-400 leading-relaxed mb-8">
                    نقوم بحجز مبالغ التداول في "الخزينة المؤمنة" لضمان حق المشتري والبائع. لا يتم تحرير المال إلا بعد تأكيد الاستلام الفني.
                  </p>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-14 rounded-2xl font-bold">
                    سياسة الضمان المالي
                  </Button>
                </Card>
                
                <Card className="border-none shadow-xl rounded-[3rem] bg-white p-10 luxury-shadow">
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                     <History size={20} className="text-primary" /> صفقات حية
                   </h3>
                   <div className="space-y-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <UserCheck size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black">تحويل عملة</span>
                                <span className="text-[10px] text-muted-foreground">منذ 5 دقائق</span>
                              </div>
                           </div>
                           <span className="text-sm font-black text-primary">$150.00</span>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="escrow" className="animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { icon: UserCheck, title: "توثيق الطرفين", desc: "نتأكد من هوية البائع والمشتري ومطابقة العروض المقدمة للمعايير الفنية." },
                  { icon: ShieldCheck, title: "حجز الخزينة", desc: "يتم تجميد المبلغ في خزينة XMOOD الآمنة حتى ينتهي البائع من تسليم البيانات." },
                  { icon: Zap, title: "التحرير الآلي", desc: "بمجرد تأكيدك للاستلام، يقوم النظام آلياً وبدون تدخل بشري بتحويل المال للبائع." }
                ].map((f, i) => (
                  <Card key={i} className="border-none shadow-2xl rounded-[3rem] p-12 bg-white text-center luxury-shadow group hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">
                      <f.icon size={40} />
                    </div>
                    <h3 className="text-2xl font-headline font-bold mb-6">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </Card>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
