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
  Globe,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatUSD } from "@/lib/currency";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
    return query(collection(db, "users"), orderBy("affinityPoints", "desc"), limit(8));
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
      toast({ title: "تم النشر", description: "عرضك متاح الآن في مجتمع XMOOD." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل نشر العرض." });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <Navbar />
      
      <section className="pt-48 pb-24 relative border-b border-white/5 bg-zinc-950/40">
        <div className="container mx-auto px-6 text-center">
           <Badge className="mb-8 bg-primary/10 text-primary border-primary/20 py-2 px-8 rounded-full font-bold uppercase text-[10px]">
              XMOOD SOCIAL GAMING HUB
           </Badge>
           <h1 className="text-6xl md:text-8xl font-headline font-bold mb-6 gold-text">مجتمع XMOOD</h1>
           <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-light">
             ساحة التفاعل الأولى لتداول الحسابات، مشاركة العروض، وبناء سمعتك كتاجر رقمي محترف.
           </p>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 -mt-12">
          
          <aside className="lg:col-span-1 space-y-6">
            <Card className="luxury-card p-8 border-none sticky top-36">
              {user ? (
                <div className="space-y-8 text-center">
                   <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20">
                     <AvatarImage src={profile?.photoURL} />
                     <AvatarFallback className="bg-zinc-900 text-2xl text-primary font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                     <h4 className="text-2xl font-bold text-white mb-1">{profile?.displayName}</h4>
                     <Badge className="bg-primary/20 text-primary font-bold text-[9px] px-4 py-1 rounded-full uppercase">{profile?.label}</Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                         <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1">النقاط</p>
                         <p className="text-xl font-black text-primary">{profile?.affinityPoints || 0}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                         <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1">المحفظة</p>
                         <p className="text-xs font-bold text-green-500">{formatUSD(profile?.walletBalance || 0)}</p>
                      </div>
                   </div>
                   <Button asChild variant="outline" className="w-full h-12 rounded-xl border-white/10 text-[10px] font-bold uppercase">
                     <Link href="/wallet">إدارة الحساب</Link>
                   </Button>
                </div>
              ) : (
                <div className="text-center py-10 space-y-4">
                   <Users size={48} className="mx-auto text-zinc-800 opacity-30" />
                   <p className="text-zinc-500 text-sm font-bold">انضم لمجتمعنا الرقمي الآن.</p>
                   <Button asChild className="royal-button w-full h-12"><Link href="/login">دخول</Link></Button>
                </div>
              )}
            </Card>

            <Card className="luxury-card p-6 bg-primary/5 border-none">
               <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                 <TrendingUp size={14} /> أبرز المتداولين
               </h5>
               <div className="space-y-5">
                  {leaderboard?.map((u: any, i) => (
                    <div key={u.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-zinc-700">#{i+1}</span>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={u.photoURL} />
                            <AvatarFallback className="text-[8px] font-bold">XM</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold text-zinc-300 truncate w-20">{u.displayName}</span>
                       </div>
                       <span className="text-[10px] font-bold text-primary">{u.affinityPoints} pt</span>
                    </div>
                  ))}
               </div>
            </Card>
          </aside>

          <section className="lg:col-span-3 space-y-10">
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
               <div className="relative flex-1">
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                  <Input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="البحث عن عروض أو حسابات..." 
                    className="h-16 bg-zinc-950 border-none rounded-2xl pr-14 text-lg text-white" 
                  />
               </div>
               <Dialog open={isListingOpen} onOpenChange={setIsListingOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-16 px-10 royal-button text-lg flex gap-3"><Plus size={24} /> نشر عرض جديد</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border border-primary/20 rounded-[2.5rem] p-10 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4"><Megaphone size={28} /> نشر عرض في المجتمع</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-8">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-primary uppercase pr-3">عنوان العرض</Label>
                          <Input placeholder="مثال: حساب فورتنايت ميثيك" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={listingForm.title} onChange={e => setListingForm({...listingForm, title: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-primary uppercase pr-3">التفاصيل</Label>
                          <Textarea placeholder="اشرح تفاصيل عرضك وكيفية التواصل..." className="min-h-[120px] bg-zinc-900 border-none rounded-2xl p-6 font-bold" value={listingForm.description} onChange={e => setListingForm({...listingForm, description: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-primary uppercase pr-3">السعر المتوقع (USD)</Label>
                            <Input type="number" placeholder="0.00" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={listingForm.price} onChange={e => setListingForm({...listingForm, price: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-primary uppercase pr-3">النوع</Label>
                            <select className="w-full h-14 bg-zinc-900 border-none rounded-xl px-6 text-white font-bold appearance-none" value={listingForm.type} onChange={e => setListingForm({...listingForm, type: e.target.value as any})}>
                              <option value="sell">بيع</option>
                              <option value="buy">شراء</option>
                              <option value="service">خدمة / وساطة</option>
                            </select>
                          </div>
                       </div>
                       <Button onClick={handleCreateListing} className="w-full h-16 royal-button text-lg mt-4">نشر العرض الآن</Button>
                    </div>
                  </DialogContent>
               </Dialog>
            </div>

            <div className="space-y-10">
              {listings?.map((post: any) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="luxury-card border-none overflow-hidden hover:bg-zinc-950 transition-colors">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border border-primary/10">
                             <AvatarImage src={post.userPhoto} />
                             <AvatarFallback className="bg-zinc-900 text-primary font-bold">XM</AvatarFallback>
                          </Avatar>
                          <div>
                             <div className="flex items-center gap-2">
                                <h4 className="text-xl font-bold text-white">{post.userName}</h4>
                                <BadgeCheck size={16} className="text-blue-500" />
                                <Badge variant="outline" className="border-primary/10 text-primary text-[7px] font-bold px-2 rounded-full">{post.userLabel}</Badge>
                             </div>
                             <p className="text-[9px] text-zinc-600 font-bold uppercase">{new Date(post.createdAt).toLocaleDateString('ar-EG')}</p>
                          </div>
                       </div>
                       <Badge className="bg-white/5 text-zinc-400 border-white/5 px-4 py-1 rounded-full text-[9px] font-bold uppercase">
                          {post.type === 'sell' ? 'عرض بيع' : post.type === 'buy' ? 'طلب شراء' : 'خدمة'}
                       </Badge>
                    </div>

                    <CardContent className="p-8 space-y-6">
                       <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-white">{post.title}</h3>
                          <p className="text-base text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">{post.description}</p>
                       </div>
                       
                       <div className="bg-white/5 p-6 rounded-2xl flex justify-between items-center flex-row-reverse border border-white/5">
                          <div className="text-right">
                             <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">السعر المطلوب</p>
                             <p className="text-3xl font-black text-primary tracking-tight">{formatUSD(post.price)}</p>
                          </div>
                          <Button className="royal-button h-12 px-10 text-xs">التواصل الآن</Button>
                       </div>
                    </CardContent>

                    <div className="px-8 py-6 bg-zinc-950/40 border-t border-white/5 flex items-center gap-8">
                       <button className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors font-bold text-xs">
                          <Heart size={18} /> {post.likes || 0}
                       </button>
                       <button className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors font-bold text-xs">
                          <MessageSquare size={18} /> تعليق
                       </button>
                       <button className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors font-bold text-xs">
                          <Share2 size={18} /> مشاركة
                       </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {listings?.length === 0 && (
                <div className="py-40 text-center luxury-card border-dashed border-white/5">
                   <Users size={80} className="mx-auto text-zinc-900 mb-6" />
                   <h3 className="text-2xl font-bold text-zinc-700 uppercase tracking-widest">المجتمع بانتظار أول منشور..</h3>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
