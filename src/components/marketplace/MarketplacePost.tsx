
"use client";

import { useState } from "react";
import { MarketplaceListing, Comment } from "@/app/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, orderBy, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageSquare, Share2, Trash2, ShieldCheck, Send, Loader2, BadgeCheck } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface MarketplacePostProps {
  post: MarketplaceListing;
}

export function MarketplacePost({ post }: MarketplacePostProps) {
  const { user, profile } = useUser();
  const db = useFirestore();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "marketplace_listings", post.id, "comments"), orderBy("createdAt", "desc"));
  }, [db, post.id]);

  const { data: comments } = useCollection(commentsQuery);

  const isLiked = user ? post.likes?.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) {
      toast({ title: "تنبيه", description: "يجب تسجيل الدخول للتفاعل." });
      return;
    }
    const postRef = doc(db, "marketplace_listings", post.id);
    try {
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid) });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "marketplace_listings", post.id, "comments"), {
        postId: post.id,
        userId: user.uid,
        userName: profile?.displayName || "User",
        userPhoto: profile?.photoURL || "",
        content: newComment,
        createdAt: new Date().toISOString()
      });
      await updateDoc(doc(db, "marketplace_listings", post.id), {
        commentCount: (post.commentCount || 0) + 1
      });
      setNewComment("");
      toast({ title: "تم إضافة التعليق" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التعليق" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user || (user.uid !== post.userId && profile?.role !== 'owner')) return;
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    try {
      await deleteDoc(doc(db, "marketplace_listings", post.id));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  const handleRequestMiddleman = () => {
    toast({ title: "طلب وساطة", description: "سيقوم وسيط معتمد بالتواصل معك ومع البائع فوراً." });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      viewport={{ once: true }}
    >
      <Card className="luxury-card border-none overflow-hidden hover:bg-zinc-950 transition-all duration-300 group shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-5">
              <Link href={`/profile/${post.userId}`}>
                <Avatar className="w-14 h-14 border-2 border-primary/20 hover:border-primary/50 transition-all shadow-xl">
                   <AvatarImage src={post.userPhoto} />
                   <AvatarFallback className="bg-zinc-900 text-primary font-black">XM</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                 <div className="flex items-center gap-2">
                    <Link href={`/profile/${post.userId}`} className="text-xl font-bold text-white hover:text-primary transition-colors">{post.userName}</Link>
                    <BadgeCheck size={18} className="text-blue-500" />
                    <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest">{post.userLabel}</Badge>
                 </div>
                 <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1 flex items-center gap-2">
                   <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                 </p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Badge className="bg-white/5 text-zinc-500 border-white/5 px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                 {post.type === 'sell' ? 'عرض بيع حصري' : post.type === 'buy' ? 'طلب شراء عاجل' : 'خدمة احترافية'}
              </Badge>
              {(user?.uid === post.userId || profile?.role === 'owner') && (
                <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl" onClick={handleDeletePost}>
                  <Trash2 size={18} />
                </Button>
              )}
           </div>
        </div>

        {/* Content */}
        <CardContent className="p-10 space-y-8">
           <div className="space-y-4">
              <h3 className="text-3xl font-headline font-bold text-white leading-tight">{post.title}</h3>
              <p className="text-lg text-zinc-400 font-light leading-relaxed whitespace-pre-wrap max-w-4xl">{post.description}</p>
           </div>
           
           <div className="bg-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-3xl rounded-full" />
              <div className="text-right z-10">
                 <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-2 flex items-center gap-2 justify-end">
                   السعر المطلوب <Zap size={10} className="text-primary" />
                 </p>
                 <p className="text-5xl font-black text-primary tracking-tighter leading-none">{formatUSD(post.price)}</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto z-10">
                <Button onClick={handleRequestMiddleman} className="accent-button h-14 px-10 flex-1 md:flex-none">
                  <ShieldCheck size={20} className="ml-3" /> طلب وسيط
                </Button>
                <Button className="royal-button h-14 px-10 flex-1 md:flex-none shadow-primary/20">تواصل مباشر</Button>
              </div>
           </div>
        </CardContent>

        {/* Footer Actions */}
        <div className="px-10 py-6 bg-zinc-950/40 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-10">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-3 transition-all duration-300 font-black text-sm uppercase tracking-widest ${isLiked ? 'text-red-500' : 'text-zinc-600 hover:text-red-500'}`}
              >
                 <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                 <span>{post.likes?.length || 0}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-3 text-zinc-600 hover:text-primary transition-all font-black text-sm uppercase tracking-widest"
              >
                 <MessageSquare size={24} />
                 <span>{post.commentCount || 0}</span>
              </button>
              <button className="flex items-center gap-3 text-zinc-600 hover:text-blue-400 transition-all font-black text-sm uppercase tracking-widest">
                 <Share2 size={24} />
              </button>
           </div>
           {post.status === 'active' && (
             <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex gap-2 items-center">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               متاح للتداول
             </Badge>
           )}
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black/60 border-t border-white/5 overflow-hidden"
            >
              <div className="p-10 space-y-10">
                 {/* Input */}
                 <div className="flex gap-5">
                    <Avatar className="w-12 h-12 border border-white/10">
                       <AvatarImage src={profile?.photoURL} />
                       <AvatarFallback className="bg-zinc-900 text-primary">XM</AvatarFallback>
                    </Avatar>
                    <div className="relative flex-1">
                       <Input 
                         value={newComment}
                         onChange={e => setNewComment(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                         placeholder="اكتب تعليقك السيادي هنا..." 
                         className="h-14 bg-zinc-900 border-none rounded-2xl px-6 pr-14 text-white font-bold"
                       />
                       <Button 
                         disabled={isSubmitting || !newComment.trim()}
                         onClick={handleAddComment}
                         variant="ghost" 
                         className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-primary hover:bg-primary/10 rounded-xl"
                       >
                         {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={20} className="rtl:rotate-180" />}
                       </Button>
                    </div>
                 </div>

                 {/* Comments List */}
                 <div className="space-y-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {comments?.map((c: any) => (
                      <div key={c.id} className="flex gap-5 group">
                         <Avatar className="w-10 h-10 border border-white/5">
                            <AvatarImage src={c.userPhoto} />
                            <AvatarFallback>U</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <span className="font-bold text-zinc-300">{c.userName}</span>
                                  <span className="text-[8px] text-zinc-700 font-bold uppercase">{new Date(c.createdAt).toLocaleDateString('ar-EG')}</span>
                               </div>
                               {(user?.uid === c.userId || user?.uid === post.userId) && (
                                 <button onClick={async () => {
                                   await deleteDoc(doc(db, "marketplace_listings", post.id, "comments", c.id));
                                   await updateDoc(doc(db, "marketplace_listings", post.id), { commentCount: (post.commentCount || 1) - 1 });
                                 }} className="text-red-500/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                   <Trash2 size={12} />
                                 </button>
                               )}
                            </div>
                            <p className="text-sm text-zinc-500 bg-white/5 p-4 rounded-2xl rounded-tr-none font-medium leading-relaxed border border-white/5">{c.content}</p>
                         </div>
                      </div>
                    ))}
                    {comments?.length === 0 && (
                      <p className="text-center text-zinc-700 font-bold text-xs uppercase tracking-widest py-10">لا توجد تعليقات بعد</p>
                    )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
