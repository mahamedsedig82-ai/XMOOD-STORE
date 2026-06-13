
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, ArrowRightLeft, Edit2, Zap, UserCheck, Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function WalletPagePRO() {
  const { profile, user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const transactionsRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: transactions, loading: transLoading } = useCollection(transactionsRef);

  const handleUpdateProfile = async () => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: newDisplayName || profile?.displayName,
        phoneNumber: newPhone || profile?.phoneNumber
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
      <Loader2 className="animate-spin text-primary" size={50} />
    </div>
  );

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-black font-body text-white" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 animate-fade-up max-w-6xl">
        
        {/* Sovereign Header Section */}
        <header className="mb-16 flex flex-col md:flex-row justify-between items-center gap-10 border-b border-white/5 pb-16">
          <div className="flex items-center gap-8">
            <Avatar className="w-32 h-32 rounded-[2rem] border-2 border-primary/20 shadow-2xl">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <h1 className="text-5xl font-headline font-bold gold-text leading-tight">{profile?.displayName}</h1>
              <div className="flex items-center gap-2 text-zinc-500 mt-2 font-bold">
                 <Phone size={14} className="text-primary" />
                 <span>{profile?.phoneNumber || "لم يتم ربط رقم"}</span>
              </div>
              <Badge className="bg-red-600/10 text-red-500 border-red-600/20 mt-4 px-6 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">{profile?.label || "عضو موثق"}</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button onClick={() => setIsEditing(true)} variant="outline" className="h-14 rounded-2xl border-white/10 hover:bg-white/5">
              <Edit2 size={18} className="ml-2" /> تعديل البيانات
            </Button>
            <Button asChild className="royal-button h-16 px-12 text-xl">
              <Link href="/wallet/transfer"><ArrowRightLeft className="ml-4" size={24} /> تحويل رصيد</Link>
            </Button>
          </div>
        </header>

        {isEditing && (
          <Card className="luxury-card border-none p-10 mb-16 animate-fade-in">
            <h3 className="text-2xl font-bold mb-10 gold-text flex items-center gap-3"><UserCheck size={24} /> تحديث الملف الشخصي</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-zinc-500 pr-4">الاسم المعروض</label>
                <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-14 bg-black border-white/10 rounded-xl" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-zinc-500 pr-4">رقم الهاتف المرتبط</label>
                <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-14 bg-black border-white/10 rounded-xl" />
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <Button onClick={handleUpdateProfile} className="royal-button h-14 px-10">حفظ</Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost">إلغاء</Button>
            </div>
          </Card>
        )}
        
        {/* Financial Assets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="luxury-card border-none relative overflow-hidden p-12 bg-zinc-950">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-8">إجمالي الرصيد</p>
            <div className="text-7xl font-black text-white mb-6 tracking-tighter">{formatUSD(balance)}</div>
            <div className="text-xl font-bold text-zinc-500 uppercase tracking-widest">{formatSDG(balance)}</div>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-12 flex flex-col md:flex-row items-center gap-12 bg-zinc-950">
            <div className="flex-1 space-y-8 text-right">
               <div className="flex items-center gap-4 text-primary">
                  <Zap size={32} />
                  <h3 className="text-3xl font-bold gold-text">معرف الشحن الشخصي</h3>
               </div>
               <p className="text-zinc-500 font-medium">
                  استخدم هذا المعرف أو رقم هاتفك الموثق لشحن رصيدك عبر الوكلاء المعتمدين فوراً.
               </p>
               <div className="bg-black px-8 py-4 rounded-2xl border border-dashed border-primary/30 flex items-center gap-6 cursor-pointer hover:bg-primary/5 transition-all" onClick={() => copyToClipboard(user?.uid || "")}>
                  <span className="font-mono font-bold text-2xl text-primary tracking-widest">{user?.uid?.substring(0, 14).toUpperCase()}</span>
                  <Copy size={20} className="text-primary/30" />
               </div>
            </div>
            <div className="w-full md:w-64 p-8 bg-black rounded-3xl text-center border border-white/5 shadow-2xl">
              <ShieldCheck size={40} className="text-green-500 mx-auto mb-4" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">التحقق من الهاتف</p>
              <Badge className="mt-2 bg-green-500/10 text-green-500 border-none font-black">{profile?.phoneNumber ? 'نشط' : 'مطلوب'}</Badge>
            </div>
          </Card>
        </div>

        {/* Transaction History Section */}
        <Card className="luxury-card border-none overflow-hidden bg-zinc-950/20">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-bold flex items-center gap-5">
              <History size={32} className="text-red-500" /> سجل العمليات
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-bold px-6 py-2 rounded-full">آخر التحركات</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-right py-8 pr-12 font-bold uppercase text-[10px] text-zinc-600">العملية</TableHead>
                  <TableHead className="text-right font-bold uppercase text-[10px] text-zinc-600">النوع</TableHead>
                  <TableHead className="text-right font-bold uppercase text-[10px] text-zinc-600">القيمة</TableHead>
                  <TableHead className="text-right font-bold uppercase text-[10px] text-zinc-600">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-32"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                    <TableCell className="py-10 pr-12">
                       <span className="font-bold text-lg text-white">{t.description}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-full font-bold text-[9px] px-4 py-1 border ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {t.type === 'deposit' ? 'إيداع' : t.type === 'transfer_send' ? 'تحويل صادر' : t.type === 'transfer_receive' ? 'تحويل وارد' : 'شراء'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-bold text-3xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-xs font-bold">
                       {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-40 opacity-20 font-bold text-3xl uppercase tracking-widest">لا توجد عمليات</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
