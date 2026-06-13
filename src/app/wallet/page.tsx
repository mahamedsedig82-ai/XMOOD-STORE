
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, ArrowRightLeft, Edit2, Zap, UserCheck, Phone, Mail, Award, TrendingUp, CheckCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy, doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SovereignWalletPage() {
  const { profile, user, loading: userLoading, isVerified } = useUser();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setNewDisplayName(profile.displayName || "");
      setNewPhone(profile.phoneNumber || "");
    }
  }, [profile]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: transactions, loading: transLoading } = useCollection(transactionsQuery);

  const handleUpdateProfile = async () => {
    if (!user || !db) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: newDisplayName,
        phoneNumber: newPhone,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
      toast({ title: "تم التحديث", description: "تم ربط معلوماتك الجديدة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث", description: "تأكد من الصلاحيات والاتصال." });
    } finally {
      setIsUpdating(false);
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

  return (
    <main className="min-h-screen bg-black font-body text-white pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-6xl animate-fade-in">
        
        {/* Header: Unified Profile & Identity */}
        <Card className="luxury-card border-none overflow-hidden mb-12 p-8 md:p-12 relative bg-zinc-950/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-primary to-red-600" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right flex-1">
              <div className="relative group">
                <Avatar className="w-32 h-32 rounded-[2.5rem] border-4 border-primary/20 shadow-2xl transition-all group-hover:border-primary/50">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-zinc-900 text-primary text-4xl font-black">
                    {profile?.displayName?.charAt(0) || "X"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-black p-2 rounded-xl border-4 border-black shadow-2xl">
                  <Award size={20} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-headline font-bold gold-text mb-2">{profile?.displayName}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="bg-red-600/20 text-red-500 border-red-600/30 px-4 py-1 rounded-full text-[8px] font-black uppercase">{profile?.role}</Badge>
                    <Badge variant="outline" className="border-primary/20 text-primary text-[8px] px-4 py-1 rounded-full font-black uppercase">{profile?.label || "XMOOD MEMBER"}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <Mail size={14} className="text-red-600" />
                    <span className="text-[10px] font-bold text-zinc-400 truncate">{profile?.email}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <Smartphone size={14} className="text-primary" />
                    <span className="text-[10px] font-bold text-zinc-400">{profile?.phoneNumber || "غير مربوط"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="h-12 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[9px]">
                {isEditing ? "إلغاء" : <><Edit2 size={14} className="ml-2" /> تعديل الملف</>}
              </Button>
              <Button asChild className="royal-button h-16 px-10 text-sm">
                <Link href="/wallet/transfer"><ArrowRightLeft className="ml-3" size={20} /> تحويل</Link>
              </Button>
            </div>
          </div>

          {isEditing && (
            <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 pr-4">الاسم المعروض</label>
                  <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-12 bg-black border-white/10 rounded-xl px-6 font-bold text-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 pr-4">رقم الهاتف</label>
                  <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-12 bg-black border-white/10 rounded-xl px-6 font-bold text-left" placeholder="+966" />
                </div>
              </div>
              <Button onClick={handleUpdateProfile} disabled={isUpdating} className="royal-button h-12 px-10">
                {isUpdating ? <Loader2 className="animate-spin" /> : "حفظ التغييرات"}
              </Button>
            </div>
          )}
        </Card>
        
        {/* Assets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="luxury-card border-none relative overflow-hidden p-10 bg-zinc-950 flex flex-col justify-center min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> الرصيد السيادي
              </p>
              <div className="text-6xl font-black text-white mb-4 tracking-tighter leading-none">{formatUSD(balance)}</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">{formatSDG(balance)}</div>
            </div>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-10 flex flex-col md:flex-row items-center gap-10 bg-zinc-950 min-h-[300px]">
            <div className="flex-1 space-y-6">
               <div className="flex items-center gap-4 text-primary">
                  <Zap size={24} className="animate-pulse" />
                  <h3 className="text-2xl font-bold gold-text">بروتوكول الشحن</h3>
               </div>
               <p className="text-zinc-400 text-sm font-medium leading-relaxed">استخدم معرفك السيادي أو رقم الهاتف لشحن رصيدك عبر وكلائنا المعتمدين.</p>
               <div className="space-y-3">
                  <div className="bg-black px-6 py-4 rounded-2xl border border-dashed border-primary/30 flex items-center justify-between gap-4 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => copyToClipboard(user?.uid || "")}>
                      <span className="font-mono font-black text-lg text-primary tracking-widest uppercase">{user?.uid?.substring(0, 20)}...</span>
                      <Copy size={18} className="text-zinc-700 group-hover:text-primary" />
                  </div>
                  <div className="bg-primary/5 px-6 py-3 rounded-xl border border-primary/10 flex items-center justify-between">
                     <span className="text-[9px] font-black text-zinc-500 uppercase">الرقم الموثق</span>
                     <span className="font-black text-white text-lg">{profile?.phoneNumber || "غير مربوط"}</span>
                  </div>
               </div>
            </div>
            <div className="w-full md:w-56 p-8 bg-black/60 rounded-[2rem] text-center border border-white/5 flex flex-col items-center justify-center gap-4">
              {isVerified ? <CheckCircle size={48} className="text-green-500" /> : <ShieldCheck size={48} className="text-red-500 animate-pulse" />}
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">الحالة</p>
                <Badge className={`px-4 py-1 rounded-full font-black text-[8px] uppercase ${isVerified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Financial Ledger */}
        <Card className="luxury-card border-none overflow-hidden bg-zinc-950/40">
          <CardHeader className="p-8 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
              <History size={24} className="text-red-600" /> سجل التدفقات المالية
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[8px] font-black px-4 py-1.5 rounded-full">Live Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader className="bg-black/60 sticky top-0 z-20">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-right py-4 pr-10 font-black uppercase text-[9px] text-zinc-500">العملية</TableHead>
                    <TableHead className="text-right font-black uppercase text-[9px] text-zinc-500">التصنيف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[9px] text-zinc-500">المبلغ</TableHead>
                    <TableHead className="text-right font-black uppercase text-[9px] text-zinc-500">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : transactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                      <TableCell className="py-6 pr-10">
                        <span className="font-bold text-sm text-zinc-200 block">{t.description}</span>
                        <span className="text-[8px] text-zinc-600 font-bold mt-1">ID: {t.id?.substring(0,8)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full font-black text-[8px] px-3 py-0.5 border uppercase ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-black text-xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-[10px] font-bold">
                        {new Date(t.createdAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-zinc-700 font-bold uppercase tracking-widest text-[10px]">No Records</TableCell></TableRow>
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
