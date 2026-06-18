"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, ShieldCheck, History, Copy, Loader2, Zap, 
  Smartphone, Settings, Mail, ShieldAlert, ArrowRight, UserCircle, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy, doc, updateDoc, limit } from "firebase/firestore";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendAccountVerification } from "@/lib/auth";

export default function ProfessionalWalletPage() {
  const { profile, user, loading: userLoading, isVerified } = useUser();
  const db = useFirestore();
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !db || !isVerified) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(50));
  }, [user, db, isVerified]);

  const { data: transactions, loading: transLoading } = useCollection(transactionsQuery);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ بنجاح" });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={60} /></div>;

  if (user && !isVerified) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
        <Navbar />
        <Card className="max-w-xl w-full p-10 md:p-16 text-center luxury-card border-none bg-card shadow-2xl">
           <ShieldAlert className="w-16 h-16 md:w-20 md:h-20 text-red-500 mx-auto mb-8" />
           <h2 className="text-2xl md:text-3xl font-black mb-4">الوصول مقيد سيادياً</h2>
           <p className="text-sm md:text-base text-muted-foreground mb-10">يجب عليك توثيق بريدك الإلكتروني أولاً لتتمكن من استخدام المحفظة والخدمات.</p>
           <Button onClick={() => user && sendAccountVerification(user).then(() => toast({title: "تم إرسال الرابط"}))} className="royal-button w-full h-14 md:h-16">إعادة إرسال رابط التحقق</Button>
           <Button asChild variant="ghost" className="mt-4 w-full h-12 rounded-xl text-primary font-bold">
              <Link href="/verify-email?waiting=true">الذهاب لصفحة الانتظار <ArrowRight className="mr-2 rotate-180" /></Link>
           </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 px-4" dir="rtl">
      <Navbar />
      <div className="container mx-auto pt-32 max-w-5xl animate-fade-in text-right">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          <Card className="luxury-card border-none p-6 md:p-8 lg:col-span-2 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-xl">
            <div className="relative group shrink-0">
               <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] border-4 border-primary/10 shadow-xl overflow-hidden">
                   <AvatarImage src={profile?.photoURL} className="object-cover" />
                   <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
               </Avatar>
               <Link href="/profile/settings" className="absolute -bottom-1 -right-1 bg-primary text-black p-2 rounded-xl shadow-xl hover:scale-110 transition-all border-4 border-background">
                  <Edit size={14} />
               </Link>
            </div>
            <div className="flex-1 text-center md:text-right">
                <h1 className="text-2xl md:text-3xl font-black mb-2">{config?.walletPage?.title || "المحفظة السيادية"}</h1>
                <Badge className="bg-primary/10 text-primary border-none px-4 py-1 font-black uppercase text-[8px] md:text-[10px]">{profile?.label || "عضو موثق"}</Badge>
                <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 md:gap-6 mt-5 text-[10px] md:text-xs font-bold text-zinc-500 justify-center md:justify-start">
                   <span className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg"><Mail size={12} className="text-primary" /> {profile?.email}</span>
                   <span className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg"><Smartphone size={12} className="text-primary" /> {profile?.phoneNumber || "---"}</span>
                </div>
            </div>
            <Button asChild className="royal-button w-full md:w-auto h-12 md:h-14 px-10 text-[9px] md:text-[10px] shadow-primary/20"><Link href="/wallet/transfer">تحويل فوري</Link></Button>
          </Card>

          <Card className="luxury-card border-none p-8 bg-zinc-950 text-white flex flex-col justify-center text-center shadow-2xl border-primary/10 relative">
            <div className="absolute top-4 left-4 opacity-5"><Wallet size={40} /></div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">الرصيد المتاح</p>
            <div className="text-4xl md:text-6xl font-black mb-2 tracking-tighter text-primary">{formatUSD(profile?.walletBalance || 0)}</div>
            <div className="text-[9px] md:text-[10px] font-black text-zinc-600 opacity-60 uppercase">{formatSDG(profile?.walletBalance || 0, config?.siteInfo?.usdRate)}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
           <Card className="luxury-card p-8 md:p-10 border-none bg-card/60 backdrop-blur-xl shadow-xl">
              <h3 className="text-lg md:text-xl font-black mb-3 flex items-center gap-3"><Zap size={18} className="text-primary animate-pulse" /> {config?.walletPage?.uidTitle || "بروتوكول الإيداع"}</h3>
              <p className="text-[11px] md:text-sm text-zinc-500 mb-6 leading-relaxed font-medium">{config?.walletPage?.uidDesc || "استخدم معرفك (UID) الموحد للشحن عبر الوكلاء المعتمدين."}</p>
              <div className="bg-muted/40 p-5 md:p-6 rounded-2xl border-2 border-dashed border-primary/20 flex items-center justify-between cursor-pointer group" onClick={() => copyToClipboard(user?.uid || "")}>
                 <span className="font-mono font-black text-xs md:text-base truncate max-w-[200px] md:max-w-none">{user?.uid}</span>
                 <Copy size={18} className="text-zinc-400 group-hover:text-primary transition-colors shrink-0" />
              </div>
           </Card>

           <Card className="luxury-card p-8 md:p-10 flex items-center gap-6 md:gap-8 border-none bg-primary/5 shadow-xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-background rounded-2xl md:rounded-[2rem] flex items-center justify-center border-2 border-primary/10 shadow-inner shrink-0">
                 <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
              </div>
              <div>
                 <h4 className="font-black text-lg md:text-2xl mb-1">حالة التوثيق</h4>
                 <Badge className="bg-green-500/10 text-green-600 border-none px-4 py-1.5 rounded-full font-black text-[8px] md:text-[9px] uppercase tracking-widest">IDENTITY VERIFIED</Badge>
              </div>
           </Card>
        </div>

        <Card className="luxury-card border-none overflow-hidden bg-card/60 shadow-2xl">
          <CardHeader className="p-6 md:p-8 border-b flex flex-row-reverse items-center justify-between bg-muted/10">
            <CardTitle className="text-lg md:text-xl font-black flex flex-row-reverse items-center gap-3"><History size={20} className="text-primary" /> {config?.walletPage?.ledgerTitle || "سجل التدفقات المالية"}</CardTitle>
            <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">Master Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px] responsive-table">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right py-5 md:py-6 pr-6 md:pr-10 font-black uppercase text-[8px] md:text-[10px]">العملية</TableHead>
                    <TableHead className="text-right font-black uppercase text-[8px] md:text-[10px]">التصنيف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[8px] md:text-[10px]">القيمة</TableHead>
                    <TableHead className="text-center font-black uppercase text-[8px] md:text-[10px]">التوقيت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin text-primary mx-auto" /></TableCell></TableRow>
                  ) : transactions?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-40 italic text-xs font-bold">لا توجد سجلات مالية مسجلة</TableCell></TableRow>
                  ) : transactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b">
                      <TableCell className="py-5 md:py-6 pr-6 md:pr-10 font-bold text-[11px] md:text-sm">{t.description}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[7px] md:text-[8px] font-black uppercase rounded-lg border-primary/10">{t.type}</Badge></TableCell>
                      <TableCell className={`font-black text-base md:text-xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>{formatUSD(t.amount)}</TableCell>
                      <TableCell className="text-center text-[8px] md:text-[10px] font-black text-muted-foreground uppercase">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
