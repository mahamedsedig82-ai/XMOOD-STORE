
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
  Edit2, 
  Zap, 
  UserCheck, 
  Phone, 
  Mail, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Smartphone, 
  UserCircle, 
  Settings, 
  Camera, 
  Building2, 
  CreditCard, 
  Bitcoin, 
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle
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
  
  // Profile Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Agent Request State
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
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
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
      toast({ title: "تم التحديث", description: "تم ربط معلوماتك السيادية الجديدة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث", description: "تأكد من الصلاحيات والاتصال." });
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
      toast({ title: "تم إرسال الطلب", description: "طلبك قيد المراجعة من قبل الإدارة العليا الآن." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: "يرجى المحاولة لاحقاً." });
    } finally {
      setIsSubmittingAgent(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "معرفك الشخصي متاح الآن في الحافظة." });
  };

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
    </div>
  );

  const balance = profile?.walletBalance || 0;

  const paymentMethods = [
    { 
      name: "بنكك (Bankak)", 
      icon: Building2, 
      desc: "التحويل المباشر عبر تطبيق بنك الخرطوم. أسرع وسيلة محلية.", 
      color: "text-green-500",
      guide: "قم بالتحويل لرقم الحساب المعتمد من الوكيل وأرسل صورة الإشعار."
    },
    { 
      name: "Binance (USDT)", 
      icon: Bitcoin, 
      desc: "شحن المحفظة عبر العملات الرقمية المستقرة (USDT/P2P).", 
      color: "text-yellow-500",
      guide: "اختر شبكة TRC20 للتحويل لضمان سرعة المعالجة وأقل رسوم."
    },
    { 
      name: "فوري (Fawry)", 
      icon: CreditCard, 
      desc: "شبكة الدفع الإلكتروني الشاملة للوكلاء والعملاء.", 
      color: "text-blue-500",
      guide: "استخدم كود الخدمة الخاص بالمتجر لدى أي منفذ فوري معتمد."
    },
    { 
      name: "ماي سوداني", 
      icon: Smartphone, 
      desc: "خدمة تحويل الرصيد والدفع عبر شبكة سوداني.", 
      color: "text-red-500",
      guide: "خدمة دفع لحظية تعتمد على رقم الهاتف المسجل في النظام."
    }
  ];

  return (
    <main className="min-h-screen bg-black font-body text-white pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-6xl animate-fade-in">
        
        {/* Header: Unified Profile & Identity Dashboard */}
        <Card className="luxury-card border-none overflow-hidden mb-12 p-10 md:p-16 relative bg-zinc-950/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-primary to-red-600 animate-pulse" />
          
          <div className="flex flex-col lg:flex-row justify-between items-center gap-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-right flex-1">
              <div className="relative group">
                <Avatar className="w-40 h-40 rounded-[3.5rem] border-4 border-primary/20 shadow-2xl transition-all group-hover:border-primary/50 group-hover:scale-105 duration-500 overflow-hidden">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-zinc-900 text-primary text-5xl font-black">
                    {profile?.displayName?.charAt(0) || "X"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 -right-2 bg-primary text-black p-3 rounded-2xl border-4 border-black shadow-2xl">
                  <Award size={24} />
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[3.5rem] pointer-events-none">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-5xl md:text-6xl font-headline font-bold gold-text mb-3 leading-tight">{profile?.displayName}</h1>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Badge className="bg-red-600/20 text-red-500 border-red-600/30 px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{profile?.role}</Badge>
                    <Badge variant="outline" className="border-primary/20 text-primary text-[9px] px-6 py-1.5 rounded-full font-black uppercase tracking-widest">{profile?.label || "XMOOD MEMBER"}</Badge>
                    {currentAgentRequest && (
                      <Badge className={`px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        currentAgentRequest.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        currentAgentRequest.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                         طلب وكيل: {currentAgentRequest.status === 'pending' ? 'تحت المراجعة' : currentAgentRequest.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
                      <Mail size={18} />
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] text-zinc-500 font-bold uppercase">البريد الإلكتروني</p>
                       <p className="text-xs font-bold text-zinc-300 truncate max-w-[150px]">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Smartphone size={18} />
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] text-zinc-500 font-bold uppercase">رقم الهاتف</p>
                       <p className="text-xs font-bold text-zinc-300">{profile?.phoneNumber || "غير مربوط"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-64">
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest gap-3">
                {isEditing ? "إلغاء التعديل" : <><Settings size={18} className="text-zinc-500" /> إعدادات الملف</>}
              </Button>
              <Button asChild className="royal-button h-18 px-10 text-base shadow-primary/30">
                <Link href="/wallet/transfer"><ArrowRightLeft className="ml-4" size={24} /> تحويل رصيد</Link>
              </Button>
              
              {!currentAgentRequest && profile?.role !== 'agent' && (
                <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="h-12 text-zinc-500 hover:text-primary font-bold text-[9px] uppercase tracking-[0.2em] gap-2">
                       <UserCheck size={16} /> طلب رتبة وكيل معتمد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4">
                        <UserCheck className="text-primary" /> طلب الانضمام للنخبة
                      </DialogTitle>
                      <DialogDescription className="text-zinc-500 font-bold mt-2">كن جزءاً من شبكة وكلاء XMOOD الرسمية في منطقتك.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 mt-8">
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-primary uppercase pr-2">لماذا تود أن تصبح وكيلاً؟</label>
                          <Textarea value={agentReason} onChange={e => setAgentReason(e.target.value)} placeholder="اشرح لنا دوافعك..." className="bg-zinc-900 border-none rounded-xl min-h-[100px] p-4" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-primary uppercase pr-2">الخبرات السابقة في الشحن والوساطة</label>
                          <Textarea value={agentExperience} onChange={e => setAgentExperience(e.target.value)} placeholder="اذكر أي منصات أو أعمال سابقة..." className="bg-zinc-900 border-none rounded-xl min-h-[80px] p-4" />
                       </div>
                    </div>
                    <DialogFooter className="mt-10">
                       <Button onClick={handleAgentRequest} disabled={isSubmittingAgent} className="royal-button w-full h-16 text-lg">
                          {isSubmittingAgent ? <Loader2 className="animate-spin" /> : "تقديم طلب السيادة"}
                       </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-12 pt-12 border-t border-white/5 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-500 pr-4 tracking-widest flex items-center gap-2">
                       <UserCircle size={12} /> الاسم المعروض للنخبة
                    </label>
                    <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-14 bg-black border-primary/20 rounded-2xl px-6 font-bold text-primary text-lg" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-500 pr-4 tracking-widest flex items-center gap-2">
                       <Smartphone size={12} /> رقم الهاتف الدولي
                    </label>
                    <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-14 bg-black border-primary/20 rounded-2xl px-6 font-bold text-left text-lg" placeholder="+966" />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-500 pr-4 tracking-widest flex items-center gap-2">
                       <Camera size={12} /> رابط الصورة الشخصية (Photo URL)
                    </label>
                    <Input value={newPhotoURL} onChange={e => setNewPhotoURL(e.target.value)} placeholder="https://..." className="h-14 bg-black border-primary/20 rounded-2xl px-6 font-bold text-zinc-300" />
                  </div>
                </div>
                <Button onClick={handleUpdateProfile} disabled={isUpdating} className="royal-button h-14 px-12 text-sm">
                  {isUpdating ? <Loader2 className="animate-spin" /> : "حفظ السيادة الرقمية"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
        
        {/* Assets & Charging Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          {/* Main Balance Card */}
          <Card className="luxury-card border-none relative overflow-hidden p-12 bg-zinc-950 flex flex-col justify-center min-h-[350px]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full" />
            <div className="relative z-10 text-center md:text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 mb-8 flex items-center justify-center md:justify-start gap-3">
                <TrendingUp size={16} /> الرصيد السيادي الكلي
              </p>
              <div className="text-7xl font-black text-white mb-6 tracking-tighter leading-none">{formatUSD(balance)}</div>
              <div className="text-lg font-bold text-zinc-500 uppercase tracking-[0.3em] bg-white/5 inline-block px-6 py-2 rounded-full border border-white/5">
                {formatSDG(balance)}
              </div>
            </div>
          </Card>

          {/* Charging & Verification Card */}
          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-12 flex flex-col md:flex-row items-center gap-12 bg-zinc-950 min-h-[350px]">
            <div className="flex-1 space-y-8 text-center md:text-right">
               <div className="flex items-center justify-center md:justify-start gap-5 text-primary">
                  <Zap size={32} className="animate-pulse" />
                  <h3 className="text-3xl font-bold gold-text">بروتوكول الشحن الفوري</h3>
               </div>
               <p className="text-zinc-400 text-base font-medium leading-relaxed max-w-lg">
                 استخدم معرفك السيادي (UID) أو رقم الهاتف الموثق لتزويد محفظتك بالرصيد عبر وكلائنا المعتمدين في كافة المناطق.
               </p>
               <div className="space-y-4">
                  <div className="bg-black px-8 py-5 rounded-[2rem] border border-dashed border-primary/30 flex items-center justify-between gap-6 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => copyToClipboard(user?.uid || "")}>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">SOVEREIGN UID</span>
                        <span className="font-mono font-black text-xl text-primary tracking-widest uppercase">{user?.uid?.substring(0, 22)}...</span>
                      </div>
                      <Copy size={24} className="text-zinc-700 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="bg-primary/5 px-8 py-4 rounded-2xl border border-primary/10 flex items-center justify-between">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">الرقم الموثق للشحن</span>
                     <span className="font-black text-white text-xl tracking-wider">{profile?.phoneNumber || "غير مربوط"}</span>
                  </div>
               </div>
            </div>
            
            <div className="w-full md:w-64 p-10 bg-black/60 rounded-[3rem] text-center border border-white/5 flex flex-col items-center justify-center gap-6 shadow-2xl">
              {isVerified ? (
                <div className="relative">
                  <CheckCircle size={72} className="text-green-500" />
                  <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                </div>
              ) : (
                <ShieldCheck size={72} className="text-red-500 animate-pulse" />
              )}
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">حالة الحساب</p>
                <Badge className={`px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${isVerified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {isVerified ? 'Verified Sovereign' : 'Unverified Identity'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Methods Section */}
        <section className="mb-20 space-y-10">
           <div className="flex items-center gap-4">
              <CreditCard className="text-primary w-8 h-8" />
              <h2 className="text-3xl font-headline font-bold text-white">طرق الدفع والشحن المعتمدة</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paymentMethods.map((pm, i) => (
                <Card key={i} className="luxury-card border-none bg-zinc-950/60 p-8 hover:bg-zinc-900 transition-all group">
                   <div className={`w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center ${pm.color} mb-6 border border-white/5 group-hover:border-current transition-all shadow-xl`}>
                      <pm.icon size={28} />
                   </div>
                   <h4 className="font-bold text-lg text-white mb-2">{pm.name}</h4>
                   <p className="text-xs text-zinc-500 leading-relaxed mb-6 h-12">{pm.desc}</p>
                   <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 flex items-center gap-2">
                        <HelpCircle size={12} className="text-primary" /> كيفية الشحن:
                      </p>
                      <p className="text-[10px] text-zinc-600 leading-relaxed italic">{pm.guide}</p>
                   </div>
                </Card>
              ))}
           </div>
        </section>

        {/* Financial Ledger Section */}
        <Card className="luxury-card border-none overflow-hidden bg-zinc-950/40">
          <CardHeader className="p-10 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-5">
              <History size={32} className="text-red-600" /> سجل التدفقات المالية السيادية
            </CardTitle>
            <div className="flex items-center gap-4">
               <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black px-6 py-2 rounded-full tracking-widest">Live Sovereign Ledger</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px] custom-scrollbar">
              <Table>
                <TableHeader className="bg-black/60 sticky top-0 z-20 border-b border-white/5">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-right py-6 pr-12 font-black uppercase text-[10px] text-zinc-500 tracking-widest">تفاصيل العملية</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500 tracking-widest">التصنيف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500 tracking-widest">المبلغ</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500 tracking-widest">التوقيت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
                  ) : transactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5 group">
                      <TableCell className="py-8 pr-12">
                        <span className="font-bold text-base text-zinc-200 block group-hover:text-white transition-colors">{t.description}</span>
                        <span className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-tighter">Operation ID: {t.id?.substring(0,12)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full font-black text-[9px] px-4 py-1 border uppercase tracking-widest ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-black text-2xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-[11px] font-bold">
                        {new Date(t.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-32 text-zinc-700 font-bold uppercase tracking-[0.5em] text-[11px]">
                         No Financial Records Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
