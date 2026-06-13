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
  Award,
  TrendingUp,
  CheckCircle,
  Mail
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ProfessionalWalletPage() {
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
      toast({ title: "تم تحديث الملف الشخصي" });
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
      toast({ title: "تم إرسال الطلب", description: "طلبك قيد المراجعة حالياً من قبل الإدارة." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    } finally {
      setIsSubmittingAgent(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ بنجاح" });
  };

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-32 max-w-5xl animate-fade-in">
        
        {/* Modern Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="luxury-card border-none p-8 lg:col-span-2 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group cursor-pointer" onClick={() => setIsEditing(!isEditing)}>
              <Avatar className="w-32 h-32 rounded-2xl border-4 border-zinc-50 dark:border-zinc-800 shadow-xl overflow-hidden transition-all group-hover:border-primary/30">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-primary text-4xl font-bold">
                  {profile?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-lg shadow-lg">
                <Settings size={16} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-right space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile?.displayName}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] px-3 font-bold uppercase">{profile?.role}</Badge>
                  <Badge variant="outline" className="text-[10px] px-3 font-bold uppercase">{profile?.label || "MEMBER"}</Badge>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                 <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                    <Mail size={14} className="text-zinc-400" /> {profile?.email}
                 </div>
                 <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                    <Smartphone size={14} className="text-zinc-400" /> {profile?.phoneNumber || "---"}
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full md:w-auto">
               <Button asChild className="royal-button w-full md:w-auto">
                 <Link href="/wallet/transfer"><ArrowRightLeft size={16} className="ml-2" /> تحويل فوري</Link>
               </Button>
               {!currentAgentRequest && profile?.role !== 'agent' && (
                <Button onClick={() => setIsAgentDialogOpen(true)} variant="outline" className="text-[10px] font-bold uppercase h-10 rounded-xl">
                   طلب رتبة وكيل معتمد
                </Button>
               )}
            </div>
          </Card>

          <Card className="luxury-card border-none p-8 bg-zinc-900 text-white dark:bg-zinc-900 flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">الرصيد الكلي المتوفر</p>
            <div className="text-5xl font-bold mb-3 tracking-tighter">{formatUSD(balance)}</div>
            <div className="text-xs font-bold text-zinc-400 opacity-60 uppercase">{formatSDG(balance)}</div>
          </Card>
        </div>

        {/* User Identity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <Card className="luxury-card p-8 flex flex-col justify-between">
              <div>
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
                    <Zap size={20} className="text-primary" /> بروتوكول الشحن المباشر
                 </h3>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 font-medium leading-relaxed">
                    استخدم معرفك الرقمي الموحد (UID) أدناه لتزويد محفظتك بالرصيد عبر وكلائنا المعتمدين فوراً وبأعلى درجات الأمان.
                 </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 px-5 py-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all" onClick={() => copyToClipboard(user?.uid || "")}>
                 <div className="flex flex-col text-right overflow-hidden">
                    <span className="text-[8px] text-zinc-400 font-bold uppercase mb-1">DIGITAL IDENTIFIER (UID)</span>
                    <span className="font-mono font-bold text-sm md:text-base text-primary truncate">{user?.uid}</span>
                 </div>
                 <Copy size={18} className="text-zinc-400 shrink-0" />
              </div>
           </Card>

           <Card className="luxury-card p-8 flex items-center gap-6">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                 {isVerified ? (
                   <CheckCircle size={40} className="text-green-500" />
                 ) : (
                   <ShieldCheck size={40} className="text-zinc-300 animate-pulse" />
                 )}
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-lg mb-1">حالة توثيق الهوية</h4>
                 <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">الحسابات الموثقة تحصل على حماية إضافية وميزات شراء حصرية.</p>
                 <Badge className={`px-4 py-1 rounded-full font-bold text-[9px] uppercase ${isVerified ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}>
                    {isVerified ? 'Verified Account' : 'Action Required: Verify Email'}
                 </Badge>
              </div>
           </Card>
        </div>

        {/* Professional Transaction Ledger */}
        <Card className="luxury-card border-none overflow-hidden">
          <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-4">
              <History size={24} className="text-primary" /> سجل التدفقات المالية
            </CardTitle>
            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wide">Live Transaction Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px] responsive-table">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="text-right py-5 pr-10 font-bold uppercase text-[10px]">العملية</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px]">التصنيف</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px]">المبلغ</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] pr-10">التوقيت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : transactions?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-40 text-zinc-400 font-bold">لا توجد عمليات مسجلة حالياً</TableCell></TableRow>
                  ) : transactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b">
                      <TableCell className="py-5 pr-10 font-bold text-sm" data-label="العملية">{t.description}</TableCell>
                      <TableCell data-label="التصنيف"><Badge variant="secondary" className="text-[9px] font-bold uppercase px-3">{t.type}</Badge></TableCell>
                      <TableCell data-label="المبلغ" className={`font-bold text-lg ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                      </TableCell>
                      <TableCell data-label="التوقيت" className="text-zinc-500 text-[10px] font-bold pr-10">{new Date(t.createdAt).toLocaleString('ar-EG')}</TableCell>
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
        <DialogContent className="max-w-lg bg-card border-none rounded-2xl p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-4">
              <UserCheck className="text-primary" /> طلب رتبة وكيل معتمد
            </DialogTitle>
            <DialogDescription className="mt-2 font-medium">كن جزءاً من فريق العمل الرسمي وساهم في تقديم الخدمات الرقمية.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500 pr-2">الاسم بالكامل</label>
                <Input value={profile?.fullName || ""} disabled className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl font-bold" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500 pr-2">لماذا تود الانضمام إلينا كوكيل؟</label>
                <Textarea value={agentReason} onChange={e => setAgentReason(e.target.value)} placeholder="اشرح لنا دوافعك..." className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl min-h-[100px] p-4 font-medium" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500 pr-2">الخبرات السابقة في تقديم الخدمات الرقمية</label>
                <Textarea value={agentExperience} onChange={e => setAgentExperience(e.target.value)} placeholder="اذكر أهم خبراتك..." className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl min-h-[80px] p-4 font-medium" />
             </div>
          </div>
          <DialogFooter className="mt-10">
             <Button onClick={handleAgentRequest} disabled={isSubmittingAgent} className="royal-button w-full h-14 text-base">
                {isSubmittingAgent ? <Loader2 className="animate-spin" /> : "تقديم الطلب للمراجعة"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog Content Integrated in Card via isEditing */}
      <AnimatePresence>
        {isEditing && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
             <DialogContent className="max-w-lg bg-card border-none rounded-2xl p-8 shadow-2xl">
                <DialogHeader>
                   <DialogTitle className="text-2xl font-bold flex items-center gap-3"><Settings className="text-primary" /> تحديث بيانات الحساب</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500">اسم المستخدم</label>
                      <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500">رقم الهاتف الدولي</label>
                      <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl font-bold text-left" placeholder="+966" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500">رابط الصورة الشخصية</label>
                      <Input value={newPhotoURL} onChange={e => setNewPhotoURL(e.target.value)} placeholder="https://..." className="h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl" />
                   </div>
                </div>
                <DialogFooter className="mt-10">
                   <Button onClick={handleUpdateProfile} disabled={isUpdating} className="royal-button w-full h-12">
                      {isUpdating ? <Loader2 className="animate-spin" /> : "حفظ التغييرات"}
                   </Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </main>
  );
}
