
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, 
  ShieldCheck, 
  History, 
  Copy, 
  Loader2, 
  ArrowRightLeft, 
  Zap, 
  UserCheck, 
  Smartphone, 
  Settings, 
  Camera, 
  Building2, 
  CreditCard, 
  Bitcoin, 
  HelpCircle,
  Award,
  TrendingUp,
  CheckCircle,
  Mail,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy, doc, updateDoc, addDoc, where, limit } from "firebase/firestore";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function SovereignWalletPage() {
  const { profile, user, loading: userLoading, isVerified } = useUser();
  const db = useFirestore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [agentReason, setAgentReason] = useState("");
  const [agentExperience, setAgentExperience] = useState("");
  const [isSubmittingAgent, setIsSubmittingAgent] = useState(false);

  useEffect(() => {
    if (profile) {
      setNewDisplayName(profile.displayName || "");
      setNewPhone(profile.phoneNumber || "");
      setNewPhotoURL(profile.photoURL || "");
    }
  }, [profile]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(50));
  }, [user, db]);

  const agentRequestQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, "agent_requests"), where("userId", "==", user.uid), limit(1));
  }, [user, db]);

  const { data: transactions, loading: transLoading } = useCollection(transactionsQuery);
  const { data: agentRequests } = useCollection(agentRequestQuery);
  const currentAgentRequest = agentRequests?.[0];

  const handleUpdateProfile = async () => {
    if (!user || !db) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: newDisplayName,
        phoneNumber: newPhone,
        photoURL: newPhotoURL,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
      toast({ title: "تم التحديث" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAgentRequest = async () => {
    if (!user || !db || !agentReason.trim()) return;
    setIsSubmittingAgent(true);
    try {
      await addDoc(collection(db, "agent_requests"), {
        userId: user.uid,
        userName: profile?.displayName || "عضو",
        userEmail: user.email,
        reason: agentReason,
        experience: agentExperience,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setIsAgentDialogOpen(false);
      toast({ title: "تم إرسال الطلب", description: "طلبك قيد المراجعة حالياً." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    } finally {
      setIsSubmittingAgent(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ" });
  };

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
    </div>
  );

  const balance = profile?.walletBalance || 0;

  const paymentMethods = [
    { name: "بنكك (Bankak)", icon: Building2, desc: "التحويل المحلي في السودان.", color: "text-green-500" },
    { name: "Binance (USDT)", icon: Bitcoin, desc: "شحن عالمي عبر الكريبتو.", color: "text-yellow-500" },
    { name: "فوري (Fawry)", icon: CreditCard, desc: "شبكة فوري المصرية.", color: "text-blue-500" },
    { name: "ماي سوداني", icon: Smartphone, desc: "الدفع عبر الرصيد.", color: "text-red-500" }
  ];

  return (
    <main className="min-h-screen bg-black text-white pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-24 md:py-32 max-w-6xl animate-fade-in">
        
        {/* Profile Card */}
        <Card className="luxury-card border-none overflow-hidden mb-8 md:mb-12 p-6 md:p-16 relative bg-zinc-950/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-primary to-red-600" />
          
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-right flex-1">
              <div className="relative group cursor-pointer" onClick={() => setIsEditing(!isEditing)}>
                <Avatar className="w-28 h-28 md:w-40 md:h-40 rounded-2xl md:rounded-[3.5rem] border-4 border-primary/20 shadow-2xl overflow-hidden transition-all group-hover:border-primary/50">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-zinc-900 text-primary text-4xl md:text-5xl font-black">
                    {profile?.displayName?.charAt(0) || "X"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-black p-2 md:p-3 rounded-xl border-2 border-black shadow-2xl">
                  <Award size={18} className="md:w-6 md:h-6" />
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <h1 className="text-3xl md:text-6xl font-headline font-bold gold-text mb-2 leading-tight">{profile?.displayName}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="bg-red-600/20 text-red-500 border-red-600/30 px-4 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest">{profile?.role}</Badge>
                    <Badge variant="outline" className="border-primary/20 text-primary text-[8px] md:text-[9px] px-4 py-1 font-black uppercase tracking-widest">{profile?.label || "MEMBER"}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <Mail size={14} className="text-red-500" />
                    <span className="text-[10px] md:text-xs font-bold text-zinc-400 truncate max-w-[120px]">{profile?.email}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <Smartphone size={14} className="text-primary" />
                    <span className="text-[10px] md:text-xs font-bold text-zinc-400">{profile?.phoneNumber || "رقم مفقود"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-64">
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="h-12 md:h-14 rounded-xl border-white/10 bg-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-widest gap-2">
                <Settings size={16} /> {isEditing ? "إلغاء التعديل" : "تعديل الهوية"}
              </Button>
              <Button asChild className="royal-button h-14 md:h-18 px-6 text-sm md:text-base">
                <Link href="/wallet/transfer"><ArrowRightLeft className="ml-2 md:ml-4" size={20} /> تحويل رصيد</Link>
              </Button>
              {!currentAgentRequest && profile?.role !== 'agent' && (
                <Button onClick={() => setIsAgentDialogOpen(true)} variant="ghost" className="text-zinc-500 hover:text-primary text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                   طلب رتبة وكيل
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-8 pt-8 border-t border-white/5 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-zinc-500 pr-2">الاسم السيادي</label>
                    <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-12 bg-black border-primary/20 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-zinc-500 pr-2">رقم الهاتف الدولي</label>
                    <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-12 bg-black border-primary/20 rounded-xl font-bold text-left" placeholder="+966" />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase text-zinc-500 pr-2">رابط الصورة الشخصية</label>
                    <Input value={newPhotoURL} onChange={e => setNewPhotoURL(e.target.value)} placeholder="https://..." className="h-12 bg-black border-primary/20 rounded-xl" />
                  </div>
                </div>
                <Button onClick={handleUpdateProfile} disabled={isUpdating} className="royal-button h-12 px-10 text-xs">
                  {isUpdating ? <Loader2 className="animate-spin" /> : "حفظ التغييرات"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
        
        {/* Balance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 mb-12">
          <Card className="luxury-card border-none relative overflow-hidden p-8 md:p-12 bg-zinc-950 min-h-[250px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
            <div className="relative z-10 text-center md:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-6 flex items-center justify-center md:justify-start gap-2">
                <TrendingUp size={14} /> الرصيد الكلي
              </p>
              <div className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-none">{formatUSD(balance)}</div>
              <div className="text-sm md:text-base font-bold text-zinc-500 bg-white/5 inline-block px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
                {formatSDG(balance)}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 bg-zinc-950">
            <div className="flex-1 space-y-6 text-center md:text-right">
               <h3 className="text-2xl md:text-3xl font-bold gold-text flex items-center justify-center md:justify-start gap-3">
                  <Zap size={24} className="animate-pulse" /> بروتوكول الشحن
               </h3>
               <p className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
                 استخدم معرفك السيادي (UID) الموضح أدناه لتزويد محفظتك بالرصيد عبر وكلائنا المعتمدين فوراً.
               </p>
               <div className="bg-black px-6 py-4 rounded-2xl border border-dashed border-primary/30 flex items-center justify-between gap-4 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => copyToClipboard(user?.uid || "")}>
                  <div className="flex flex-col text-right">
                    <span className="text-[7px] text-zinc-600 font-black uppercase mb-1">SOVEREIGN UID</span>
                    <span className="font-mono font-black text-sm md:text-lg text-primary tracking-widest uppercase truncate max-w-[200px] md:max-w-none">{user?.uid}</span>
                  </div>
                  <Copy size={20} className="text-zinc-700 group-hover:text-primary shrink-0" />
               </div>
            </div>
            
            <div className="w-full md:w-56 p-8 bg-black/60 rounded-3xl text-center border border-white/5 flex flex-col items-center justify-center gap-4">
              {isVerified ? (
                <CheckCircle size={56} className="text-green-500" />
              ) : (
                <ShieldCheck size={56} className="text-red-500 animate-pulse" />
              )}
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">حالة التوثيق</p>
                <Badge className={`px-4 py-1 rounded-full font-black text-[8px] uppercase tracking-widest ${isVerified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Financial History */}
        <Card className="luxury-card border-none overflow-hidden bg-zinc-950/40">
          <CardHeader className="p-6 md:p-10 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl md:text-3xl font-bold flex items-center gap-3 md:gap-5">
              <History size={24} className="md:w-8 md:h-8 text-red-600" /> سجل التدفقات المالية
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[8px] font-black px-4 py-1.5 rounded-full">Live Sovereign Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px] custom-scrollbar">
              <div className="md:hidden space-y-2 p-4">
                {transactions?.map((t: any) => (
                  <div key={t.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-bold text-[11px] text-zinc-200 line-clamp-1">{t.description}</p>
                      <p className="text-[8px] text-zinc-500 font-bold">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="text-left">
                       <p className={`font-black text-lg ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                         {t.type === 'deposit' || t.type === 'transfer_receive' ? '+' : '-'}${t.amount}
                       </p>
                       <Badge className="text-[6px] px-2 py-0">{t.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Table className="hidden md:table">
                <TableHeader className="bg-black/60 sticky top-0 z-20 border-b border-white/5">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-right py-6 pr-10 font-black uppercase text-[10px] text-zinc-500">العملية</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500">التصنيف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500">المبلغ</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500 pr-10">التوقيت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : transactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5 group">
                      <TableCell className="py-6 pr-10 font-bold text-sm text-zinc-200">{t.description}</TableCell>
                      <TableCell><Badge className="text-[8px] font-black uppercase">{t.type}</Badge></TableCell>
                      <TableCell className={`font-black text-xl ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-[10px] font-bold pr-10">{new Date(t.createdAt).toLocaleString('ar-EG')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Agent Request Dialog */}
      <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
        <DialogContent className="bg-zinc-950 border border-primary/20 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-headline font-bold gold-text flex items-center gap-4">
              <UserCheck className="text-primary" /> طلب رتبة وكيل
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-bold mt-2">انضم لنخبة وكلاء XMOOD الرسميين.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
             <div className="space-y-2">
                <label className="text-[9px] font-bold text-primary uppercase pr-2">الاسم الكامل</label>
                <Input value={profile?.fullName || ""} disabled className="bg-zinc-900 border-none rounded-xl" />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-bold text-primary uppercase pr-2">لماذا تود الانضمام؟</label>
                <Textarea value={agentReason} onChange={e => setAgentReason(e.target.value)} placeholder="اشرح لنا..." className="bg-zinc-900 border-none rounded-xl min-h-[100px] p-4" />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-bold text-primary uppercase pr-2">الخبرات السابقة</label>
                <Textarea value={agentExperience} onChange={e => setAgentExperience(e.target.value)} placeholder="اذكر خبراتك..." className="bg-zinc-900 border-none rounded-xl min-h-[80px] p-4" />
             </div>
          </div>
          <DialogFooter className="mt-8">
             <Button onClick={handleAgentRequest} disabled={isSubmittingAgent} className="royal-button w-full h-14 md:h-16 text-lg">
                {isSubmittingAgent ? <Loader2 className="animate-spin" /> : "تقديم الطلب للسيادة"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
