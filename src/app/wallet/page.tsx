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
  CheckCircle,
  Mail,
  Edit2,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy, doc, updateDoc, addDoc, where, limit } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // دالة ضغط الصور الذكية قبل التحويل لـ Base64
  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // حجم كافٍ للبروفايل
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // ضغط بنسبة 70%
          resolve(dataUrl);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

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
      toast({ title: "تم تحديث البيانات", description: "تم تثبيت تغييرات هويتك السيادية بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث", description: "تعذر حفظ التغييرات، يرجى المحاولة لاحقاً." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUpdating(true);
      try {
        const compressedBase64 = await compressAndConvertToBase64(file);
        setNewPhotoURL(compressedBase64);
        toast({ title: "معالجة الصورة", description: "تم ضغط وتحضير صورتك الجديدة بنجاح." });
      } catch (error) {
        toast({ variant: "destructive", title: "خطأ في المعالجة", description: "لم نتمكن من قراءة ملف الصورة." });
      } finally {
        setIsUpdating(false);
      }
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
      toast({ title: "تم إرسال الطلب", description: "طلب الاعتماد قيد المراجعة الأمنية الآن." });
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
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-32 max-w-5xl animate-fade-in">
        
        {/* Modern Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="luxury-card border-none p-8 lg:col-span-2 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center gap-8 shadow-xl">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-32 h-32 rounded-[2.5rem] border-4 border-zinc-50 dark:border-zinc-800 shadow-2xl overflow-hidden transition-all group-hover:border-primary/50">
                <AvatarImage src={profile?.photoURL} className="object-cover w-full h-full" />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-primary text-4xl font-bold">
                  {profile?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-xl shadow-lg border-4 border-white dark:border-zinc-900 group-hover:scale-110 transition-transform">
                <Camera size={18} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-right space-y-4">
              <div>
                <h1 className="text-3xl font-black mb-2">{profile?.displayName}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] px-4 py-1.5 font-black uppercase tracking-widest">{profile?.role}</Badge>
                  <Badge variant="outline" className="text-[10px] px-4 py-1.5 font-black uppercase tracking-widest border-muted-foreground/20">{profile?.label || "عضو موثق"}</Badge>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                 <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                    <Mail size={14} className="text-primary" /> {profile?.email}
                 </div>
                 <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                    <Smartphone size={14} className="text-primary" /> {profile?.phoneNumber || "---"}
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
               <Button asChild className="royal-button w-full md:w-auto h-12">
                 <Link href="/wallet/transfer"><ArrowRightLeft size={16} className="ml-2" /> تحويل فوري</Link>
               </Button>
               <Button onClick={() => setIsEditing(true)} variant="outline" className="h-12 rounded-xl font-black text-[10px] uppercase gap-2 border-primary/20 hover:bg-primary/5">
                 <Edit2 size={14} /> تحديث الهوية
               </Button>
               {!currentAgentRequest && profile?.role !== 'agent' && profile?.role !== 'owner' && (
                <Button onClick={() => setIsAgentDialogOpen(true)} variant="ghost" className="text-[9px] font-black uppercase h-10 tracking-widest text-muted-foreground hover:text-primary">
                   طلب اعتماد وكيل
                </Button>
               )}
            </div>
          </Card>

          <Card className="luxury-card border-none p-8 bg-zinc-900 text-white dark:bg-zinc-900 flex flex-col justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 relative z-10">السيولة الرقمية المتوفرة</p>
            <div className="text-5xl font-black mb-3 tracking-tighter text-primary relative z-10">{formatUSD(balance)}</div>
            <div className="text-[10px] font-black text-zinc-400 opacity-60 uppercase tracking-widest relative z-10">{formatSDG(balance)}</div>
          </Card>
        </div>

        {/* User Identity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <Card className="luxury-card p-8 flex flex-col justify-between border-none bg-card/60 backdrop-blur-xl shadow-xl">
              <div>
                 <h3 className="text-xl font-black mb-4 flex items-center gap-3 text-zinc-900 dark:text-white">
                    <Zap size={22} className="text-primary animate-pulse" /> بروتوكول الإيداع السيادي
                 </h3>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">
                    زود محفظتك بالرصيد عبر أحد وكلائنا المعتمدين؛ قدم معرفك الرقمي (UID) الموحد أدناه لضمان وصول الحوالة في الوقت الفعلي.
                 </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800/50 px-6 py-5 rounded-2xl border border-dashed border-primary/30 flex items-center justify-between gap-4 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => copyToClipboard(user?.uid || "")}>
                 <div className="flex flex-col text-right overflow-hidden">
                    <span className="text-[8px] text-primary font-black uppercase mb-1 tracking-widest">SOVEREIGN UID (PRIVATE)</span>
                    <span className="font-mono font-black text-sm md:text-lg text-foreground truncate">{user?.uid}</span>
                 </div>
                 <Copy size={20} className="text-zinc-400 group-hover:text-primary transition-colors shrink-0" />
              </div>
           </Card>

           <Card className="luxury-card p-8 flex items-center gap-8 border-none bg-card/60 backdrop-blur-xl shadow-xl">
              <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center border border-primary/10 shadow-inner">
                 {isVerified ? (
                   <CheckCircle size={48} className="text-green-500" />
                 ) : (
                   <ShieldCheck size={48} className="text-zinc-300 animate-pulse" />
                 )}
              </div>
              <div className="flex-1">
                 <h4 className="font-black text-xl mb-2">حالة التحقق والتوثيق</h4>
                 <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 font-medium">الحسابات الموثقة تمتلك صلاحيات كاملة لشراء الأصول النادرة واستخدام الوسطاء.</p>
                 <Badge className={`px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest ${isVerified ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 border-none'}`}>
                    {isVerified ? 'VERIFIED IDENTITY ACTIVE' : 'PENDING VERIFICATION'}
                 </Badge>
              </div>
           </Card>
        </div>

        {/* Professional Transaction Ledger */}
        <Card className="luxury-card border-none overflow-hidden bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="p-8 border-b flex flex-row items-center justify-between bg-muted/5">
            <CardTitle className="text-xl font-black flex items-center gap-4">
              <History size={24} className="text-primary" /> سجل التدفقات والعمليات
            </CardTitle>
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary px-4 py-1 rounded-full">Universal Ledger Pro</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px] responsive-table">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="text-right py-6 pr-10 font-black uppercase text-[10px]">العملية والتفاصيل</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px]">التصنيف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px]">القيمة المالية</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] pr-10">التوقيت المركزي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
                  ) : transactions?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-40 text-zinc-400 font-black uppercase tracking-[0.3em] opacity-40">لا توجد سجلات مالية مسجلة</TableCell></TableRow>
                  ) : transactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-border/30">
                      <TableCell className="py-6 pr-10 font-bold text-sm" data-label="العملية">{t.description}</TableCell>
                      <TableCell data-label="التصنيف"><Badge variant="secondary" className="text-[8px] font-black uppercase px-4 py-0.5 rounded-full">{t.type}</Badge></TableCell>
                      <TableCell data-label="المبلغ" className={`font-black text-xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                      </TableCell>
                      <TableCell data-label="التوقيت" className="text-zinc-500 text-[10px] font-black uppercase pr-10">{new Date(t.createdAt).toLocaleString('ar-EG')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="max-w-lg bg-card border-none rounded-[2.5rem] p-10 shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-3xl font-black flex items-center gap-4 gold-text"><Settings className="text-primary" /> تحديث البيانات السيادية</DialogTitle>
               <DialogDescription className="font-bold text-zinc-500 text-xs mt-2 uppercase tracking-widest">Update Sovereign Profile Identity</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 mt-10">
               {/* Hidden Image Input */}
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageChange} 
                 accept="image/*" 
                 className="hidden" 
               />
               
               <div className="flex flex-col items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <Avatar className="w-28 h-28 border-4 border-primary/20 shadow-2xl rounded-3xl transition-transform group-hover:scale-105 overflow-hidden">
                        <AvatarImage src={newPhotoURL} className="object-cover w-full h-full" />
                        <AvatarFallback className="bg-muted text-primary text-3xl font-bold">XM</AvatarFallback>
                     </Avatar>
                     <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        {isUpdating ? <Loader2 className="animate-spin text-white" /> : <Upload size={24} className="text-white" />}
                     </div>
                  </div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">انقر لتغيير الصورة (النظام يدعم كافة الأحجام والضغط الآلي)</p>
               </div>

               <div className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">اسم العرض (Sovereign Name)</label>
                     <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-14 bg-muted/50 border-none rounded-2xl font-black px-6 shadow-inner" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">رقم الهاتف الدولي الفعال</label>
                     <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-14 bg-muted/50 border-none rounded-2xl font-black px-6 text-left shadow-inner" placeholder="+966" />
                  </div>
               </div>
            </div>
            <DialogFooter className="mt-12">
               <Button onClick={handleUpdateProfile} disabled={isUpdating} className="royal-button w-full h-16 text-lg">
                  {isUpdating ? <Loader2 className="animate-spin" /> : "تثبيت التغييرات السيادية"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Agent Request Dialog */}
      <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-none rounded-[2.5rem] p-10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black flex items-center gap-4 gold-text">
              <UserCheck className="text-primary" /> طلب اعتماد وكيل
            </DialogTitle>
            <DialogDescription className="mt-3 font-bold text-zinc-500 text-xs uppercase tracking-widest leading-relaxed">Identity Verification for Service Agents</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-10">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">الاسم الكامل الرسمي</label>
                <Input value={profile?.fullName || ""} disabled className="h-14 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl font-black px-6 opacity-60" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">الخبرات ودوافع الانضمام</label>
                <Textarea value={agentReason} onChange={e => setAgentReason(e.target.value)} placeholder="اشرح لنا مهاراتك في تقديم الخدمات الرقمية..." className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-3xl min-h-[120px] p-6 font-bold shadow-inner" />
             </div>
          </div>
          <DialogFooter className="mt-10">
             <Button onClick={handleAgentRequest} disabled={isSubmittingAgent} className="royal-button w-full h-16 text-lg">
                {isSubmittingAgent ? <Loader2 className="animate-spin" /> : "إرسال طلب الاعتماد الرسمي"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}