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
  Smartphone, 
  Settings, 
  Camera, 
  CheckCircle,
  Mail,
  Edit2,
  Upload,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy, doc, updateDoc, limit } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ProfessionalWalletPage() {
  const { profile, user, loading: userLoading, isVerified } = useUser();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const { data: transactions, loading: transLoading } = useCollection(transactionsQuery);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
      reader.onerror = reject;
    });
  };

  const handleUpdateProfile = () => {
    if (!user || !db) return;
    setIsUpdating(true);
    const userRef = doc(db, "users", user.uid);
    updateDoc(userRef, {
      displayName: newDisplayName,
      phoneNumber: newPhone,
      photoURL: newPhotoURL,
      updatedAt: new Date().toISOString()
    }).then(() => {
      setIsEditing(false);
      toast({ title: "تم التحديث السيادي بنجاح" });
    }).finally(() => setIsUpdating(false));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUpdating(true);
      try {
        const b64 = await compressImage(file);
        setNewPhotoURL(b64);
        toast({ title: "تم تجهيز الهوية البصرية" });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل المعالجة" });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const copyToClipboard = (text: string, label: string = "المعرف") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: `تم حفظ ${label} في الحافظة.` });
  };

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-32 max-w-5xl animate-fade-in">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          <Card className="luxury-card border-none p-6 md:p-8 lg:col-span-2 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-xl">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-20 h-20 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-zinc-50 dark:border-zinc-800 shadow-xl overflow-hidden transition-all group-hover:border-primary/50">
                <AvatarImage src={profile?.photoURL} className="object-cover" />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-primary text-2xl md:text-4xl font-bold">
                  {profile?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-zinc-900">
                <Camera size={14} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-right space-y-3">
              <div>
                <h1 className="text-xl md:text-3xl font-black mb-1">{config?.walletPage?.title || "المحفظة السيادية"}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[10px] px-3 py-0.5 font-black uppercase">{profile?.displayName}</Badge>
                  <Badge variant="outline" className="text-[8px] md:text-[10px] px-3 py-0.5 font-black uppercase border-muted-foreground/20">{profile?.label || "عضو موثق"}</Badge>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center justify-center md:justify-start">
                 <div className="flex items-center gap-2 text-zinc-500 text-[9px] md:text-xs font-bold truncate max-w-[180px]">
                    <Mail size={12} className="text-primary" /> {profile?.email}
                 </div>
                 <div className="flex items-center gap-2 text-zinc-500 text-[9px] md:text-xs font-bold">
                    <Smartphone size={12} className="text-primary" /> {profile?.phoneNumber || "---"}
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full md:w-auto">
               <Button asChild className="royal-button w-full h-11 md:h-12 text-[9px] md:text-xs shadow-lg">
                 <Link href="/wallet/transfer"><ArrowRightLeft size={14} className="ml-2" /> تحويل رصيد</Link>
               </Button>
               <Button onClick={() => setIsEditing(true)} variant="outline" className="h-11 md:h-12 rounded-xl font-black text-[9px] md:text-[10px] uppercase gap-2 border-primary/20 hover:bg-primary/5">
                 <Settings size={12} /> الإعدادات
               </Button>
            </div>
          </Card>

          <Card className="luxury-card border-none p-6 md:p-8 bg-zinc-900 text-white dark:bg-zinc-950 flex flex-col justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 md:mb-4 relative z-10">الرصيد المتاح</p>
            <div className="text-3xl md:text-5xl font-black mb-2 tracking-tighter text-primary relative z-10">{formatUSD(profile?.walletBalance || 0)}</div>
            <div className="text-[8px] md:text-[10px] font-black text-zinc-400 opacity-60 uppercase tracking-widest relative z-10">{formatSDG(profile?.walletBalance || 0)}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
           <Card className="luxury-card p-5 md:p-8 flex flex-col justify-between border-none bg-card/60 backdrop-blur-xl shadow-xl">
              <div>
                 <h3 className="text-base md:text-xl font-black mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-zinc-900 dark:text-white">
                    <Zap size={18} className="text-primary animate-pulse" /> {config?.walletPage?.uidTitle || "بروتوكول الإيداع"}
                 </h3>
                 <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 mb-6 md:mb-8 font-medium leading-relaxed">
                    {config?.walletPage?.uidDesc || "استخدم معرفك (UID) الموحد للشحن عبر الوكلاء المعتمدين."}
                 </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800/50 px-4 md:px-6 py-4 md:py-5 rounded-xl md:rounded-2xl border border-dashed border-primary/30 flex items-center justify-between gap-4 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => copyToClipboard(user?.uid || "", "UID")}>
                 <div className="flex flex-col text-right overflow-hidden">
                    <span className="text-[6px] md:text-[8px] text-primary font-black uppercase mb-1 tracking-widest">SOVEREIGN UID</span>
                    <span className="font-mono font-black text-[10px] md:text-lg text-foreground truncate">{user?.uid}</span>
                 </div>
                 <Copy size={16} className="text-zinc-400 group-hover:text-primary transition-colors shrink-0" />
              </div>
           </Card>

           <Card className="luxury-card p-5 md:p-8 flex items-center gap-4 md:gap-8 border-none bg-card/60 backdrop-blur-xl shadow-xl">
              <div className="w-14 h-14 md:w-24 md:h-24 bg-primary/5 rounded-xl md:rounded-[2rem] flex items-center justify-center border border-primary/10 shadow-inner shrink-0">
                 {isVerified ? <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-green-500" /> : <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-zinc-300 animate-pulse" />}
              </div>
              <div className="flex-1">
                 <h4 className="font-black text-base md:text-xl mb-1">حالة التوثيق</h4>
                 <p className="text-[9px] md:text-xs text-zinc-500 dark:text-zinc-400 mb-3 font-medium">صلاحيات كاملة للموثقين سيادياً.</p>
                 <Badge className={`px-4 md:px-6 py-1 md:py-2 rounded-full font-black text-[7px] md:text-[9px] uppercase tracking-widest ${isVerified ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 border-none'}`}>
                    {isVerified ? 'IDENTITY VERIFIED' : 'PENDING'}
                 </Badge>
              </div>
           </Card>
        </div>

        <Card className="luxury-card border-none overflow-hidden bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="p-5 md:p-8 border-b flex flex-row items-center justify-between bg-muted/5">
            <CardTitle className="text-base md:text-xl font-black flex items-center gap-3">
              <History size={20} className="text-primary" /> {config?.walletPage?.ledgerTitle || "سجل التدفقات المالية"}
            </CardTitle>
            <Badge variant="outline" className="text-[7px] md:text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary">Live Ledger Active</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px] responsive-table">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="text-right py-4 pr-8 font-black uppercase text-[9px]">العملية والمرجع</TableHead>
                    <TableHead className="text-right font-black uppercase text-[9px]">التصنيف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[9px]">القيمة</TableHead>
                    <TableHead className="text-center font-black uppercase text-[9px]">القسيمة</TableHead>
                    <TableHead className="text-left font-black uppercase text-[9px] pl-8">التوقيت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
                  ) : transactions?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-40 text-zinc-400 font-black uppercase tracking-widest opacity-40">لا توجد سجلات مالية مسجلة</TableCell></TableRow>
                  ) : transactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 border-b border-border/30 group transition-all">
                      <TableCell className="py-5 pr-8" data-label="العملية">
                        <div className="flex flex-col">
                           <span className="font-bold text-xs leading-none mb-1.5">{t.description}</span>
                           {t.orderId && (
                             <span 
                               onClick={() => copyToClipboard(t.orderId, "رقم الطلب")} 
                               className="text-[7px] font-mono text-primary uppercase tracking-tighter cursor-pointer hover:underline flex items-center gap-1 w-fit"
                             >
                               REF: {t.orderId.substring(0,10)}... <Copy size={8} />
                             </span>
                           )}
                        </div>
                      </TableCell>
                      <TableCell data-label="التصنيف"><Badge variant="secondary" className="text-[7px] font-black uppercase px-2 py-0.5">{t.type}</Badge></TableCell>
                      <TableCell data-label="المبلغ" className={`font-black text-base md:text-xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                      </TableCell>
                      <TableCell className="text-center" data-label="القسيمة">
                         {t.orderId ? (
                           <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary border border-transparent hover:border-primary/20">
                              <Link href={`/orders/${t.orderId}`}><Eye size={18} /></Link>
                           </Button>
                         ) : <span className="text-[10px] text-zinc-400">---</span>}
                      </TableCell>
                      <TableCell data-label="التوقيت" className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase pl-8 text-left">
                         <span className="block text-foreground">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</span>
                         <span className="opacity-50">{new Date(t.createdAt).toLocaleTimeString('ar-EG')}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="max-w-md bg-card border-none rounded-[2rem] p-6 md:p-10 shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-xl md:text-3xl font-black flex items-center gap-3 gold-text"><Settings className="text-primary" /> تحديث البيانات السيادية</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
               <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
               <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-primary/20 shadow-xl rounded-2xl overflow-hidden transition-all group-hover:border-primary">
                        <AvatarImage src={newPhotoURL} className="object-cover" />
                        <AvatarFallback className="bg-muted text-primary text-2xl font-bold">XM</AvatarFallback>
                     </Avatar>
                     <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        {isUpdating ? <Loader2 className="animate-spin text-white" /> : <Upload size={18} className="text-white" />}
                     </div>
                  </div>
                  <p className="text-[8px] font-black uppercase text-muted-foreground">اضغط لتغيير الصورة الرمزية</p>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-primary pr-2 tracking-widest">اسم العرض (السيادي)</Label>
                     <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-12 bg-muted/50 border-none rounded-xl font-black px-4" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-primary pr-2 tracking-widest">رقم الهاتف الدولي</Label>
                     <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-12 bg-muted/50 border-none rounded-xl font-black px-4 text-left" placeholder="+966" />
                  </div>
               </div>
            </div>
            <DialogFooter className="mt-8">
               <Button onClick={handleUpdateProfile} disabled={isUpdating} className="royal-button w-full h-14 text-base shadow-primary/20">
                  {isUpdating ? <Loader2 className="animate-spin" /> : "حفظ وتثبيت التعديلات"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </main>
  );
}