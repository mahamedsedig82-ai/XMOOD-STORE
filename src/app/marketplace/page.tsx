"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, where } from "firebase/firestore";
import { 
  Search, Zap, Plus, 
  Users, Phone, MessageSquare, Send, Filter, Award, ShoppingBag, ShieldCheck, Loader2
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

export default function OpenMarketPage() {
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

  const listingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "marketplace_listings"), 
      where("status", "==", "active"),
      orderBy("createdAt", "desc"), 
      limit(50)
    );
  }, [db]);

  const agentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("isTrusted", "==", true), limit(10));
  }, [db]);

  const { data: listings, loading: listingsLoading } = useCollection(listingsQuery);
  const { data: trustedAgents } = useCollection(agentsQuery);
  
  const handleCreateListing = async () => {
    if (!user || !profile || !db) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى تسجيل الدخول للنشر." });
      return;
    }
    
    if (!listingForm.title || !listingForm.description) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال عنوان ووصف العرض." });
      return;
    }

    try {
      await addDoc(collection(db, "marketplace_listings"), {
        userId: user.uid,
        userName: profile.displayName,
        userPhoto: profile.photoURL || "",
        userLabel: profile.label || "عضو معتمد",
        isTrustedUser: profile.isTrusted || false,
        title: listingForm.title,
        description: listingForm.description,
        price: Number(listingForm.price) || 0,
        type: listingForm.type,
        status: 'active',
        likes: [],
        commentCount: 0,
        createdAt: new Date().toISOString()
      });
      setIsListingOpen(false);
      setListingForm({ title: "", description: "", price: "", type: 'sell', contactMethod: 'whatsapp', contactValue: "" });
      toast({ title: "تم نشر عرضك بنجاح في السوق المفتوح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في النشر" });
    }
  };

  const filteredListings = listings?.filter(l => {
    const title = l.title || "";
    const description = l.description || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || l.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen bg-background text-foreground pb-40" dir="rtl">
      <Navbar />
      
      <section className="pt-48 pb-24 relative border-b bg-muted/20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="url(#grid-modern)" />
           </svg>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
           <Badge className="mb-8 py-2.5 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-sm">
              منصة التداول والخدمات الموثوقة
           </Badge>
           <h1 className="text-6xl md:text-8xl font-headline font-black mb-8 leading-tight tracking-tighter">السوق المفتوح</h1>
           <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed mb-12">
             ساحة آمنة لعرض وطلب الخدمات الرقمية، تواصل مع الخبراء المعتمدين واضمن حقوقك في كل صفقة.
           </p>
           
           <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-4xl mx-auto">
              <div className="relative flex-1 w-full group">
                 <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" size={24} />
                 <Input 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="ابحث عن عروض أو حسابات..." 
                   className="h-16 bg-card border-border rounded-3xl pr-16 text-lg shadow-xl" 
                 />
              </div>
              <Dialog open={isListingOpen} onOpenChange={setIsListingOpen}>
                 <DialogTrigger asChild>
                   <Button className="h-16 px-10 royal-button text-base shadow-primary/20 w-full md:w-auto"><Plus size={24} className="ml-2" /> نشر عرض جديد</Button>
                 </DialogTrigger>
                 <DialogContent className="bg-card border-none rounded-[2.5rem] p-10 max-w-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4"><ShoppingBag size={28} /> إضافة عرض للسوق</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-8 mt-10">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black text-primary uppercase pr-3 tracking-widest">عنوان العرض المختصر</Label>
                          <Input placeholder="مثال: حساب ألعاب مستوى 70..." className="h-14 rounded-2xl bg-muted border-none px-6 font-bold" value={listingForm.title} onChange={e => setListingForm({...listingForm, title: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black text-primary uppercase pr-3 tracking-widest">التفاصيل والوصف</Label>
                          <Textarea placeholder="اشرح كافة تفاصيل عرضك هنا..." className="min-h-[120px] bg-muted border-none rounded-[2rem] p-6 font-medium leading-relaxed" value={listingForm.description} onChange={e => setListingForm({...listingForm, description: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary uppercase pr-3">القيمة المطلوبة (USD)</Label>
                            <Input type="number" placeholder="0.00" className="h-14 rounded-2xl bg-muted border-none px-6 font-black text-xl text-primary" value={listingForm.price} onChange={e => setListingForm({...listingForm, price: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary uppercase pr-3">نوع العملية</Label>
                            <Select onValueChange={(val: any) => setListingForm({...listingForm, type: val})} defaultValue="sell">
                               <SelectTrigger className="h-14 rounded-2xl bg-muted border-none px-6 font-bold">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="sell">عرض بيع</SelectItem>
                                  <SelectItem value="buy">طلب شراء</SelectItem>
                                  <SelectItem value="service">تقديم خدمة</SelectItem>
                               </SelectContent>
                            </Select>
                          </div>
                       </div>
                       <Button onClick={handleCreateListing} className="w-full h-16 royal-button text-lg mt-4 shadow-xl">تأكيد النشر في السوق المفتوح</Button>
                    </div>
                 </DialogContent>
              </Dialog>
           </div>
        </div>
      </section>

      <div className="container mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          <aside className="lg:col-span-1 space-y-10">
            <Card className="luxury-card p-8 border-none sticky top-32">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-8 flex items-center gap-3">
                 <ShieldCheck size={18} className="animate-pulse" /> خبراء معتمدون
               </h5>
               <div className="space-y-6">
                  {trustedAgents?.map((agent: any) => (
                    <Link key={agent.id} href={`/profile/${agent.id}`} className="flex items-center gap-4 group">
                       <Avatar className="w-10 h-10 border border-primary/20 group-hover:border-primary transition-all">
                          <AvatarImage src={agent.photoURL} />
                          <AvatarFallback>XM</AvatarFallback>
                       </Avatar>
                       <div>
                          <p className="font-bold text-sm group-hover:text-primary transition-colors">{agent.displayName}</p>
                          <p className="text-[8px] text-muted-foreground font-black uppercase">{agent.label}</p>
                       </div>
                    </Link>
                  ))}
               </div>
            </Card>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pr-4">تصفية حسب النوع</p>
               {['all', 'sell', 'buy', 'service'].map((type) => (
                 <Button 
                   key={type}
                   onClick={() => setFilterType(type)}
                   variant="ghost" 
                   className={`w-full justify-start h-12 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-primary text-black shadow-lg shadow-primary/10' : 'hover:bg-muted text-muted-foreground'}`}
                 >
                   {type === 'all' ? 'كافة العروض' : type === 'sell' ? 'عروض بيع' : type === 'buy' ? 'طلبات شراء' : 'تقديم خدمات'}
                 </Button>
               ))}
            </div>
          </aside>

          <section className="lg:col-span-3 space-y-8">
             <AnimatePresence>
                {listingsLoading ? (
                   <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></div>
                ) : filteredListings?.map((post: any) => (
                  <MarketplacePost key={post.id} post={post} />
                ))}
                {filteredListings?.length === 0 && !listingsLoading && (
                   <div className="py-40 text-center luxury-card border-dashed opacity-30">
                      <ShoppingBag size={80} className="mx-auto mb-6" />
                      <p className="text-xl font-bold uppercase tracking-widest">لا توجد عروض مطابقة حالياً</p>
                   </div>
                )}
             </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}