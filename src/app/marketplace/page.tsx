
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, where } from "firebase/firestore";
import { 
  ShieldCheck, Search, Zap, Megaphone, Plus, 
  Users, CheckCircle, Phone, MessageSquare, AtSign, Send, Filter, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MarketplacePost } from "@/components/marketplace/MarketplacePost";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MarketplaceSocial() {
  const { profile, user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isListingOpen, setIsListingOpen] = useState(false);
  
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    price: "",
    type: 'sell' as 'sell' | 'buy' | 'service',
    contactMethod: 'whatsapp' as 'whatsapp' | 'telegram' | 'email' | 'onsite',
    contactValue: ""
  });

  // Blacklist filter
  const FORBIDDEN_WORDS = ["مخدر", "هاك", "سب", "شتيمة"]; // Simple client-side example

  const listingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "marketplace_listings"), 
      where("status", "==", "active"),
      orderBy("createdAt", "desc"), 
      limit(50)
    );
  }, [db]);

  const middlemenQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("isTrusted", "==", true), limit(15));
  }, [db]);

  const { data: listings, loading: listingsLoading } = useCollection(listingsQuery);
  const { data: trustedAgents } = useCollection(middlemenQuery);
  
  const handleCreateListing = async () => {
    if (!user || !profile || !db) return;
    
    // Safety Check: Spam protection
    const now = Date.now();
    const lastPostTime = Number(localStorage.getItem('last_post_time') || 0);
    if (now - lastPostTime < 60000) { // 1 minute cooldown
       toast({ variant: "destructive", title: "تريث قليلاً", description: "يرجى الانتظار دقيقة بين كل منشور والآخر." });
       return;
    }

    if (!listingForm.title || !listingForm.description || !listingForm.contactValue) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "أكمل كافة الحقول الإلزامية." });
      return;
    }

    // Content Filtering
    const containsForbidden = FORBIDDEN_WORDS.some(word => 
      listingForm.title.includes(word) || listingForm.description.includes(word)
    );
    if (containsForbidden) {
       toast({ variant: "destructive", title: "محتوى مرفوض", description: "يحتوي منشورك على كلمات محظورة." });
       return;
    }

    try {
      await addDoc(collection(db, "marketplace_listings"), {
        userId: user.uid,
        userName: profile.displayName,
        userPhoto: profile.photoURL || "",
        userLabel: profile.label || "عضو موثق",
        isTrustedUser: profile.isTrusted || false,
        title: listingForm.title,
        description: listingForm.description,
        price: Number(listingForm.price) || 0,
        type: listingForm.type,
        contactMethod: listingForm.contactMethod,
        contactValue: listingForm.contactValue,
        status: 'active',
        likes: [],
        commentCount: 0,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('last_post_time', now.toString());
      setIsListingOpen(false);
      setListingForm({ title: "", description: "", price: "", type: 'sell', contactMethod: 'whatsapp', contactValue: "" });
      toast({ title: "تم النشر بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في النشر" });
    }
  };

  const filteredListings = listings?.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || l.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen bg-black text-white pb-40" dir="rtl">
      <Navbar />
      
      <section className="pt-48 pb-24 relative border-b border-white/5 bg-zinc-950/40 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="url(#grid-v6)" />
           </svg>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
           <Badge className="mb-8 bg-primary/10 text-primary border border-primary/20 py-2 px-10 rounded-full font-black uppercase text-[10px] tracking-[0.4em]">
              XMOOD SOVEREIGN SOCIAL HUB
           </Badge>
           <h1 className="text-6xl md:text-9xl font-headline font-bold mb-8 gold-text leading-tight tracking-tighter">مجتمع النخبة</h1>
           <p className="text-xl md:text-2xl text-zinc-500 max-w-4xl mx-auto font-light leading-relaxed mb-12">
             ساحة التداول والتحقق الرقمي. تواصل مع الوسطاء الموثوقين واضمن حقوقك في كل صفقة.
           </p>
           
           <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-4xl mx-auto">
              <div className="relative flex-1 w-full group">
                 <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-all" size={24} />
                 <Input 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="ابحث عن عروض أو مستخدمين..." 
                   className="h-20 bg-zinc-950 border-white/5 rounded-[2rem] pr-16 text-xl text-white placeholder:text-zinc-700 shadow-2xl focus:border-primary/40" 
                 />
              </div>
              <Dialog open={isListingOpen} onOpenChange={setIsListingOpen}>
                 <DialogTrigger asChild>
                   <Button className="h-20 px-12 royal-button text-xl flex gap-4 shadow-primary/20 w-full md:w-auto"><Plus size={28} /> نشر عرض جديد</Button>
                 </DialogTrigger>
                 <DialogContent className="bg-zinc-950 border border-primary/20 rounded-[3rem] p-12 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-4xl font-headline font-bold gold-text flex items-center gap-5"><Megaphone size={36} /> نشر عرض سيادي</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-8 mt-10">
                       <div className="space-y-3">
                          <Label className="text-[11px] font-black text-primary uppercase pr-4 tracking-widest">عنوان العرض</Label>
                          <Input placeholder="مثال: حساب ببجي مستويات عالية..." className="h-16 bg-zinc-900 border-none rounded-2xl px-8 font-bold text-lg" value={listingForm.title} onChange={e => setListingForm({...listingForm, title: e.target.value})} />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[11px] font-black text-primary uppercase pr-4 tracking-widest">التفاصيل الكاملة</Label>
                          <Textarea placeholder="اشرح تفاصيل عرضك بدقة..." className="min-h-[150px] bg-zinc-900 border-none rounded-[2rem] p-8 font-bold leading-relaxed text-lg" value={listingForm.description} onChange={e => setListingForm({...listingForm, description: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label className="text-[11px] font-black text-primary uppercase pr-4">السعر (USD)</Label>
                            <Input type="number" placeholder="0.00" className="h-16 bg-zinc-900 border-none rounded-2xl px-8 font-black text-2xl text-primary" value={listingForm.price} onChange={e => setListingForm({...listingForm, price: e.target.value})} />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[11px] font-black text-primary uppercase pr-4">نوع العرض</Label>
                            <Select onValueChange={(val: any) => setListingForm({...listingForm, type: val})} defaultValue="sell">
                               <SelectTrigger className="h-16 bg-zinc-900 border-none rounded-2xl px-8 font-bold text-lg">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                  <SelectItem value="sell">عرض بيع</SelectItem>
                                  <SelectItem value="buy">طلب شراء</SelectItem>
                                  <SelectItem value="service">تقديم خدمة</SelectItem>
                               </SelectContent>
                            </Select>
                          </div>
                       </div>
                       <Button onClick={handleCreateListing} className="w-full h-20 royal-button text-2xl mt-6 shadow-xl">نشر العرض في الساحة</Button>
                    </div>
                 </DialogContent>
              </Dialog>
           </div>
        </div>
      </section>

      <div className="container mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          <aside className="lg:col-span-1 space-y-10">
            <Card className="luxury-card p-10 border-none sticky top-36 bg-zinc-950/60">
               <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-10 flex items-center gap-3">
                 <Award size={18} className="animate-pulse" /> النخبة الموثوقة
               </h5>
               <div className="space-y-8">
                  {trustedAgents?.map((agent: any) => (
                    <Link key={agent.id} href={`/profile/${agent.id}`} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="relative">
                             <Avatar className="w-12 h-12 border-2 border-primary/20 group-hover:border-primary/60 transition-all">
                                <AvatarImage src={agent.photoURL} />
                                <AvatarFallback className="bg-zinc-900 font-bold text-primary">XM</AvatarFallback>
                             </Avatar>
                             <ShieldCheck size={14} className="absolute -bottom-1 -right-1 text-blue-500 bg-black rounded-full" />
                          </div>
                          <div>
                             <p className="font-bold text-white group-hover:text-primary transition-colors">{agent.displayName}</p>
                             <p className="text-[8px] text-zinc-600 font-black uppercase">{agent.role}</p>
                          </div>
                       </div>
                    </Link>
                  ))}
               </div>
            </Card>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pr-4">تصفية حسب النوع</p>
               {['all', 'sell', 'buy', 'service'].map((type) => (
                 <Button 
                   key={type}
                   onClick={() => setFilterType(type)}
                   variant="ghost" 
                   className={`w-full justify-start h-14 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-primary text-black' : 'text-zinc-500 hover:bg-white/5'}`}
                 >
                   {type === 'all' ? 'كافة المنشورات' : type === 'sell' ? 'عروض البيع' : type === 'buy' ? 'طلبات الشراء' : 'الخدمات الفنية'}
                 </Button>
               ))}
            </div>
          </aside>

          <section className="lg:col-span-3 space-y-10">
             <AnimatePresence>
                {filteredListings?.map((post: any) => (
                  <MarketplacePost key={post.id} post={post} />
                ))}
             </AnimatePresence>
             
             {filteredListings?.length === 0 && (
                <div className="py-60 text-center luxury-card border-dashed border-white/5 opacity-40">
                   <Users size={120} className="mx-auto text-zinc-900 mb-10" />
                   <h3 className="text-4xl font-headline font-bold text-zinc-700 uppercase tracking-[0.4em]">بانتظار العروض الأولى..</h3>
                </div>
             )}
          </section>
        </div>
      </div>
    </main>
  );
}
