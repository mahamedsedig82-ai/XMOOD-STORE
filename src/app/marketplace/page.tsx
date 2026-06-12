
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  ArrowLeftRight, 
  UserCheck, 
  ShieldCheck, 
  Trophy, 
  Star, 
  Users,
  Search,
  Zap,
  Lock,
  BadgeCheck,
  Megaphone,
  Plus,
  MessageSquare,
  Heart,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatUSD } from "@/lib/currency";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export default function MarketplacePage() {
  const { profile, user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isListingOpen, setIsListingOpen] = useState(false);
  
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    price: "",
    type: 'sell' as 'sell' | 'buy' | 'service'
  });

  const leaderboardQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("affinityPoints", "desc"), limit(20));
  }, [db]);

  const listingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "marketplace_listings"), orderBy("createdAt", "desc"), limit(30));
  }, [db]);

  const { data: marketplaceUsers } = useCollection(leaderboardQuery);
  const { data: listings } = useCollection(listingsQuery);

  const handleCreateListing = async () => {
    if (!user || !profile || !db) return;
    try {
      await addDoc(collection(db, "marketplace_listings"), {
        userId: user.uid,
        userName: profile.displayName,
        userPhoto: profile.photoURL || "",
        title: listingForm.title,
        description: listingForm.description,
        price: Number(listingForm.price),
        type: listingForm.type,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      setIsListingOpen(false);
      setListingForm({ title: "", description: "", price: "", type: 'sell' });
      toast({ title: "تم نشر الإعلان الملكي", description: "عرضك متاح الآن في السوق العام." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل نشر الإعلان." });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Navbar />
      
      <section className="py-32 relative overflow-hidden bg-black border-b border-primary/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-market" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fbbf24" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-market)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
           <Badge className="mb-8 bg-primary/20 text-primary border-primary/40 py-2 px-10 rounded-full font-black tracking-[0.6em] uppercase text-[10px]">
              Sovereign Trading Network PRO
           </Badge>
           <h1 className="text-6xl md:text-[8rem] font-headline font-bold mb-8 leading-none gold-text drop-shadow-2xl">سوق النخبة الاجتماعي</h1>
           <p className="text-xl md:text-2xl text-slate-500 max-w-4xl mx-auto leading-relaxed font-light">
             تداول، تواصل، وابنِ سمعتك السيادية. أول منصة اجتماعية وتجارية موثقة في العالم الرقمي.
           </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-12 relative z-20 pb-40">
        <Tabs defaultValue="listings" className="space-y-16">
          <div className="flex justify-center">
            <TabsList className="bg-white/5 backdrop-blur-3xl p-1.5 rounded-full h-20 shadow-2xl border border-white/10 flex gap-2 w-fit">
              <TabsTrigger value="listings" className="rounded-full px-12 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-black transition-all">الإعلانات الحية</TabsTrigger>
              <TabsTrigger value="leaderboard" className="rounded-full px-12 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-black transition-all">تصنيف السيادة</TabsTrigger>
              <TabsTrigger value="escrow" className="rounded-full px-12 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-black transition-all">الضمان والتحويل</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="listings" className="animate-fade-in space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="relative w-full md:w-96">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                  <Input placeholder="ابحث عن عروض أو مستخدمين..." className="pr-12 h-14 bg-white/5 border-none rounded-2xl text-white shadow-inner" />
               </div>
               <Dialog open={isListingOpen} onOpenChange={setIsListingOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-14 px-10 royal-button text-lg"><Plus className="ml-2" /> نشر إعلان ملكي</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-primary/20 rounded-[3rem] p-12 text-white shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-bold gold-text flex items-center gap-4"><Megaphone size={28} /> إنشاء إعلان في السوق</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-10">
                       <Input placeholder="عنوان الإعلان (مثلاً: مطلوب حساب نادري)" className="h-14 bg-zinc-900 border-none rounded-xl" value={listingForm.title} onChange={e => setListingForm({...listingForm, title: e.target.value})} />
                       <Textarea placeholder="تفاصيل العرض والشروط..." className="min-h-[150px] bg-zinc-900 border-none rounded-2xl p-6" value={listingForm.description} onChange={e => setListingForm({...listingForm, description: e.target.value})} />
                       <div className="grid grid-cols-2 gap-4">
                          <Input type="number" placeholder="المبلغ (USD)" className="h-14 bg-zinc-900 border-none rounded-xl" value={listingForm.price} onChange={e => setListingForm({...listingForm, price: e.target.value})} />
                          <select className="h-14 bg-zinc-900 border-none rounded-xl px-4 text-white" value={listingForm.type} onChange={e => setListingForm({...listingForm, type: e.target.value as any})}>
                            <option value="sell">بيع أصول</option>
                            <option value="buy">طلب شراء</option>
                            <option value="service">خدمة تقنية</option>
                          </select>
                       </div>
                       <Button onClick={handleCreateListing} className="w-full h-16 royal-button text-xl">تفعيل الإعلان</Button>
                    </div>
                  </DialogContent>
               </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {listings?.map((item: any) => (
                <Card key={item.id} className="luxury-card border-none p-8 flex flex-col justify-between group hover:scale-[1.02] transition-all">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border border-primary/20 shadow-lg">
                        <AvatarImage src={item.userPhoto} />
                        <AvatarFallback className="bg-zinc-900 text-primary font-black">{item.userName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-white">{item.userName}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <Badge className="mr-auto bg-primary/10 text-primary border-primary/20 text-[8px]">{item.type === 'sell' ? 'بيع' : 'طلب'}</Badge>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-white group-hover:gold-text transition-all">{item.title}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                     <span className="text-2xl font-black text-primary">{formatUSD(item.price)}</span>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-600 hover:text-primary"><MessageSquare size={18} /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-600 hover:text-red-500"><Heart size={18} /></Button>
                     </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-16 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <Card className="lg:col-span-1 luxury-card border-none p-10 legendary-border">
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-10 italic">سجلك الاجتماعي</h3>
                   {user ? (
                     <div className="space-y-10 text-center">
                        <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20 shadow-2xl">
                          <AvatarImage src={profile?.photoURL} />
                          <AvatarFallback className="bg-zinc-900 text-4xl text-primary font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-3xl font-bold text-white mb-2">{profile?.displayName}</h4>
                          <Badge className="bg-primary text-black font-black text-[10px] px-6 py-1 rounded-full">{profile?.label}</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                           <div className="p-6 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                              <p className="text-[9px] text-zinc-500 uppercase font-black mb-2 tracking-widest">نقاط الأفضلية (Affinity)</p>
                              <p className="text-5xl font-black text-primary">{profile?.affinityPoints || 0}</p>
                           </div>
                        </div>
                        <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 text-xs font-black">تعديل البروفايل</Button>
                     </div>
                   ) : (
                     <div className="text-center py-20 space-y-6">
                        <Lock size={80} className="mx-auto text-zinc-800 opacity-20" />
                        <p className="text-zinc-500 font-bold">سجل دخولك للانضمام لنادي النخبة.</p>
                     </div>
                   )}
                </Card>

                <Card className="lg:col-span-3 luxury-card border-none p-12">
                   <div className="flex justify-between items-center mb-12">
                      <h3 className="text-3xl font-bold flex items-center gap-6 gold-text">
                        <Trophy size={36} className="text-primary" /> تصنيف مواطني XMOOD السياديين
                      </h3>
                      <Badge variant="outline" className="border-primary/20 text-primary py-2 px-8 rounded-full font-black text-[9px] animate-pulse">GLOBAL LIVE RANKING</Badge>
                   </div>
                   <div className="space-y-4">
                      {marketplaceUsers?.map((u: any, i: number) => (
                        <div key={u.id} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-primary/5 hover:border-primary/20 transition-all">
                           <div className="flex items-center gap-6">
                              <span className="text-2xl font-black text-zinc-800 group-hover:text-primary w-10">#{i + 1}</span>
                              <Avatar className="w-14 h-14 border-2 border-primary/10">
                                <AvatarImage src={u.photoURL} />
                                <AvatarFallback className="bg-zinc-900 text-primary font-black">XM</AvatarFallback>
                              </Avatar>
                              <div>
                                 <p className="font-bold text-lg mb-1 flex items-center gap-2">
                                    {u.displayName}
                                    {u.isVerified && <BadgeCheck size={16} className="text-blue-400" />}
                                 </p>
                                 <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest italic">{u.label}</p>
                              </div>
                           </div>
                           <div className="text-left">
                              <div className="flex items-center gap-3">
                                 <Star size={16} className="fill-primary text-primary" />
                                 <span className="text-3xl font-black text-primary">{u.affinityPoints || 0}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="escrow" className="animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card className="luxury-card border-none p-16 legendary-border">
                  <h3 className="text-3xl font-bold mb-12 flex items-center gap-6 gold-text">
                    <ArrowLeftRight size={36} className="text-primary" /> نظام التحويل P2P السيادي
                  </h3>
                  <div className="space-y-12">
                    <div className="space-y-4 text-center">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">سيولتك الحالية الموثقة</label>
                      <p className="text-6xl font-black text-white tracking-tighter">{formatUSD(profile?.walletBalance || 0)}</p>
                    </div>
                    <div className="space-y-6">
                       <Input placeholder="أدخل معرف المستلم (UID) بدقة..." className="h-20 bg-white/5 border-none rounded-[2rem] text-2xl font-black text-center text-primary shadow-inner" />
                       <Button className="w-full h-20 royal-button text-2xl">بدء بروتوكول التحويل</Button>
                    </div>
                    <p className="text-[9px] text-zinc-600 text-center font-bold italic">يخضع هذا التحويل لرقابة النواة الذكية لضمان الأمان المطلق.</p>
                  </div>
                </Card>

                <div className="grid grid-cols-1 gap-10">
                   <Card className="luxury-card border-none p-12 bg-white/5">
                      <h4 className="text-2xl font-bold mb-6 flex items-center gap-4 text-primary">
                        <ShieldCheck size={28} /> حماية Escrow PRO
                      </h4>
                      <p className="text-zinc-400 text-lg leading-relaxed font-light">
                        تتم كافة عمليات تداول الأصول تحت حماية نظام الضمان الملكي. لا يتم تحرير المبلغ للبائع إلا بعد تأكيد المشتري لاستلام الأصل الرقمي وتوثيقه.
                      </p>
                   </Card>
                   <Card className="luxury-card border-none p-12 bg-white/5">
                      <h4 className="text-2xl font-bold mb-6 flex items-center gap-4 text-primary">
                        <BadgeCheck size={28} /> رتبة الموثوقية العالية
                      </h4>
                      <p className="text-zinc-400 text-lg leading-relaxed font-light">
                        كلما زاد عدد عملياتك الناجحة في السوق، ارتفعت نقاط أفضليتك وحصلت على "شارة الموثوقية الزرقاء" التي تمنحك أولوية في الظهور وعمولات تحويل أقل.
                      </p>
                   </Card>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
