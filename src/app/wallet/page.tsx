
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, ShieldCheck, History, Copy, Loader2, ArrowRightLeft, 
  Zap, Smartphone, Settings, Camera, CheckCircle, Mail, Send, Eye, ShieldAlert
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
import { sendAccountVerification } from "@/lib/auth";

export default function ProfessionalWalletPage() {
  const { profile, user, loading: userLoading, isVerified } = useUser();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
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
    if (!user || !db || !isVerified) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(50));
  }, [user, db, isVerified]);

  const { data: transactions, loading: transLoading } = useCollection(transactionsQuery);

  const handleUpdateProfile = () => {
    if (!user || !db) return;
    setIsUpdating(true);
    updateDoc(doc(db, "users", user.uid), {
      displayName: newDisplayName,
      phoneNumber: newPhone,
      photoURL: newPhotoURL,
      updatedAt: new Date().toISOString()
    }).then(() => {
      setIsEditing(false);
      toast({ title: "تم تحديث البيانات" });
    }).finally(() => setIsUpdating(false));
  };

  const copyToClipboard = (text: string, label: string = "المعرف") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: `تم حفظ ${label} في الحافظة.` });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  if (!isVerified && user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
        <Navbar />
        <Card className="max-w-xl w-full p-10 md:p-16 text-center luxury-card border-none bg-card shadow-2xl">
           <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-8" />
           <h2 className="text-3xl font-black mb-4">الوصول مقيد سيادياً</h2>
           <p className="text-muted-foreground mb-10">يجب عليك توثيق بريدك الإلكتروني أولاً لتتمكن من استخدام المحفظة.</p>
           <Button onClick={() => user && sendAccountVerification(user).then(() => toast({title: "تم الإرسال"}))} className="royal-button w-full h-16">إعادة إرسال رابط التحقق</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-32 max-w-5xl animate-fade-in">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          <Card className="luxury-card border-none p-6 md:p-8 lg:col-span-2 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-xl">
            <Avatar className="w-20 h-20 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-zinc-50 dark:border-zinc-800 shadow-xl overflow-hidden">
                <AvatarImage src={profile?.photoURL} className="object-cover" />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-primary text-2xl font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-right">
                <h1 className="text-xl md:text-3xl font-black mb-1">{config?.walletPage?.title || "المحفظة السيادية"}</h1>
                <Badge className="bg-primary/10 text-primary border-none px-3 py-0.5 font-black uppercase text-[10px]">{profile?.displayName}</Badge>
                <div className="flex items-center gap-4 mt-4 text-xs font-bold text-zinc-500 justify-center md:justify-start">
                   <Mail size={12} className="text-primary" /> {profile?.email}
                   <Smartphone size={12} className="text-primary" /> {profile?.phoneNumber || "---"}
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
               <Button asChild className="royal-button h-12 text-xs"><Link href="/wallet/transfer">تحويل رصيد</Link></Button>
               <Button onClick={() => setIsEditing(true)} variant="outline" className="h-12 rounded-xl font-black text-[10px] uppercase gap-2">إعدادات الهوية</Button>
            </div>
          </Card>

          <Card className="luxury-card border-none p-6 md:p-8 bg-zinc-900 text-white flex flex-col justify-center text-center shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">الرصيد المتاح</p>
            <div className="text-3xl md:text-5xl font-black mb-2 tracking-tighter text-primary">{formatUSD(profile?.walletBalance || 0)}</div>
            <div className="text-[8px] md:text-[10px] font-black text-zinc-400 opacity-60 uppercase">{formatSDG(profile?.walletBalance || 0)}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <Card className="luxury-card p-8 border-none bg-card/60 backdrop-blur-xl shadow-xl">
              <h3 className="text-xl font-black mb-4 flex items-center gap-3"><Zap size={18} className="text-primary animate-pulse" /> {config?.walletPage?.uidTitle || "بروتوكول الإيداع"}</h3>
              <p className="text-sm text-zinc-500 mb-8 font-medium leading-relaxed">{config?.walletPage?.uidDesc || "استخدم معرفك (UID) الموحد للشحن عبر الوكلاء المعتمدين."}</p>
              <div className="bg-zinc-100 dark:bg-zinc-800/50 p-5 rounded-2xl border border-dashed border-primary/30 flex items-center justify-between cursor-pointer group" onClick={() => copyToClipboard(user?.uid || "")}>
                 <span className="font-mono font-black text-sm md:text-lg truncate">{user?.uid}</span>
                 <Copy size={16} className="text-zinc-400 group-hover:text-primary transition-colors" />
              </div>
           </Card>

           <Card className="luxury-card p-8 flex items-center gap-8 border-none bg-card/60 backdrop-blur-xl shadow-xl">
              <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center border border-primary/10 shadow-inner">
                 {isVerified ? <CheckCircle className="w-10 h-10 text-green-500" /> : <ShieldCheck className="w-10 h-10 text-zinc-300 animate-pulse" />}
              </div>
              <div>
                 <h4 className="font-black text-xl mb-1">حالة التوثيق</h4>
                 <Badge className={`px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest ${isVerified ? 'bg-green-500/10 text-green-600' : 'bg-zinc-200 text-zinc-500'}`}>
                    {isVerified ? 'IDENTITY VERIFIED' : 'PENDING'}
                 </Badge>
              </div>
           </Card>
        </div>

        <Card className="luxury-card border-none overflow-hidden bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="p-8 border-b flex flex-row items-center justify-between bg-muted/5">
            <CardTitle className="text-xl font-black flex items-center gap-3"><History size={20} className="text-primary" /> {config?.walletPage?.ledgerTitle || "سجل التدفقات المالية"}</CardTitle>
            <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary">Live Ledger Active</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px] responsive-table">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right py-4 pr-8 font-black uppercase text-[9px]">العملية</TableHead>
                    <TableHead className="text-right font-black uppercase text-[9px]">التصنيف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[9px]">القيمة</TableHead>
                    <TableHead className="text-center font-black uppercase text-[9px]">التفاصيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin text-primary mx-auto" /></TableCell></TableRow>
                  ) : transactions?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-40 opacity-40 italic">لا توجد سجلات</TableCell></TableRow>
                  ) : transactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all">
                      <TableCell className="py-6 pr-8 font-bold text-xs">{t.description}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[7px] font-black uppercase">{t.type}</Badge></TableCell>
                      <TableCell className={`font-black text-lg ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>{formatUSD(t.amount)}</TableCell>
                      <TableCell className="text-center">
                         {t.orderId && <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-primary"><Link href={`/orders/${t.orderId}`}><Eye size={18} /></Link></Button>}
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
         <DialogContent className="max-w-md bg-card border-none rounded-[2rem] p-10 shadow-2xl">
            <DialogHeader><DialogTitle className="text-2xl font-black gold-text">تحديث الهوية</DialogTitle></DialogHeader>
            <div className="space-y-6 mt-6">
               <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">اسم العرض</Label><Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-12 bg-muted/50 border-none rounded-xl font-bold px-4" /></div>
               <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary">رقم الهاتف</Label><Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-12 bg-muted/50 border-none rounded-xl font-bold px-4" /></div>
            </div>
            <DialogFooter className="mt-10"><Button onClick={handleUpdateProfile} disabled={isUpdating} className="royal-button w-full h-14">{isUpdating ? <Loader2 className="animate-spin" /> : "حفظ التعديلات"}</Button></DialogFooter>
         </DialogContent>
      </Dialog>
    </main>
  );
}
