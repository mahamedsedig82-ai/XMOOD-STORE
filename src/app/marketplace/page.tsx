
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc } from "firebase/firestore";
import { 
  ShieldCheck, 
  Trophy, 
  Star, 
  Search,
  Zap,
  Lock,
  BadgeCheck,
  Megaphone,
  Plus,
  MessageSquare,
  Heart,
  Share2,
  MoreVertical,
  Camera,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatUSD } from "@/lib/currency";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketplaceSocial() {
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

  const listingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "marketplace_listings"), orderBy("createdAt", "desc"), limit(50));
  }, [db]);

  const leaderboardQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("affinityPoints", "desc"), limit(10));
  }, [db]);

  const { data: listings } = useCollection(listingsQuery);
  const { data: leaderboard } = useCollection(leaderboardQuery);

  const handleCreateListing = async () => {
    if (!user || !profile || !db) return;
    if (!listingForm.title || !listingForm.description) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى كتابة عنوان ووصف للعرض." });
      return;
    }

    try {
      await addDoc(collection(db, "marketplace_listings"), {
        userId: user.uid,
        userName: profile.displayName,
        userPhoto: profile.photoURL || "",
        userLabel: profile.label || "عضو موثق",
        title: listingForm.title,
        description: listingForm.description,
        price: Number(listingForm.price),
        type: listingForm.type,
        status: 'active',
        likes: 0,
        createdAt: new Date().toISOString()
      });
      setIsListingOpen(false);
      setListingForm({ title: "", description: "", price: "", type: 'sell' });
      toast({ title: "تم نشر المنشور الإعلاني", description: "عرضك متاح الآن في السوق الاجتماعي." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في النشر", description: "تعذر إكمال بروتوكول الإعلان." });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <Navbar />
      
      <section className="pt-52 pb-32 relative overflow-hidden border-b border-white/5 bg-zinc-950/50">
        <div className="container mx-auto px-6 relative z-10 text-center">
           <Badge className="mb-10 bg-primary/10 text-primary border-primary/20 py-3 px-12 rounded-full font-black tracking-[0.5em] uppercase text-[10px]">
              XMOOD SOVEREIGN SOCIAL MARKET V5
           </Badge>
           <h1 className="text-7xl md:text-9xl font-headline font-bold mb-10 gold-text">سوق النخبة</h1>
           <p className="text-2xl md:text-3xl text-zinc-500 max-w-4xl mx-auto leading-relaxed font-light">
             تواصل، تداول، وابنِ هويتك السيادية في أول مجتمع تجاري رقمي موثق.
           </p>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 -mt-16">
          
          <aside className="lg:col-span-1 space-y-8 relative z-20">
            <Card className="luxury-card p-10 legendary-border sticky top-40">
              {user ? (
                <div className="space-y-10 text-center">
                   <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20 shadow-2xl">
                     <AvatarImage src={profile?.photoURL} />
                     <AvatarFallback className="bg-zinc-900 text-4xl text-primary font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                     <h4 className="text-3xl font-bold text-white mb-2">{profile?.displayName}</h4>
                     <Badge className="bg-primary text-black font-black text-[10px] px-8 py-1 rounded-full uppercase tracking-widest">{profile?.label}</Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                         <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">النقاط</p>
                         <p className="text-2xl font-black text-primary">{profile?.affinityPoints || 0}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                         <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">المحفظة</p>
                         <p className="text-xs font-black text-green-500">{formatUSD(profile?.walletBalance || 0)}</p>
                      </div>
                   </div>
                   <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-white/10 text-xs font-black uppercase tracking-widest">
                     <Link href="/wallet">إدارة الحساب</Link>
                   </Button>
                </div>
              ) : (
                <div className="text-center py-20 space-y-6">
                   <Lock size={60} className="mx-auto text-zinc-800 opacity-20" />
                   <p className="text-zinc-500 font-bold">سجل الدخول للانضمام للنخبة.</p>
                   <Button asChild className="royal-button w-full h-12"><Link href="/login">تسجيل الدخول</Link></Button>
                </div>
              )}
            </Card>

            <Card className="luxury-card p-8 bg-primary/5 border-primary/10">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">المتصدرون السياديون</h5>
               <div className="space-y-6">
                  {leaderboard?.map((u: any, i) => (
                    <div key={u.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-zinc-700">#{i+1}</span>
                          <Avatar className="w-8 h-8 border border-primary/20">
                            <AvatarImage src={u.photoURL} />
                            <AvatarFallback className="text-[8px] font-black">XM</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold text-zinc-300 truncate w-24">{u.displayName}</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Star size={10} className="fill-primary text-primary" />
                          <span className="text-[10px] font-black text-primary">{u.affinityPoints}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </aside>

          <section className="lg:col-span-3 space-y-12 relative z-20">
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
               <div className="relative flex-1">
                  <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40" size={24} />
                  <Input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="ابحث في الإعلانات الموثقة..." 
                    className="h-20 bg-zinc-950 border-none rounded-[2rem] pr-16 text-xl text-white shadow-inner" 
                  />
               </div>
               <Dialog open={isListingOpen} onOpenChange={setIsListingOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-20 px-12 royal-button text-xl flex gap-4"><Plus size={28} /> نشر عرض ملكي</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-2 border-primary/20 rounded-[3rem] p-12 text-white shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-4xl font-headline font-bold gold-text flex items-center gap-6"><Megaphone size={32} /> بروتوكول الإعلان الرسمي</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-8 mt-12">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-primary uppercase pr-4 tracking-widest">عنوان العرض</Label>
                          <Input placeholder="مثال: حساب ميثيك شحن قديم" className="h-16 bg-zinc-900 border-none rounded-2xl px-8 font-bold" value={listingForm.title} onChange={e => setListingForm({...listingForm, title: e.target.value})} />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-primary uppercase pr-4 tracking-widest">تفاصيل الصفقة</Label>
                          <Textarea placeholder="اشرح تفاصيل العرض والضمانات..." className="min-h-[180px] bg-zinc-900 border-none rounded-[2rem] p-8 font-bold" value={listingForm.description} onChange={e => setListingForm({...listingForm, description: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary uppercase pr-4 tracking-widest">القيمة المطلوبة (USD)</Label>
                            <Input type="number" placeholder="0.00" className="h-16 bg-zinc-900 border-none rounded-2xl px-8 font-black text-2xl" value={listingForm.price} onChange={e => setListingForm({...listingForm, price: e.target.value})} />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black text-primary uppercase pr-4 tracking-widest">نوع المنشور</Label>
                            <select className="w-full h-16 bg-zinc-900 border-none rounded-2xl px-8 text-white font-bold appearance-none" value={listingForm.type} onChange={e => setListingForm({...listingForm, type: e.target.value as any})}>
                              <option value="sell">عروض بيع</option>
                              <option value="buy">طلبات شراء</option>
                              <option value="service">خدمات ووساطة</option>
                            </select>
                          </div>
                       </div>
                       <Button onClick={handleCreateListing} className="w-full h-20 royal-button text-2xl shadow-primary/30">تفعيل المنشور السيادي</Button>
                    </div>
                  </DialogContent>
               </Dialog>
            </div>

            <div className="space-y-12">
              {listings?.map((post: any) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="luxury-card border-none overflow-hidden hover:border-primary/20 transition-all">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <Avatar className="w-16 h-16 border-2 border-primary/20">
                             <AvatarImage src={post.userPhoto} />
                             <AvatarFallback className="bg-zinc-900 text-primary font-black">XM</AvatarFallback>
                          </Avatar>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-2xl font-bold text-white leading-none">{post.userName}</h4>
                                <BadgeCheck size={20} className="text-blue-400" />
                                <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black px-3 rounded-full">{post.userLabel}</Badge>
                             </div>
                             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">{new Date(post.createdAt).toLocaleString('ar-EG')}</p>
                          </div>
                       </div>
                       <Badge className={`bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest`}>
                          {post.type === 'sell' ? 'إعلان بيع' : post.type === 'buy' ? 'طلب شراء' : 'خدمة معتمدة'}
                       </Badge>
                    </div>

                    <CardContent className="p-10 space-y-8">
                       <div className="space-y-4">
                          <h3 className="text-3xl font-bold gold-text leading-tight">{post.title}</h3>
                          <p className="text-lg text-zinc-400 leading-relaxed font-light whitespace-pre-wrap">{post.description}</p>
                       </div>
                       
                       <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex justify-between items-center flex-row-reverse">
                          <div className="text-right">
                             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">القيمة المعلنة</p>
                             <p className="text-4xl font-black text-primary tracking-tighter">{formatUSD(post.price)}</p>
                          </div>
                          <Button className="royal-button h-14 px-12 text-sm shadow-lg">التواصل مع المعلن</Button>
                       </div>
                    </CardContent>

                    <div className="px-10 py-8 bg-zinc-950/50 border-t border-white/5 flex items-center justify-between">
                       <div className="flex gap-10">
                          <button className="flex items-center gap-3 text-zinc-500 hover:text-red-500 transition-all font-black text-xs">
                             <Heart size={20} /> {post.likes || 0}
                          </button>
                          <button className="flex items-center gap-3 text-zinc-500 hover:text-primary transition-all font-black text-xs">
                             <MessageSquare size={20} /> 0 تعليقات
                          </button>
                          <button className="flex items-center gap-3 text-zinc-500 hover:text-blue-400 transition-all font-black text-xs">
                             <Share2 size={20} /> مشاركة
                          </button>
                       </div>
                       <Badge variant="outline" className="border-white/5 text-zinc-700 px-6 rounded-full font-black text-[9px]">XMOOD SECURE AD</Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {listings?.length === 0 && (
                <div className="py-60 text-center luxury-card border-dashed border-primary/10">
                   <Megaphone size={120} className="mx-auto text-zinc-900 mb-10" />
                   <h3 className="text-4xl font-black text-zinc-700 uppercase tracking-widest">لا توجد إعلانات سيادية حالياً</h3>
                   <p className="text-zinc-500 font-bold mt-4">كن أول من ينشر في السوق الاجتماعي الملكي.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
