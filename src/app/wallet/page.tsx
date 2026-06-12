
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, ArrowRightLeft, Trophy, Star, TrendingUp, Camera, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy, doc, updateDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function WalletPage() {
  const { profile, user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState("");

  const transactionsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: transactions, loading: transLoading } = useCollection(transactionsQuery);

  const handleUpdateProfile = async () => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: newDisplayName || profile?.displayName,
        photoURL: newPhotoURL || profile?.photoURL
      });
      setIsEditing(false);
      toast({ title: "تم التحديث", description: "تم تحديث بيانات ملفك الشخصي بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث البيانات." });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "المعرف الرقمي جاهز للتقديم." });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-primary" /></div>;

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-black font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-primary/10 pb-12">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 rounded-3xl border-2 border-primary/30">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setNewDisplayName(profile?.displayName || "");
                  setNewPhotoURL(profile?.photoURL || "");
                }}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-black rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <div>
              <h1 className="text-5xl font-headline font-bold gold-text leading-tight">{profile?.displayName}</h1>
              <p className="text-slate-500 font-bold">{profile?.fullName}</p>
              <Badge className="bg-primary/20 text-primary border-primary/30 mt-2 px-4 py-1 rounded-full text-[10px] uppercase font-black tracking-widest">{profile?.label}</Badge>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button asChild className="h-16 px-10 royal-button text-lg">
              <Link href="/wallet/transfer"><ArrowRightLeft className="ml-2" /> تحويل P2P</Link>
            </Button>
          </div>
        </header>

        {isEditing && (
          <Card className="luxury-card border-none p-10 mb-12 animate-fade-in">
            <h3 className="text-xl font-bold mb-6 gold-text">تعديل الهوية الرقمية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 pr-4">اسم العرض</label>
                <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-14 bg-white/5 border-none rounded-2xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 pr-4">رابط الصورة الشخصية</label>
                <Input value={newPhotoURL} onChange={e => setNewPhotoURL(e.target.value)} className="h-14 bg-white/5 border-none rounded-2xl" />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <Button onClick={handleUpdateProfile} className="bg-primary text-black font-black px-8 h-14 rounded-2xl">حفظ التغييرات</Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-slate-500 h-14 rounded-2xl">إلغاء</Button>
            </div>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <Card className="luxury-card border-none relative overflow-hidden p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-primary/60 mb-4">الرصيد المتاح</p>
            <div className="text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">{formatUSD(balance)}</div>
            <div className="text-xl font-bold text-slate-500 uppercase tracking-widest">{formatSDG(balance)}</div>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden legendary-border p-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
               <div className="flex items-center gap-4 text-primary">
                  <ShieldCheck size={32} />
                  <h3 className="text-2xl font-bold gold-text">بروتوكول الشحن المعتمد</h3>
               </div>
               <p className="text-slate-400 leading-relaxed font-bold text-sm">
                  يتم شحن الرصيد حصرياً عبر شبكة الوكلاء. قدم معرفك الرقمي ليتم تحديث الخزانة فوراً.
               </p>
               <div className="flex items-center gap-4">
                  <div className="bg-black/40 px-8 py-4 rounded-3xl border border-dashed border-primary/30 flex items-center gap-4 cursor-pointer" onClick={() => copyToClipboard(user?.uid || "")}>
                    <span className="font-mono font-black text-2xl text-primary">{user?.uid?.substring(0, 12).toUpperCase()}</span>
                    <Copy size={18} className="text-primary/60" />
                  </div>
               </div>
            </div>
            <div className="w-full md:w-auto p-6 bg-white/5 rounded-3xl text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-4">كود الطوارئ</p>
              <div className="bg-slate-900 p-4 rounded-xl border border-white/10 font-mono text-xs text-primary blur-[4px] hover:blur-none transition-all">
                {profile?.emergencyCode}
              </div>
            </div>
          </Card>
        </div>

        <Card className="luxury-card border-none overflow-hidden">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between bg-white/5">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
              <History size={28} className="text-primary" /> سجل التدفق المالي السيادي
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest">Secured Chain Registry</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-right py-8 pr-10 font-black uppercase text-[10px] text-primary/40">الطرف الآخر</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] text-primary/40">الإجراء</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] text-primary/40">المبلغ</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] text-primary/40">التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                    <TableCell className="py-10 pr-10">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarImage src={t.type === 'transfer_send' ? t.targetUserPhoto : t.senderUserPhoto} />
                          <AvatarFallback className="bg-slate-800 text-[10px] font-bold text-white">X</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white">
                            {t.type === 'transfer_send' ? t.targetUserName : t.senderUserName || "النظام"}
                          </span>
                          <span className="text-[9px] text-slate-500 font-black">{new Date(t.createdAt).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-full font-black text-[10px] uppercase ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {t.type === 'deposit' ? 'إيداع' : t.type === 'transfer_send' ? 'تحويل مرسل' : t.type === 'transfer_receive' ? 'تحويل مستلم' : 'شراء'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-black text-3xl ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-slate-400 text-[10px] font-black uppercase leading-relaxed max-w-xs">
                      {t.description}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-40 opacity-10 font-black text-2xl uppercase tracking-widest">No Transactions Registered</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
