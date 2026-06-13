
"use client";

import { useState } from "react";
import { MarketplaceListing } from "@/app/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, orderBy, deleteDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageSquare, Share2, Trash2, ShieldCheck, Send, Loader2, BadgeCheck, Clock, Zap } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    if (!db || !post.id) return null;
    return query(collection(db, "marketplace_listings", post.id, "comments"), orderBy("createdAt", "desc"));
  }, [db, post.id]);

  const { data: comments } = useCollection(commentsQuery);

  const isLiked = user ? post.likes?.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "تنبيه", description: "يجب تسجيل الدخول للتفاعل." });
      return;
    }
    const postRef = doc(db, "marketplace_listings", post.id);
    const data = isLiked ? { likes: arrayRemove(user.uid) } : { likes: arrayUnion(user.uid) };
    
    updateDoc(postRef, data).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: postRef.path,
        operation: 'update',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    const commentData = {
      postId: post.id,
      userId: user.uid,
      userName: profile?.displayName || "عضو",
      userPhoto: profile?.photoURL || "",
      content: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "marketplace_listings", post.id, "comments"), commentData);
      await updateDoc(doc(db, "marketplace_listings", post.id), {
        commentCount: (post.commentCount || 0) + 1
      });
      setNewComment("");
      toast({ title: "تم إضافة التعليق", description: "تعليقك السيادي متاح الآن." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل التعليق", description: "تأكد من صلاحيات حسابك." });
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
      layout
    >
      <Card className="luxury-card border-none overflow-hidden hover:bg-zinc-950 transition-all duration-300 group shadow-2xl mb-8">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Link href={`/profile/${post.userId}`}>
                <Avatar className="w-12 h-12 border-2 border-primary/20 hover:border-primary/50 transition-all">
                   <AvatarImage src={post.userPhoto} />
                   <AvatarFallback className="bg-zinc-900 text-primary font-black">{post.userName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                 <div className="flex items-center gap-2">
                    <Link href={`/profile/${post.userId}`} className="text-lg font-bold text-white hover:text-primary transition-colors">{post.userName}</Link>
                    <BadgeCheck size={16} className="text-blue-500" />
                    <Badge variant="outline" className="border-primary/20 text-primary text-[7px] font-black px-2 py-0.5 rounded-full uppercase">{post.userLabel}</Badge>
                 </div>
                 <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1 flex items-center gap-2">
                   <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                 </p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Badge className="bg-white/5 text-zinc-500 border-white/5 px-4 py-1 rounded-full text-[8px] font-black uppercase">
                 {post.type === 'sell' ? 'بيع' : post.type === 'buy' ? 'شراء' : 'خدمة'}
              </Badge>
              {(user?.uid === post.userId || profile?.role === 'owner') && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl" onClick={handleDeletePost}>
                  <Trash2 size={16} />
                </Button>
              )}
           </div>
        </div>

        <CardContent className="p-8 space-y-6">
           <div className="space-y-3">
              <h3 className="text-2xl font-headline font-bold text-white leading-tight">{post.title}</h3>
              <p className="text-base text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">{post.description}</p>
           </div>
           
           <div className="bg-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5">
              <div className="text-right">
                 <p className="text-[9px] text-zinc-600 font-black uppercase mb-1 flex items-center gap-2 justify-end">السعر المطلوب <Zap size={10} className="text-primary" /></p>
                 <p className="text-4xl font-black text-primary tracking-tighter">{formatUSD(post.price)}</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button onClick={handleRequestMiddleman} className="accent-button h-12 px-8 flex-1 md:flex-none">
                  <ShieldCheck size={18} className="ml-2" /> طلب وسيط
                </Button>
                <Button className="royal-button h-12 px-8 flex-1 md:flex-none">تواصل</Button>
              </div>
           </div>
        </CardContent>

        <div className="px-8 py-4 bg-zinc-950/40 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-8">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all duration-300 font-black text-xs uppercase ${isLiked ? 'text-red-500' : 'text-zinc-600 hover:text-red-500'}`}
              >
                 <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                 <span>{post.likes?.length || 0}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-zinc-600 hover:text-primary transition-all font-black text-xs uppercase"
              >
                 <MessageSquare size={20} />
                 <span>{post.commentCount || 0}</span>
              </button>
              <button className="text-zinc-600 hover:text-blue-400 transition-all">
                 <Share2 size={20} />
              </button>
           </div>
           <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 rounded-full text-[7px] font-black uppercase flex gap-1.5 items-center">
             <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
             متاح
           </Badge>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black/60 border-t border-white/5 overflow-hidden"
            >
              <div className="p-8 space-y-8">
                 <div className="flex gap-4">
                    <Avatar className="w-10 h-10 border border-white/10">
                       <AvatarImage src={profile?.photoURL} />
                       <AvatarFallback className="bg-zinc-900 text-primary">{profile?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="relative flex-1">
                       <Input 
                         value={newComment}
                         onChange={e => setNewComment(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                         placeholder="اكتب تعليقك السيادي هنا..." 
                         className="h-12 bg-zinc-900 border-none rounded-xl px-4 pr-12 text-white font-bold"
                       />
                       <Button 
                         disabled={isSubmitting || !newComment.trim()}
                         onClick={handleAddComment}
                         variant="ghost" 
                         className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-primary hover:bg-primary/10 rounded-lg"
                       >
                         {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={18} className="rtl:rotate-180" />}
                       </Button>
                    </div>
                 </div>

                 <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {comments?.map((c: any) => (
                      <div key={c.id} className="flex gap-4 group">
                         <Avatar className="w-8 h-8 border border-white/5">
                            <AvatarImage src={c.userPhoto} />
                            <AvatarFallback>U</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                               <span className="font-bold text-zinc-300 text-sm">{c.userName}</span>
                               {(user?.uid === c.userId || user?.uid === post.userId) && (
                                 <button onClick={async () => {
                                   await deleteDoc(doc(db, "marketplace_listings", post.id, "comments", c.id));
                                   await updateDoc(doc(db, "marketplace_listings", post.id), { commentCount: (post.commentCount || 1) - 1 });
                                 }} className="text-red-500/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                   <Trash2 size={10} />
                                 </button>
                               )}
                            </div>
                            <p className="text-xs text-zinc-500 bg-white/5 p-3 rounded-xl border border-white/5">{c.content}</p>
                         </div>
                      </div>
                    ))}
                    {comments?.length === 0 && (
                      <p className="text-center text-zinc-700 font-bold text-[10px] uppercase tracking-widest py-6">لا توجد تعليقات</p>
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
