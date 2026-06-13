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
      toast({ title: "تم تحديث البيانات السيادية", description: "تم ربط معلوماتك الجديدة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث", description: "تأكد من الصلاحيات والاتصال." });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ بنجاح", description: "معرفك الشخصي متاح الآن في الحافظة." });
  };

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-24 h-24 border-t-4 border-primary border-r-4 border-r-red-600 rounded-[2rem] animate-spin" />
    </div>
  );

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-black font-body text-white pb-20 overflow-x-hidden" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 animate-fade-in max-w-6xl">
        
        {/* Sovereign Header Section */}
        <Card className="luxury-card border-none overflow-hidden mb-12 p-8 md:p-12 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-primary to-red-600 shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right flex-1">
              <div className="relative group">
                <Avatar className="w-36 h-36 rounded-[3rem] border-4 border-primary/20 shadow-2xl transition-all duration-500 group-hover:border-primary/50 group-hover:scale-105">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-zinc-900 text-primary text-5xl font-black">
                    {profile?.displayName?.charAt(0) || "X"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-black p-2.5 rounded-2xl border-4 border-black shadow-2xl animate-float">
                  <Award size={24} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl md:text-6xl font-headline font-bold gold-text leading-tight mb-2">{profile?.displayName}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="bg-red-600/20 text-red-500 border-red-600/30 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{profile?.role}</Badge>
                    <Badge variant="outline" className="border-primary/20 text-primary text-[10px] px-6 py-1.5 rounded-full font-black tracking-widest">{profile?.label || "XMOOD SOVEREIGN MEMBER"}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-panel p-4 flex items-center gap-3">
                    <Mail size={16} className="text-red-600" />
                    <span className="text-xs font-bold text-zinc-400 truncate">{profile?.email}</span>
                  </div>
                  <div className="glass-panel p-4 flex items-center gap-3">
                    <Smartphone size={16} className="text-primary" />
                    <span className="text-xs font-bold text-zinc-400">{profile?.phoneNumber || "رقم غير مربوط"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                variant="outline" 
                className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest transition-all"
              >
                {isEditing ? "إلغاء التعديل" : <><Edit2 size={18} className="ml-3 text-primary" /> تعديل الملف السيادي</>}
              </Button>
              <Button asChild className="royal-button h-20 px-16 text-xl">
                <Link href="/wallet/transfer"><ArrowRightLeft className="ml-4" size={28} /> تحويل فوري</Link>
              </Button>
            </div>
          </div>

          {isEditing && (
            <div className="mt-12 pt-12 border-t border-white/5 animate-fade-in space-y-8">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <UserCheck size={24} />
                 </div>
                 <h3 className="text-2xl font-bold gold-text">تحديث البيانات الشخصية</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4 text-right">
                  <label className="text-[10px] font-black uppercase text-zinc-500 pr-6 tracking-widest">الاسم المعروض للنخبة</label>
                  <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-16 bg-black/80 border-white/10 rounded-3xl px-8 font-black text-xl text-primary" />
                </div>
                <div className="space-y-4 text-right">
                  <label className="text-[10px] font-black uppercase text-zinc-500 pr-6 tracking-widest">رقم الهاتف (للتواصل والشحن)</label>
                  <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-16 bg-black/80 border-white/10 rounded-3xl px-8 font-black text-xl text-left" placeholder="+966xxxxxxxxx" />
                </div>
              </div>
              <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full md:w-auto royal-button h-16 px-16">
                {isUpdating ? <Loader2 className="animate-spin" /> : "حفظ التغييرات الكلية"}
              </Button>
            </div>
          )}
        </Card>
        
        {/* Financial Assets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <Card className="luxury-card border-none relative overflow-hidden p-12 bg-zinc-950 flex flex-col justify-center min-h-[350px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-8 flex items-center gap-3">
                <TrendingUp size={16} /> الرصيد السيادي الكلي
              </p>
              <div className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">{formatUSD(balance)}</div>
              <div className="text-xl font-bold text-zinc-500 uppercase tracking-[0.3em]">{formatSDG(balance)}</div>
            </div>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-12 flex flex-col md:flex-row items-center gap-12 bg-zinc-950 min-h-[350px]">
            <div className="flex-1 space-y-8 text-right">
               <div className="flex items-center gap-5 text-primary">
                  <Zap size={32} className="animate-pulse" />
                  <h3 className="text-3xl font-bold gold-text">بروتوكول الشحن الرقمي</h3>
               </div>
               <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-xl">
                  استخدم معرفك السيادي أو رقم الهاتف الموثق أدناه لشحن رصيدك فوراً عبر شبكة وكلائنا المعتمدين حول العالم.
               </p>
               <div className="space-y-4">
                  <div 
                    className="bg-black/80 px-10 py-6 rounded-[2rem] border border-dashed border-primary/30 flex items-center justify-between gap-6 cursor-pointer hover:bg-primary/5 transition-all group shadow-inner" 
                    onClick={() => copyToClipboard(user?.uid || "")}
                  >
                      <span className="font-mono font-black text-2xl md:text-3xl text-primary tracking-widest uppercase">{user?.uid?.substring(0, 16)}...</span>
                      <Copy size={24} className="text-zinc-700 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="bg-primary/5 px-10 py-5 rounded-[2rem] border border-primary/10 flex items-center justify-between">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">رقم الاتصال المعتمد</span>
                     <span className="font-black text-white text-xl tracking-[0.2em]">{profile?.phoneNumber || "غير مربوط"}</span>
                  </div>
               </div>
            </div>
            <div className="w-full md:w-72 p-10 bg-black/60 rounded-[3rem] text-center border border-white/5 shadow-2xl flex flex-col items-center justify-center gap-6">
              {isVerified ? (
                <CheckCircle size={64} className="text-green-500" />
              ) : (
                <ShieldCheck size={64} className="text-red-500 animate-pulse" />
              )}
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">حالة الحساب</p>
                <Badge className={`px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${isVerified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {isVerified ? 'Verified Sovereign' : 'Pending Activation'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction History Section */}
        <Card className="luxury-card border-none overflow-hidden bg-zinc-950/40 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <CardHeader className="p-12 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-6">
              <History size={32} className="text-red-600" /> سجل التدفقات المالية السيادية
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black px-8 py-2.5 rounded-full tracking-[0.4em]">Live Ledger Active</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[700px] w-full">
              <Table>
                <TableHeader className="bg-black/60 sticky top-0 z-20 backdrop-blur-md">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-right py-8 pr-12 font-black uppercase text-[10px] text-zinc-500 tracking-widest">العملية والوصف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500 tracking-widest">التصنيف</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500 tracking-widest">المبلغ الصافي</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500 tracking-widest">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-32"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
                  ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                      <TableCell className="py-10 pr-12">
                        <span className="font-black text-lg text-zinc-200 block">{t.description}</span>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">ID: {t.id?.substring(0,12)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full font-black text-[9px] px-6 py-1.5 border uppercase tracking-widest ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {t.type === 'deposit' ? 'Refill' : t.type === 'transfer_send' ? 'Outgoing' : t.type === 'transfer_receive' ? 'Incoming' : 'Purchase'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-black text-3xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs font-bold pl-12">
                        {new Date(t.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-48">
                        <History size={80} className="mx-auto text-zinc-900 mb-8 opacity-20" />
                        <p className="font-black text-zinc-700 uppercase tracking-[0.5em] text-sm">No Financial Records Found</p>
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