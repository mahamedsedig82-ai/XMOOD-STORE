
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, ArrowRightLeft, Edit2, Zap, UserCheck, Phone, Mail, Award, TrendingUp } from "lucide-react";
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

export default function WalletPagePRO() {
  const { profile, user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setNewDisplayName(profile.displayName || "");
      setNewPhone(profile.phoneNumber || "");
    }
  }, [profile]);

  const transactionsRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: transactions, loading: transLoading } = useCollection(transactionsRef);

  const handleUpdateProfile = async () => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: newDisplayName,
        phoneNumber: newPhone
      });
      setIsEditing(false);
      toast({ title: "تم التحديث", description: "تم تحديث بياناتك بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء التحديث." });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "المعرف الشخصي جاهز الآن." });
  };

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-24 h-24 border-t-4 border-primary border-r-4 border-r-red-600 rounded-[2rem] animate-spin" />
    </div>
  );

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-black font-body text-white pb-20" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 animate-fade-up max-w-6xl">
        
        {/* Sovereign Header Section */}
        <Card className="luxury-card border-none overflow-hidden mb-12 p-8 md:p-12 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-primary to-red-600" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
              <div className="relative">
                <Avatar className="w-32 h-32 rounded-[2.5rem] border-4 border-primary/20 shadow-2xl">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-zinc-900 text-primary text-4xl font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-black p-2 rounded-xl border-4 border-black shadow-xl">
                  <Award size={20} />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-headline font-bold gold-text leading-tight">{profile?.displayName}</h1>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 font-bold">
                    <Mail size={14} className="text-red-500" />
                    <span className="text-xs">{profile?.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 font-bold">
                    <Phone size={14} className="text-primary" />
                    <span className="text-xs">{profile?.phoneNumber || "لم يتم ربط رقم"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                  <Badge className="bg-red-600/10 text-red-500 border-red-600/20 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">{profile?.role}</Badge>
                  <Badge variant="outline" className="border-primary/20 text-primary text-[9px] px-4 py-1 rounded-full font-bold">{profile?.label || "عضو بريميوم"}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="h-14 rounded-2xl border-white/10 hover:bg-white/5 font-bold">
                <Edit2 size={18} className="ml-3" /> {isEditing ? "إلغاء التعديل" : "تعديل الملف الشخصي"}
              </Button>
              <Button asChild className="royal-button h-16 px-12 text-lg">
                <Link href="/wallet/transfer"><ArrowRightLeft className="ml-4" size={24} /> تحويل رصيد سريع</Link>
              </Button>
            </div>
          </div>

          {isEditing && (
            <div className="mt-12 pt-12 border-t border-white/5 animate-fade-in space-y-8">
              <h3 className="text-xl font-bold gold-text flex items-center gap-3"><UserCheck size={20} /> تحديث البيانات الشخصية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 text-right">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 pr-4">الاسم المعروض</label>
                  <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-14 bg-black/60 border-white/10 rounded-2xl px-6 font-bold" />
                </div>
                <div className="space-y-3 text-right">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 pr-4">رقم الهاتف للتواصل</label>
                  <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-14 bg-black/60 border-white/10 rounded-2xl px-6 font-bold text-left" />
                </div>
              </div>
              <Button onClick={handleUpdateProfile} className="w-full md:w-auto royal-button h-14 px-12">حفظ التغييرات</Button>
            </div>
          )}
        </Card>
        
        {/* Financial Assets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="luxury-card border-none relative overflow-hidden p-10 bg-zinc-950 flex flex-col justify-center min-h-[300px]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> إجمالي الرصيد السيادي
              </p>
              <div className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-none">{formatUSD(balance)}</div>
              <div className="text-lg font-bold text-zinc-500 uppercase tracking-widest">{formatSDG(balance)}</div>
            </div>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-10 flex flex-col md:flex-row items-center gap-10 bg-zinc-950 min-h-[300px]">
            <div className="flex-1 space-y-6 text-right">
               <div className="flex items-center gap-4 text-primary">
                  <Zap size={28} className="animate-pulse" />
                  <h3 className="text-2xl font-bold gold-text">معرف الشحن الرقمي</h3>
               </div>
               <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                  استخدم المعرف الفريد أو رقم الهاتف الموثق لشحن رصيدك عبر الوكلاء في ثوانٍ.
               </p>
               <div className="space-y-3">
                  <div 
                    className="bg-black/60 px-8 py-5 rounded-2xl border border-dashed border-primary/30 flex items-center justify-between gap-6 cursor-pointer hover:bg-primary/5 transition-all group" 
                    onClick={() => copyToClipboard(user?.uid || "")}
                  >
                      <span className="font-mono font-bold text-xl md:text-2xl text-primary tracking-widest uppercase">{user?.uid?.substring(0, 14)}...</span>
                      <Copy size={20} className="text-zinc-600 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="bg-primary/5 px-8 py-4 rounded-2xl border border-primary/10 flex items-center justify-between">
                     <span className="text-xs font-bold text-zinc-500">رقم الهاتف المعتمد</span>
                     <span className="font-bold text-white tracking-widest">{profile?.phoneNumber || "غير مربوط"}</span>
                  </div>
               </div>
            </div>
            <div className="w-full md:w-60 p-8 bg-black/80 rounded-[2.5rem] text-center border border-white/5 shadow-inner">
              <ShieldCheck size={48} className="text-green-500 mx-auto mb-4" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">حالة الحساب</p>
              <Badge className={`px-6 py-1.5 rounded-full font-black text-[10px] ${profile?.phoneNumber ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {profile?.phoneNumber ? 'موثق هاتفياً' : 'بانتظار الربط'}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Transaction History Section */}
        <Card className="luxury-card border-none overflow-hidden bg-zinc-950/40 shadow-2xl">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-5">
              <History size={28} className="text-red-600" /> سجل التدفقات المالية
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[9px] font-bold px-6 py-2 rounded-full">الأحدث أولاً</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px] w-full overflow-auto">
              <Table>
                <TableHeader className="bg-black/60 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-right py-6 pr-10 font-bold uppercase text-[9px] text-zinc-500">العملية</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[9px] text-zinc-500">التصنيف</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[9px] text-zinc-500">المبلغ</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[9px] text-zinc-500">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                      <TableCell className="py-8 pr-10">
                        <span className="font-bold text-base text-zinc-200">{t.description}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full font-bold text-[8px] px-4 py-1 border ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {t.type === 'deposit' ? 'شحن رصيد' : t.type === 'transfer_send' ? 'تحويل صادر' : t.type === 'transfer_receive' ? 'تحويل وارد' : 'شراء منتج'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-black text-2xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-[10px] font-bold">
                        {new Date(t.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-40">
                        <History size={60} className="mx-auto text-zinc-900 mb-6" />
                        <p className="font-bold text-zinc-700 uppercase tracking-widest text-xs">لا توجد حركات مالية مسجلة</p>
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
