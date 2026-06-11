"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { STORE_PRODUCTS, MARKETPLACE_PRODUCTS } from "@/app/lib/mock-data";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, ShoppingBag, Coins, ArrowLeftRight, UserCheck, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD, formatSDG } from "@/lib/currency";

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredP2P = MARKETPLACE_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-primary mb-4">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-sm font-bold tracking-widest uppercase">XMOOD P2P & EXCHANGE</span>
          </div>
          <h1 className="text-5xl font-headline font-bold mb-4">سوق التداول والعملات</h1>
          <p className="text-muted-foreground text-lg">تداول الحسابات، الخدمات، والعملات الرقمية مع مستخدمين آخرين بأمان تام.</p>
        </header>

        <Tabs defaultValue="market" className="space-y-8">
          <TabsList className="bg-white p-2 rounded-[2rem] h-20 shadow-sm border flex gap-2 w-fit">
            <TabsTrigger value="market" className="rounded-2xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">سوق الحسابات (P2P)</TabsTrigger>
            <TabsTrigger value="exchange" className="rounded-2xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">تبادل العملات</TabsTrigger>
            <TabsTrigger value="how-it-works" className="rounded-2xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">كيف يعمل النظام؟</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-6 animate-fade-in">
            <div className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  placeholder="ابحث عن حسابات نادرة أو خدمات..." 
                  className="pr-12 h-14 rounded-2xl bg-white border-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="h-14 rounded-2xl bg-primary text-white font-bold px-8 shadow-lg shadow-primary/20">
                أضف عرضك الخاص
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredP2P.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exchange" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                  <CardHeader className="bg-primary/5 p-8 border-b">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <ArrowLeftRight /> تحويل فوري للرصيد
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase">لديك رصيد (USD)</label>
                        <Input type="number" placeholder="100" className="h-16 rounded-2xl bg-slate-50 border-none text-2xl font-black text-center" />
                      </div>
                      <div className="flex justify-center md:pt-6">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                           <ArrowLeftRight size={20} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase">ستستلم (SDG)</label>
                        <Input readOnly placeholder="540,000" className="h-16 rounded-2xl bg-slate-50 border-none text-2xl font-black text-center text-primary" />
                      </div>
                    </div>
                    <Button className="w-full h-16 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-primary transition-all">
                      تنفيذ التحويل للمحفظة المحلية
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="border-none shadow-sm rounded-3xl p-8 bg-white flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">سعر الشراء اليوم</p>
                        <p className="text-2xl font-black text-slate-900">1 USD = 5400 SDG</p>
                      </div>
                      <Coins className="text-primary w-10 h-10" />
                   </Card>
                   <Card className="border-none shadow-sm rounded-3xl p-8 bg-white flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">سعر البيع اليوم</p>
                        <p className="text-2xl font-black text-slate-900">1 USD = 5450 SDG</p>
                      </div>
                      <ArrowLeftRight className="text-primary w-10 h-10" />
                   </Card>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden p-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">تنبيه أمني</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    نحن نضمن كافة عمليات تبادل العملات التي تتم داخل المنصة. لا تتعامل خارج نظام الوساطة الضامن (XMOOD Escrow) لحماية أموالك.
                  </p>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-12 rounded-xl">
                    اقرأ سياسة الضمان
                  </Button>
                </Card>
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
                   <h3 className="text-lg font-bold mb-4">آخر تداولات العملات</h3>
                   <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <Coins size={14} />
                              </div>
                              <span className="text-xs font-bold">تحويل رصيد</span>
                           </div>
                           <span className="text-xs font-black text-primary">$150.00</span>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="how-it-works" className="animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: UserCheck, title: "تحقق من العروض", desc: "اختر العرض المناسب لك من سوق الحسابات أو قسم العملات." },
                  { icon: ShieldCheck, title: "نظام الضمان", desc: "يتم حجز المبلغ في خزينة XMOOD فور طلب الخدمة لضمان حقك." },
                  { icon: Zap, title: "تسليم فوري", desc: "بمجرد تأكيد البيانات، يتم تحويل المال والخدمة فوراً وبشكل آلي." }
                ].map((f, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-[2rem] p-10 bg-white text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <f.icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{f.title}</h3>
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