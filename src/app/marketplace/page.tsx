
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MARKETPLACE_PRODUCTS } from "@/app/lib/mock-data";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Coins, 
  ArrowLeftRight, 
  UserCheck, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  BadgeCheck, 
  DollarSign, 
  History,
  Lock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredP2P = MARKETPLACE_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      
      {/* Hero Section Luxury Pro */}
      <section className="bg-slate-950 text-white py-28 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-luxury" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-luxury)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
           <div className="max-w-4xl">
              <Badge className="mb-6 bg-primary text-white border-none py-2 px-6 rounded-full font-bold tracking-[0.4em] animate-fade-in uppercase text-[10px]">
                 Royal P2P Trading Hub
              </Badge>
              <h1 className="text-6xl md:text-8xl font-headline font-bold mb-8 leading-none animate-fade-in">سوق التداول <br/><span className="text-primary">الملكي</span></h1>
              <p className="text-xl text-slate-400 leading-relaxed font-light animate-fade-in max-w-2xl">المنصة الآمنة الأولى لتبادل الحسابات النادرة والعملات الرقمية بين النخبة، بنظام ضمان ذكي وحماية فنية متكاملة.</p>
           </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-16 relative z-20 pb-20">
        <Tabs defaultValue="market" className="space-y-16">
          <div className="flex justify-center">
            <TabsList className="bg-white/90 backdrop-blur-2xl p-2 rounded-[3rem] h-24 shadow-2xl border flex gap-3 w-fit luxury-shadow">
              <TabsTrigger value="market" className="rounded-[2rem] px-14 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">سوق الحسابات</TabsTrigger>
              <TabsTrigger value="exchange" className="rounded-[2rem] px-14 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">تبادل العملات</TabsTrigger>
              <TabsTrigger value="escrow" className="rounded-[2rem] px-14 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">نظام الضمان</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="market" className="space-y-12 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                <Input 
                  placeholder="ابحث عن حساب ناد، باقات شحن، أو خدمات حصرية..." 
                  className="pr-20 h-20 rounded-[2.5rem] bg-white border-none shadow-2xl text-xl luxury-shadow focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="h-20 rounded-[2.5rem] bg-slate-900 text-white font-bold px-16 shadow-2xl hover:bg-primary transition-all text-lg group">
                أضف عرضك للبيع <ArrowRight className="mr-3 group-hover:translate-x-[-5px] transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {filteredP2P.map((product) => (
                <div key={product.id} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-transparent rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <ProductCard product={product} />
                  <div className="absolute top-6 left-6 z-30">
                     <Badge className="bg-white/95 backdrop-blur text-primary border-none shadow-xl flex gap-1.5 items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        <BadgeCheck size={14} className="text-primary" /> موثوق XMOOD
                     </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exchange" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden luxury-shadow">
                  <CardHeader className="bg-slate-50 p-12 border-b">
                    <CardTitle className="flex items-center gap-4 text-3xl font-bold text-slate-900">
                      <ArrowLeftRight size={32} className="text-primary" /> تحويل الأرصدة الفوري
                    </CardTitle>
                    <p className="text-muted-foreground text-lg">نظام المقايضة الذكي للتحويل بين العملات الصعبة والمحلية بأمان مطلق.</p>
                  </CardHeader>
                  <CardContent className="p-12 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pr-4">من رصيد (USD)</label>
                        <div className="relative">
                          <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
                          <Input type="number" placeholder="100.00" className="h-24 rounded-[2.5rem] bg-slate-50 border-none text-4xl font-black text-center pr-16 shadow-inner" />
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-90 lg:rotate-0 hover:scale-110 transition-transform cursor-pointer">
                           <ArrowLeftRight size={30} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pr-4">إلى رصيد (SDG)</label>
                        <Input readOnly placeholder="540,000" className="h-24 rounded-[2.5rem] bg-slate-50 border-none text-4xl font-black text-center text-primary shadow-inner" />
                      </div>
                    </div>
                    <Button className="w-full h-24 rounded-[2.5rem] bg-slate-900 text-white font-bold text-2xl hover:bg-primary shadow-2xl transition-all shadow-primary/10">
                      تنفيذ عملية التبادل الملكي
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-white flex items-center justify-between luxury-shadow border border-slate-50">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">سعر الشراء المعتمد</p>
                        <p className="text-3xl font-black text-slate-900">1 USD = 5400 SDG</p>
                      </div>
                      <div className="w-16 h-16 bg-green-50 rounded-[1.5rem] flex items-center justify-center text-green-600">
                        <TrendingUp size={32} />
                      </div>
                   </Card>
                   <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-white flex items-center justify-between luxury-shadow border border-slate-50">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">سعر البيع المعتمد</p>
                        <p className="text-3xl font-black text-slate-900">1 USD = 5450 SDG</p>
                      </div>
                      <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary">
                        <Coins size={32} />
                      </div>
                   </Card>
                </div>
              </div>

              <div className="space-y-10">
                <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden p-12 relative luxury-shadow">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[100px] rounded-full"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-8">نظام الضمان XMOOD</h3>
                  <p className="text-xl text-slate-400 leading-relaxed mb-10 font-light">
                    نحن نضمن كل عملية تداول. يتم حجز الأرصدة في "الخزينة المؤمنة" ولا يتم تحريرها إلا بعد مطابقة المعايير الفنية وتأكيد الطرفين.
                  </p>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-16 rounded-2xl font-bold text-lg">
                    قواعد التداول الآمن
                  </Button>
                </Card>
                
                <Card className="border-none shadow-xl rounded-[3rem] bg-white p-12 luxury-shadow border border-slate-50">
                   <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                     <History size={24} className="text-primary" /> صفقات حية
                   </h3>
                   <div className="space-y-8">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center justify-between py-5 border-b border-slate-50 last:border-0 group cursor-default">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                <UserCheck size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold">تحويل عملة P2P</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">منذ {i * 3} دقائق</span>
                              </div>
                           </div>
                           <span className="text-lg font-black text-primary">${(i * 125).toFixed(2)}</span>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="escrow" className="animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { icon: UserCheck, title: "توثيق الهوية", desc: "نتأكد من هوية الطرفين ومطابقة العرض المقدم للمعايير الفنية الصارمة لمتجر XMOOD." },
                  { icon: Lock, title: "تجميد الخزينة", desc: "يتم حجز قيمة الصفقة في الخزينة المؤمنة، مما يمنع أي محاولة تلاعب حتى اكتمال التسليم." },
                  { icon: ShieldCheck, title: "التحرير الفوري", desc: "بمجرد تأكيد الاستلام، يتم تحويل المال للبائع آلياً وبدون أي تدخل بشري لضمان السرعة." }
                ].map((f, i) => (
                  <Card key={i} className="border-none shadow-2xl rounded-[3.5rem] p-16 bg-white text-center luxury-shadow group hover:-translate-y-3 transition-all duration-700">
                    <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      <f.icon size={44} />
                    </div>
                    <h3 className="text-3xl font-headline font-bold mb-8">{f.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light">{f.desc}</p>
                  </Card>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
