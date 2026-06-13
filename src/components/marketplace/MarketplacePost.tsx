
"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, orderBy, deleteDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Heart, MessageSquare, Share2, Trash2, ShieldCheck, Send, Loader2, 
  BadgeCheck, Clock, Zap, Phone, AtSign, Copy, ExternalLink, ShieldAlert,
  MoreVertical, MoreHorizontal
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
    return query(collection(db, "marketplace_listings", post.id, "comments"), orderBy("createdAt", "desc"));
  }, [db, post.id]);

  const { data: comments } = useCollection(commentsQuery);

  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = user ? likesArray.includes(user.uid) : false;

  const handleLike = () => {
    if (!user) return toast({ variant: "destructive", title: "سجل دخولك أولاً" });
    const postRef = doc(db, "marketplace_listings", post.id);
    updateDoc(postRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  const handleReport = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "community_reports"), {
        reporterId: user.uid,
        reporterName: profile?.displayName || "عضو",
        targetId: post.id,
        targetType: 'post',
        targetContent: post.title,
        reason: "تبليغ مستخدم عن محتوى مخالف",
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast({ title: "تم إرسال البلاغ", description: "سيتم مراجعة المحتوى من قبل المشرفين فوراً." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الإرسال" });
    }
  };

  const handleAdminDelete = async () => {
    if (!isAdmin) return;
    if (confirm("هل تود حذف هذا المنشور إدارياً؟")) {
      await updateDoc(doc(db, "marketplace_listings", post.id), { status: 'deleted' });
      await addDoc(collection(db, "community_audit_logs"), {
        adminId: profile?.uid,
        adminName: profile?.displayName,
        action: "ADMIN_DELETE_POST",
        targetId: post.id,
        details: `حذف المنشور: ${post.title}`,
        createdAt: new Date().toISOString()
      });
      toast({ title: "تم الحذف الإداري" });
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || isSubmitting) return;
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="luxury-card border-none overflow-hidden hover:bg-zinc-950 transition-all duration-500 group shadow-2xl mb-10">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-6">
              <Link href={`/profile/${post.userId}`} className="relative">
                <Avatar className="w-14 h-14 border-2 border-primary/20 hover:border-primary/60 transition-all rounded-2xl">
                   <AvatarImage src={post.userPhoto} />
                   <AvatarFallback className="bg-zinc-900 text-primary font-black">{post.userName?.charAt(0)}</AvatarFallback>
                </Avatar>
                {post.isTrustedUser && <ShieldCheck size={16} className="absolute -bottom-1 -right-1 text-blue-500 bg-black rounded-full" />}
              </Link>
              <div>
                 <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.userId}`} className="text-xl font-headline font-bold text-white hover:text-primary transition-colors">{post.userName}</Link>
                    {post.isTrustedUser && <BadgeCheck size={18} className="text-blue-500" />}
                    <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black px-3 py-0.5 rounded-full uppercase tracking-tighter">{post.userLabel}</Badge>
                 </div>
                 <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1 flex items-center gap-2">
                   <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                 </p>
              </div>
           </div>
           
           <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-xl"><MoreHorizontal size={24} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-950 border-white/10 text-white w-48">
                 <DropdownMenuItem onClick={handleReport} className="cursor-pointer gap-3 text-red-400 focus:bg-red-500/10 focus:text-red-500">
                    <ShieldAlert size={16} /> إبلاغ عن محتوى
                 </DropdownMenuItem>
                 {isAdmin && (
                   <DropdownMenuItem onClick={handleAdminDelete} className="cursor-pointer gap-3 text-red-600 font-bold focus:bg-red-600/10">
                      <Trash2 size={16} /> حذف إداري (Audit)
                   </DropdownMenuItem>
                 )}
              </DropdownMenuContent>
           </DropdownMenu>
        </div>

        <CardContent className="p-10 space-y-8">
           <div className="space-y-4">
              <div className="flex justify-between items-start">
                 <h3 className="text-3xl font-headline font-bold text-white leading-tight">{post.title}</h3>
                 <Badge className="bg-zinc-900 text-zinc-500 border border-white/5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{post.type}</Badge>
              </div>
              <p className="text-lg text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">{post.description}</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center">
                 <p className="text-[10px] text-zinc-600 font-black uppercase mb-2 flex items-center gap-2">قيمة العرض المتوقعة <Zap size={12} className="text-primary animate-pulse" /></p>
                 <p className="text-5xl font-black text-primary tracking-tighter">{formatUSD(post.price || 0)}</p>
              </div>
              
              <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 flex flex-col justify-center text-center">
                 <Button onClick={() => toast({ title: "فتح غرفة عمليات", description: "سيقوم وسيط موثق بتأمين هذه الصفقة فوراً." })} className="royal-button w-full h-16 text-xs gap-4 shadow-xl">
                   <ShieldCheck size={24} /> طلب وساطة النخبة لهذه الصفقة
                 </Button>
                 <p className="text-[8px] text-zinc-600 font-bold uppercase mt-4 italic">* نضمن حقك عبر نظام الوساطة السيادي لـ XMOOD.</p>
              </div>
           </div>
        </CardContent>

        <div className="px-10 py-6 bg-zinc-950/60 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-12">
              <button onClick={handleLike} className={`flex items-center gap-3 transition-all duration-300 font-black text-xs uppercase ${isLiked ? 'text-red-500 scale-110' : 'text-zinc-600 hover:text-red-500'}`}>
                 <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                 <span>{likesArray.length}</span>
              </button>
              <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-3 text-zinc-600 hover:text-primary transition-all font-black text-xs uppercase">
                 <MessageSquare size={24} />
                 <span>{post.commentCount || 0}</span>
              </button>
              <button className="text-zinc-600 hover:text-blue-400 transition-all"><Share2 size={24} /></button>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Verified Listing</span>
           </div>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/80 border-t border-white/5 overflow-hidden">
              <div className="p-10 space-y-10">
                 <div className="flex gap-6">
                    <Avatar className="w-12 h-12 rounded-xl border border-white/10 shadow-2xl">
                       <AvatarImage src={profile?.photoURL} />
                       <AvatarFallback className="bg-zinc-900 text-primary">U</AvatarFallback>
                    </Avatar>
                    <div className="relative flex-1">
                       <Input 
                         value={newComment} 
                         onChange={e => setNewComment(e.target.value)} 
                         onKeyDown={e => e.key === 'Enter' && handleAddComment()} 
                         placeholder="أضف تعليقك السيادي.." 
                         className="h-16 bg-zinc-900 border-none rounded-[1.5rem] px-8 text-white font-bold text-lg" 
                       />
                       <Button disabled={isSubmitting || !newComment.trim()} onClick={handleAddComment} variant="ghost" className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-primary hover:bg-primary/10 rounded-xl">
                         {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={24} className="rtl:rotate-180" />}
                       </Button>
                    </div>
                 </div>

                 <div className="space-y-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                    {comments?.map((c: any) => (
                      <div key={c.id} className="flex gap-6 group animate-fade-up">
                         <Avatar className="w-10 h-10 rounded-lg border border-white/5">
                            <AvatarImage src={c.userPhoto} />
                            <AvatarFallback>U</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                               <span className="font-bold text-zinc-300 text-base">{c.userName}</span>
                               <p className="text-[8px] text-zinc-600 font-mono opacity-40">{new Date(c.createdAt).toLocaleTimeString('ar-EG')}</p>
                            </div>
                            <p className="text-sm text-zinc-400 bg-white/5 p-4 rounded-2xl border border-white/5 font-medium leading-relaxed">{c.content}</p>
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
