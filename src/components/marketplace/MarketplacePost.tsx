"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Heart, MessageSquare, Share2, Trash2, ShieldCheck, Send, Loader2, 
  BadgeCheck, Clock, Zap, ShieldAlert, MoreHorizontal
} from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MarketplacePostProps {
  post: any;
}

export function MarketplacePost({ post }: MarketplacePostProps) {
  const { user, profile } = useUser();
  const db = useFirestore();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = ['owner', 'admin', 'community_admin', 'community_mod'].includes(profile?.role || '');

  const commentsQuery = useMemoFirebase(() => {
    if (!db || !post.id) return null;
    return query(collection(db, "marketplace_listings", post.id, "comments"), orderBy("createdAt", "asc"));
  }, [db, post.id]);

  const { data: comments } = useCollection(commentsQuery);

  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = user ? likesArray.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) return toast({ variant: "destructive", title: "تنبيه", description: "يرجى تسجيل الدخول للتفاعل." });
    if (!db) return;
    
    const postRef = doc(db, "marketplace_listings", post.id);
    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث التفاعل." });
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || isSubmitting || !db) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "marketplace_listings", post.id, "comments"), {
        postId: post.id,
        userId: user.uid,
        userName: profile?.displayName || "عضو",
        userPhoto: profile?.photoURL || "",
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      });
      await updateDoc(doc(db, "marketplace_listings", post.id), {
        commentCount: (post.commentCount || 0) + 1
      });
      setNewComment("");
      toast({ title: "تم نشر التعليق" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إضافة التعليق." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="luxury-card mb-10">
        {/* Post Header */}
        <div className="p-8 border-b flex items-center justify-between bg-muted/10">
           <div className="flex items-center gap-5">
              <Link href={`/profile/${post.userId}`} className="relative">
                <Avatar className="w-14 h-14 border-2 border-primary/20 rounded-2xl shadow-lg">
                   <AvatarImage src={post.userPhoto} />
                   <AvatarFallback className="bg-muted text-primary font-black">XM</AvatarFallback>
                </Avatar>
                {post.isTrustedUser && <BadgeCheck size={16} className="absolute -bottom-1 -right-1 text-primary bg-background rounded-full p-0.5" />}
              </Link>
              <div>
                 <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.userId}`} className="font-black text-lg hover:gold-text transition-all">{post.userName}</Link>
                    <Badge variant="secondary" className="text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{post.userLabel}</Badge>
                 </div>
                 <p className="text-[10px] text-muted-foreground font-black mt-1 flex items-center gap-2">
                   <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                 </p>
              </div>
           </div>
           
           <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal size={20} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-2xl p-2 glass-morphism">
                 <DropdownMenuItem className="gap-3 font-bold text-xs text-red-500 cursor-pointer rounded-xl">
                    <ShieldAlert size={16} /> إبلاغ عن محتوى
                 </DropdownMenuItem>
                 {isAdmin && (
                   <DropdownMenuItem className="gap-3 font-black text-xs text-red-600 cursor-pointer rounded-xl hover:bg-red-50">
                      <Trash2 size={16} /> حذف إداري فوري
                   </DropdownMenuItem>
                 )}
              </DropdownMenuContent>
           </DropdownMenu>
        </div>

        {/* Post Content */}
        <CardContent className="p-10 space-y-8">
           <div className="space-y-4">
              <div className="flex justify-between items-start">
                 <h3 className="text-3xl font-black leading-tight">{post.title}</h3>
                 <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{post.type}</Badge>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">{post.description}</p>
           </div>
           
           {post.price > 0 && (
             <div className="bg-secondary p-8 rounded-3xl border flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">قيمة العرض المقترحة</p>
                  <p className="text-4xl font-black text-primary tracking-tighter">{formatUSD(post.price)}</p>
                </div>
                <Button className="royal-button h-14">طلب وسيط معتمد</Button>
             </div>
           )}
        </CardContent>

        {/* Interactions */}
        <div className="px-10 py-6 border-t flex items-center justify-between">
           <div className="flex items-center gap-10">
              <button 
                onClick={handleLike} 
                className={`flex items-center gap-3 font-black transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-muted-foreground hover:text-red-500'}`}
              >
                 <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                 <span className="text-lg">{likesArray.length}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)} 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary font-black transition-all"
              >
                 <MessageSquare size={24} />
                 <span className="text-lg">{post.commentCount || 0}</span>
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-all"><Share2 size={24} /></button>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">منشور موثق من العضو</span>
           </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-muted/30 border-t overflow-hidden">
              <div className="p-10 space-y-10">
                 <div className="flex gap-5">
                    <Avatar className="w-12 h-12 rounded-2xl shadow-md">
                       <AvatarImage src={profile?.photoURL} />
                       <AvatarFallback className="bg-primary text-black font-black">U</AvatarFallback>
                    </Avatar>
                    <div className="relative flex-1">
                       <Input 
                         value={newComment} 
                         onChange={e => setNewComment(e.target.value)} 
                         onKeyDown={e => e.key === 'Enter' && handleAddComment()} 
                         placeholder="شارك برأيك في هذا العرض..." 
                         className="h-14 bg-background rounded-2xl px-8 font-bold border-none shadow-sm" 
                       />
                       <Button disabled={isSubmitting || !newComment.trim()} onClick={handleAddComment} variant="ghost" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary hover:bg-primary/5 rounded-xl h-10 w-10 p-0">
                         {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={22} className="rtl:rotate-180" />}
                       </Button>
                    </div>
                 </div>

                 <div className="space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                    {comments?.map((c: any) => (
                      <div key={c.id} className="flex gap-5 animate-fade-up">
                         <Avatar className="w-10 h-10 rounded-xl shrink-0">
                            <AvatarImage src={c.userPhoto} />
                            <AvatarFallback>U</AvatarFallback>
                         </Avatar>
                         <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                               <span className="font-black text-sm">{c.userName}</span>
                               <span className="text-[9px] text-muted-foreground font-black">{new Date(c.createdAt).toLocaleTimeString('ar-EG')}</span>
                            </div>
                            <div className="text-sm font-medium text-muted-foreground bg-background p-5 rounded-[1.5rem] shadow-sm leading-relaxed border">
                               {c.content}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
