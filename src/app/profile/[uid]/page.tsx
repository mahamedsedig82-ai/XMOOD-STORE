
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { doc, query, collection, where, orderBy, limit } from "firebase/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Award, Zap, ShieldCheck, TrendingUp, MessageSquare, Heart, Box } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { MarketplacePost } from "@/components/marketplace/MarketplacePost";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PublicProfilePage() {
  const params = useParams();
  const uid = params.uid as string;
  const db = useFirestore();
  const { user: currentUser } = useUser();

  const userRef = useMemoFirebase(() => doc(db, "users", uid), [db, uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const userPostsQuery = useMemoFirebase(() => {
    if (!db || !uid) return null;
    return query(collection(db, "marketplace_listings"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(20));
  }, [db, uid]);

  const { data: userPosts, loading: postsLoading } = useCollection(userPostsQuery);

  if (profileLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={60} />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <h1 className="text-4xl font-headline font-bold gold-text">المستخدم غير موجود</h1>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <Navbar />
      
      {/* Sovereign Header */}
      <section className="relative pt-48 pb-20 overflow-hidden border-b border-white/5 bg-zinc-950/40">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#grid-v6)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
             <Avatar className="w-48 h-48 border-4 border-primary/20 shadow-[0_0_80px_rgba(212,175,55,0.15)] rounded-[3rem]">
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback className="bg-zinc-900 text-6xl text-primary font-black">{profile.displayName?.charAt(0)}</AvatarFallback>
             </Avatar>
             <div className="absolute -bottom-4 -right-4 bg-primary text-black p-4 rounded-2xl border-4 border-black shadow-2xl">
                <Award size={32} />
             </div>
          </div>

          <div className="text-center md:text-right flex-1 space-y-6">
             <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                   <h1 className="text-5xl md:text-7xl font-headline font-bold gold-text leading-tight">{profile.displayName}</h1>
                   <Badge className="bg-red-600/20 text-red-500 border-red-600/30 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{profile.role}</Badge>
                </div>
                <p className="text-xl text-zinc-500 font-light max-w-2xl">{profile.bio || "عضو سيادي في مجتمع XMOOD STORE الموثق."}</p>
             </div>

             <div className="flex flex-wrap justify-center md:justify-start gap-8">
                <div className="flex items-center gap-3 text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                   <Calendar size={16} className="text-primary" /> عضو منذ {new Date(profile.createdAt).getFullYear()}
                </div>
                <div className="flex items-center gap-3 text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                   <ShieldCheck size={16} className="text-green-500" /> هوية موثقة سيادياً
                </div>
             </div>
          </div>

          <Card className="w-full md:w-80 luxury-card p-10 bg-primary/5 border-primary/10">
             <div className="space-y-8">
                <div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                     <TrendingUp size={12} /> سمعة المتداول
                   </p>
                   <p className="text-4xl font-black text-white">{profile.affinityPoints || 0}</p>
                   <p className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Sovereign Points</p>
                </div>
                <div className="h-px bg-white/5" />
                <div>
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">عمليات ناجحة</p>
                   <p className="text-4xl font-black text-white">{profile.completedDeals || 0}</p>
                   <p className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Confirmed Deals</p>
                </div>
             </div>
          </Card>
        </div>
      </section>

      {/* Profile Tabs & Activity */}
      <section className="container mx-auto px-6 py-20">
         <Tabs defaultValue="posts" className="space-y-12">
            <TabsList className="bg-zinc-950 p-2 rounded-3xl h-20 border border-white/5 inline-flex gap-2 px-4 shadow-2xl">
               <TabsTrigger value="posts" className="rounded-2xl px-10 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Box size={16} className="ml-2" /> العروض النشطة ({userPosts?.length || 0})
               </TabsTrigger>
               <TabsTrigger value="activity" className="rounded-2xl px-10 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                  <Zap size={16} className="ml-2" /> النشاط الأخير
               </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-10">
               {postsLoading ? (
                 <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
               ) : userPosts && userPosts.length > 0 ? (
                 <div className="grid grid-cols-1 gap-10">
                    {userPosts.map((post: any) => (
                      <MarketplacePost key={post.id} post={post} />
                    ))}
                 </div>
               ) : (
                 <div className="py-40 text-center luxury-card border-dashed border-white/5 opacity-50">
                    <Box size={80} className="mx-auto text-zinc-900 mb-6" />
                    <p className="text-2xl font-bold text-zinc-700 uppercase tracking-[0.3em]">لا توجد عروض حالياً</p>
                 </div>
               )}
            </TabsContent>

            <TabsContent value="activity">
               <Card className="luxury-card p-10 bg-zinc-950/40">
                  <div className="space-y-10">
                     {[
                       { icon: Heart, label: "قام بالإعجاب بعرض شحن UC", date: "منذ ساعتين", color: "text-red-500" },
                       { icon: MessageSquare, label: "علق على عرض حساب فورتنايت", date: "منذ 5 ساعات", color: "text-primary" },
                       { icon: ShieldCheck, label: "أتم عملية وساطة بنجاح", date: "أمس", color: "text-green-500" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-6 group">
                          <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${item.color} border border-white/5 group-hover:border-current transition-all`}>
                             <item.icon size={24} />
                          </div>
                          <div>
                             <p className="text-xl font-bold text-white mb-1">{item.label}</p>
                             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{item.date}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </Card>
            </TabsContent>
         </Tabs>
      </section>
    </main>
  );
}
