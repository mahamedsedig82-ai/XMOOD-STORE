
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
    if (!user) return toast({ variant: "destructive", title: "تنبيه", description: "يرجى تسجيل الدخول للتفاعل مع المنشورات." });
    if (!db) return;
    
    const postRef = doc(db, "marketplace_listings", post.id);
    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الإعجاب." });
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
      toast({ title: "تم إضافة التعليق" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إضافة التعليق." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, "community_reports"), {
        reporterId: user.uid,
        reporterName: profile?.displayName || "عضو",
        targetId: post.id,
        targetType: 'post',
        targetContent: post.title,
        reason: "تبليغ عن محتوى مخالف في المجتمع",
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast({ title: "تم استلام البلاغ", description: "سيتم مراجعة المحتوى من قبل المشرفين." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الإرسال" });
    }
  };

  const handleAdminDelete = async () => {
    if (!isAdmin || !db) return;
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    
    try {
      await updateDoc(doc(db, "marketplace_listings", post.id), { status: 'deleted' });
      await addDoc(collection(db, "community_audit_logs"), {
        adminId: profile?.uid,
        adminName: profile?.displayName,
        action: "DELETE_POST",
        targetId: post.id,
        details: `حذف المنشور: ${post.title}`,
        createdAt: new Date().toISOString()
      });
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="luxury-card border-none overflow-hidden hover:bg-zinc-950/5 dark:hover:bg-zinc-950/40 transition-all duration-500 group shadow-lg mb-8">
        {/* Post Header */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
           <div className="flex items-center gap-4">
              <Link href={`/profile/${post.userId}`} className="relative">
                <Avatar className="w-12 h-12 border-2 border-primary/20 hover:border-primary/60 transition-all rounded-xl">
                   <AvatarImage src={post.userPhoto} />
                   <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-primary font-bold">{post.userName?.charAt(0)}</AvatarFallback>
                </Avatar>
                {post.isTrustedUser && <ShieldCheck size={14} className="absolute -bottom-1 -right-1 text-blue-500 bg-white dark:bg-black rounded-full" />}
              </Link>
              <div>
                 <div className="flex items-center gap-2">
                    <Link href={`/profile/${post.userId}`} className="font-bold text-base hover:text-primary transition-colors">{post.userName}</Link>
                    {post.isTrustedUser && <BadgeCheck size={16} className="text-blue-500" />}
                    <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">{post.userLabel}</Badge>
                 </div>
                 <p className="text-[10px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
                   <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                 </p>
              </div>
           </div>
           
           <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-xl"><MoreHorizontal size={20} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border w-48" align="start">
                 <DropdownMenuItem onClick={handleReport} className="cursor-pointer gap-2 text-red-500 focus:bg-red-50 focus:text-red-600">
                    <ShieldAlert size={14} /> إبلاغ عن مخالفة
                 </DropdownMenuItem>
                 {isAdmin && (
                   <DropdownMenuItem onClick={handleAdminDelete} className="cursor-pointer gap-2 text-red-600 font-bold focus:bg-red-50">
                      <Trash2 size={14} /> حذف المنشور (إشراف)
                   </DropdownMenuItem>
                 )}
              </DropdownMenuContent>
           </DropdownMenu>
        </div>

        {/* Post Content */}
        <CardContent className="p-8 space-y-6">
           <div className="space-y-3">
              <div className="flex justify-between items-start">
                 <h3 className="text-2xl font-bold leading-tight">{post.title}</h3>
                 <Badge className="bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border-none px-3 py-1 rounded-full text-[9px] font-bold uppercase">{post.type}</Badge>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.description}</p>
           </div>
           
           {post.price > 0 && (
             <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">القيمة المعروضة</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">{formatUSD(post.price)}</p>
                </div>
                <Button onClick={() => toast({ title: "خدمة الوساطة الموثوقة", description: "تم استلام طلبك، سيقوم وسيط معتمد بالتواصل معك لتأمين الصفقة." })} className="royal-button px-6 h-12 text-[10px] gap-2">
                   <ShieldCheck size={18} /> طلب وسيط معتمد
                </Button>
             </div>
           )}
        </CardContent>

        {/* Post Interactions */}
        <div className="px-8 py-4 bg-muted/10 border-t border-border/50 flex items-center justify-between">
           <div className="flex items-center gap-8">
              <button 
                onClick={handleLike} 
                className={`flex items-center gap-2 transition-all duration-300 font-bold text-sm ${isLiked ? 'text-red-500 scale-105' : 'text-muted-foreground hover:text-red-500'}`}
              >
                 <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                 <span>{likesArray.length}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)} 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-bold text-sm"
              >
                 <MessageSquare size={20} />
                 <span>{post.commentCount || 0}</span>
              </button>
              <button className="text-muted-foreground hover:text-blue-500 transition-all"><Share2 size={20} /></button>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">منشور موثق</span>
           </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-muted/5 border-t border-border overflow-hidden">
              <div className="p-8 space-y-8">
                 {/* New Comment Input */}
                 <div className="flex gap-4">
                    <Avatar className="w-10 h-10 rounded-lg border border-border">
                       <AvatarImage src={profile?.photoURL} />
                       <AvatarFallback className="bg-zinc-100 text-primary font-bold">U</AvatarFallback>
                    </Avatar>
                    <div className="relative flex-1">
                       <Input 
                         value={newComment} 
                         onChange={e => setNewComment(e.target.value)} 
                         onKeyDown={e => e.key === 'Enter' && handleAddComment()} 
                         placeholder="اكتب تعليقك هنا..." 
                         className="h-12 bg-background border-border rounded-xl px-6 font-medium" 
                       />
                       <Button disabled={isSubmitting || !newComment.trim()} onClick={handleAddComment} variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-primary hover:bg-primary/5 rounded-lg">
                         {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={18} className="rtl:rotate-180" />}
                       </Button>
                    </div>
                 </div>

                 {/* Comments List */}
                 <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {comments?.length === 0 && (
                      <p className="text-center py-4 text-xs text-muted-foreground font-medium">كن أول من يعلق على هذا المنشور</p>
                    )}
                    {comments?.map((c: any) => (
                      <div key={c.id} className="flex gap-4 animate-fade-up">
                         <Avatar className="w-8 h-8 rounded-lg border border-border shrink-0">
                            <AvatarImage src={c.userPhoto} />
                            <AvatarFallback>U</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                               <span className="font-bold text-sm">{c.userName}</span>
                               <p className="text-[8px] text-muted-foreground font-mono">{new Date(c.createdAt).toLocaleTimeString('ar-EG')}</p>
                            </div>
                            <div className="text-xs text-muted-foreground bg-background p-3 rounded-xl border border-border font-medium leading-relaxed">
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
