
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc } from "firebase/firestore";
import { 
  ShieldCheck, 
  Search,
  Zap,
  Megaphone,
  Plus,
  Users,
  CheckCircle,
  Phone,
  MessageSquare,
  AtSign,
  Send
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
  const [isListingOpen, setIsListingOpen] = useState(false);
  
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    price: "",
    type: 'sell' as 'sell' | 'buy' | 'service',
    contactMethod: 'whatsapp' as 'whatsapp' | 'telegram' | 'email' | 'onsite',
    contactValue: ""
  });

  const listingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "marketplace_listings"), orderBy("createdAt", "desc"), limit(50));
  }, [db]);

  const middlemenQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("completedDeals", "desc"), limit(10));
  }, [db]);

  const { data: listings } = useCollection(listingsQuery);
  const { data: potentialMiddlemen } = useCollection(middlemenQuery);
  
  const middlemen = potentialMiddlemen?.filter(u => u.role === 'middleman' || u.role === 'owner');

  const handleCreateListing = async () => {
    if (!user || !profile || !db) return;
    
    if (!listingForm.title || !listingForm.description || !listingForm.contactValue) {
      toast({ 
        variant: "destructive", 
        title: "بيانات ناقصة", 
        description: "يجب إكمال العنوان، الوصف، ووسيلة التواصل لنشر العرض." 
      });
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
        price: Number(listingForm.price) || 0,
        type: listingForm.type,
        contactMethod: listingForm.contactMethod,
        contactValue: listingForm.contactValue,
        status: 'active',
        likes: [],
        commentCount: 0,
        createdAt: new Date().toISOString()
      });
      setIsListingOpen(false);
      setListingForm({ title: "", description: "", price: "", type: 'sell', contactMethod: 'whatsapp', contactValue: "" });
      toast({ title: "تم النشر بنجاح", description: "عرضك متاح الآن في مجتمع XMOOD ببيانات تواصل موثقة." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل نشر العرض. يرجى المحاولة لاحقاً." });
    }
  };

  const filteredListings = listings?.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <Navbar />
      
      <section className="pt-48 pb-24 relative border-b border-white/5 bg-zinc-950/40">
        <div className="container mx-auto px-6 text-center">
           <Badge className="mb-8 bg-primary/10 text-primary border-primary/20 py-2 px-8 rounded-full font-bold uppercase text-[10px]">
              XMOOD SOVEREIGN SOCIAL HUB
           </Badge>
           <h1 className="text-6xl md:text-8xl font-headline font-bold mb-6 gold-text">مجتمع XMOOD</h1>
           <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-light leading-relaxed">
             منصة التداول والتحقق الرقمي الأولى. شارك عروضك، تواصل مع النخبة، واضمن حقك مع نظام الوساطة السيادي.
           </p>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 -mt-12">
          
          <aside className="lg:col-span-1 space-y-6">
            <Card className="luxury-card p-8 border-none sticky top-36">
              {user ? (
                <div className="space-y-8 text-center">
                   <Link href={`/profile/${user.uid}`} className="block group">
                     <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20 group-hover:border-primary/50 transition-all">
                       <AvatarImage src={profile?.photoURL} />
                       <AvatarFallback className="bg-zinc-900 text-2xl text-primary font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                     </Avatar>
                   </Link>
                   <div>
                     <h4 className="text-2xl font-bold text-white mb-1">{profile?.displayName}</h4>
                     <Badge className="bg-primary/20 text-primary font-bold text-[9px] px-4 py-1 rounded-full uppercase tracking-widest">{profile?.label}</Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                         <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1">النقاط</p>
                         <p className="text-xl font-black text-primary">{profile?.affinityPoints || 0}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                         <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1">العمليات</p>
                         <p className="text-xl font-black text-white">{profile?.completedDeals || 0}</p>
                      </div>
                   </div>
                   <Button asChild variant="outline" className="w-full h-12 rounded-xl border-white/10 text-[10px] font-bold uppercase tracking-widest">
                     <Link href="/wallet">إدارة المحفظة</Link>
                   </Button>
                </div>
              ) : (
                <div className="text-center py-10 space-y-4">
                   <Users size={48} className="mx-auto text-zinc-800 opacity-30" />
                   <p className="text-zinc-500 text-sm font-bold">انضم لمجتمعنا الرقمي الموثق.</p>
                   <Button asChild className="royal-button w-full h-12"><Link href="/login">تسجيل الدخول</Link></Button>
                </div>
              )}
            </Card>

            <Card className="luxury-card p-6 bg-primary/5 border-none">
               <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                 <ShieldCheck size={14} /> الوسطاء المعتمدون
               </h5>
               <div className="space-y-5">
                  {middlemen?.map((m: any) => (
                    <Link key={m.id} href={`/profile/${m.id}`} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border border-white/10 group-hover:border-primary/50 transition-all">
                            <AvatarImage src={m.photoURL} />
                            <AvatarFallback className="text-[8px] font-bold">XM</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-zinc-300 group-hover:text-primary">{m.displayName}</span>
                             <span className="text-[8px] text-zinc-600 uppercase">Verified Escrow</span>
                          </div>
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-bold text-primary">{m.completedDeals || 0}</p>
                          <p className="text-[7px] text-zinc-600 uppercase">Deal</p>
                       </div>
                    </Link>
                  ))}
               </div>
            </Card>
          </aside>

          <section className="lg:col-span-3 space-y-10">
            <div className="flex flex-col md:flex-row gap-4 items-center">
               <div className="relative flex-1 w-full">
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                  <Input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن عروض في المجتمع..." 
                    className="h-16 bg-zinc-950 border-none rounded-2xl pr-14 text-lg text-white placeholder:text-zinc-700" 
                  />
               </div>
               <Dialog open={isListingOpen} onOpenChange={setIsListingOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-16 px-10 royal-button text-lg flex gap-3 shadow-primary/20 w-full md:w-auto"><Plus size={24} /> نشر عرض جديد</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4"><Megaphone size={28} /> نشر عرض سيادي</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-8">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-primary uppercase pr-3">عنوان العرض</Label>
                          <Input placeholder="مثال: حساب ببجي مستويات عالية..." className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={listingForm.title} onChange={e => setListingForm({...listingForm, title: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-primary uppercase pr-3">التفاصيل الكاملة</Label>
                          <Textarea placeholder="اشرح تفاصيل عرضك بدقة..." className="min-h-[120px] bg-zinc-900 border-none rounded-2xl p-6 font-bold leading-relaxed" value={listingForm.description} onChange={e => setListingForm({...listingForm, description: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-primary uppercase pr-3">السعر المتوقع (USD)</Label>
                            <Input type="number" placeholder="0.00" className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" value={listingForm.price} onChange={e => setListingForm({...listingForm, price: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-primary uppercase pr-3">التصنيف</Label>
                            <Select onValueChange={(val: any) => setListingForm({...listingForm, type: val})} defaultValue="sell">
                               <SelectTrigger className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                  <SelectItem value="sell">عرض بيع أصل</SelectItem>
                                  <SelectItem value="buy">طلب شراء أصل</SelectItem>
                                  <SelectItem value="service">خدمة / وساطة فنية</SelectItem>
                               </SelectContent>
                            </Select>
                          </div>
                       </div>

                       <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6">
                          <h4 className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
                             <ShieldCheck size={14} /> بيانات التواصل الإلزامية
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase pr-3">طريقة التواصل</Label>
                                <Select onValueChange={(val: any) => setListingForm({...listingForm, contactMethod: val})} defaultValue="whatsapp">
                                   <SelectTrigger className="h-12 bg-black border-white/5 rounded-xl px-4 font-bold">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                      <SelectItem value="whatsapp">واتساب</SelectItem>
                                      <SelectItem value="telegram">تيليجرام</SelectItem>
                                      <SelectItem value="email">البريد الإلكتروني</SelectItem>
                                      <SelectItem value="onsite">داخل الموقع (معرفك)</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase pr-3">المعرف / الرقم</Label>
                                <Input 
                                  placeholder="أدخل وسيلة التواصل هنا..." 
                                  className="h-12 bg-black border-white/5 rounded-xl px-4 font-bold" 
                                  value={listingForm.contactValue} 
                                  onChange={e => setListingForm({...listingForm, contactValue: e.target.value})} 
                                />
                             </div>
                          </div>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase italic text-center">
                            * لن يتم نشر العرض بدون وسيلة تواصل صحيحة تظهر للوسطاء والمشترين.
                          </p>
                       </div>

                       <Button onClick={handleCreateListing} className="w-full h-16 royal-button text-lg mt-4">تأكيد ونشر العرض الآن</Button>
                    </div>
                  </DialogContent>
               </Dialog>
            </div>

            <div className="space-y-10">
              <AnimatePresence>
                {filteredListings?.map((post: any) => (
                  <MarketplacePost key={post.id} post={post} />
                ))}
              </AnimatePresence>
              
              {filteredListings?.length === 0 && (
                <div className="py-48 text-center luxury-card border-dashed border-white/5 opacity-50">
                   <Users size={80} className="mx-auto text-zinc-900 mb-6" />
                   <h3 className="text-2xl font-bold text-zinc-700 uppercase tracking-[0.3em]">بانتظار العروض الأولى..</h3>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
