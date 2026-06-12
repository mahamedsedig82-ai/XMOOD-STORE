
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, ArrowRightLeft, Edit2, Zap } from "lucide-react";
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
      toast({ title: "تم التحديث الملكي", description: "تم تعديل بيانات هويتك الرقمية." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التعديل", description: "تأكد من اتصالك بالمنصة." });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "المعرف الرقمي جاهز للتقديم للوكيل." });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-primary" size={60} /></div>;

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-black font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 animate-fade-in max-w-7xl">
        
        <header className="mb-20 flex flex-col md:flex-row justify-between items-center gap-10 border-b border-primary/10 pb-20">
          <div className="flex items-center gap-10">
            <div className="relative group">
              <Avatar className="w-32 h-32 rounded-[2.5rem] border-4 border-primary/20 shadow-2xl">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback className="bg-primary/10 text-primary text-5xl font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setNewDisplayName(profile?.displayName || "");
                  setNewPhotoURL(profile?.photoURL || "");
                }}
                className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary text-black rounded-2xl flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 size={20} />
              </button>
            </div>
            <div className="text-center md:text-right">
              <h1 className="text-6xl font-headline font-bold gold-text leading-tight">{profile?.displayName}</h1>
              <p className="text-slate-500 font-bold text-xl mt-2">{profile?.fullName}</p>
              <Badge className="bg-primary/20 text-primary border-primary/30 mt-4 px-6 py-1.5 rounded-full text-[10px] uppercase font-black tracking-[0.4em]">{profile?.label}</Badge>
            </div>
          </div>
          <div className="flex gap-6 w-full md:w-auto">
            <Button asChild className="h-20 px-16 royal-button text-2xl shadow-primary/40">
              <Link href="/wallet/transfer"><ArrowRightLeft className="ml-4" size={28} /> تحويل P2P فوري</Link>
            </Button>
          </div>
        </header>

        {isEditing && (
          <Card className="luxury-card border-none p-12 mb-20 animate-fade-in legendary-border">
            <h3 className="text-3xl font-bold mb-10 gold-text">تحديث الهوية السيادية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 pr-4 tracking-widest">اسم العرض (Alias)</label>
                <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-16 bg-black border-primary/10 rounded-2xl px-8 text-white text-lg font-bold" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 pr-4 tracking-widest">رابط الأيقونة الشخصية</label>
                <Input value={newPhotoURL} onChange={e => setNewPhotoURL(e.target.value)} className="h-16 bg-black border-primary/10 rounded-2xl px-8 text-white text-lg font-bold" />
              </div>
            </div>
            <div className="mt-12 flex gap-6">
              <Button onClick={handleUpdateProfile} className="bg-primary text-black font-black px-12 h-16 rounded-3xl text-xl">حفظ التغييرات</Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-slate-500 h-16 rounded-3xl text-xl">إلغاء</Button>
            </div>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <Card className="luxury-card border-none relative overflow-hidden p-12 legendary-border">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[150px] rounded-full"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-primary/60 mb-6">الرصيد السيادي المتاح</p>
            <div className="text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">{formatUSD(balance)}</div>
            <div className="text-2xl font-bold text-slate-500 uppercase tracking-widest">{formatSDG(balance)}</div>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-12 flex flex-col md:flex-row items-center gap-16 bg-zinc-950">
            <div className="flex-1 space-y-8">
               <div className="flex items-center gap-6 text-primary">
                  <Zap size={40} className="animate-pulse" />
                  <h3 className="text-4xl font-bold gold-text">بروتوكول الشحن المركزي</h3>
               </div>
               <p className="text-slate-400 leading-relaxed font-bold text-lg">
                  تنبيه: يتم شحن الأرصدة حصرياً عبر شبكة الوكلاء المعتمدين. قدم معرفك الرقمي ليتم تحديث خزانتك فوراً.
               </p>
               <div className="flex items-center gap-6">
                  <div className="bg-black px-10 py-6 rounded-[2rem] border border-dashed border-primary/40 flex items-center gap-6 cursor-pointer hover:bg-primary/5 transition-all" onClick={() => copyToClipboard(user?.uid || "")}>
                    <span className="font-mono font-black text-3xl text-primary">{user?.uid?.substring(0, 14).toUpperCase()}</span>
                    <Copy size={24} className="text-primary/60" />
                  </div>
               </div>
            </div>
            <div className="w-full md:w-64 p-8 bg-black rounded-3xl text-center border border-white/5">
              <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-[0.4em]">رمز الطوارئ</p>
              <div className="bg-zinc-900 p-6 rounded-2xl border border-primary/10 font-mono text-sm text-primary/30 blur-[6px] hover:blur-none transition-all cursor-help">
                {profile?.emergencyCode}
              </div>
            </div>
          </Card>
        </div>

        <Card className="luxury-card border-none overflow-hidden legendary-border">
          <CardHeader className="p-12 border-b border-white/5 flex flex-row items-center justify-between bg-zinc-950">
            <CardTitle className="text-3xl font-bold flex items-center gap-6">
              <History size={32} className="text-primary" /> سجل التدفق المالي العالي
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-[0.5em] px-6 py-2">Secured Sovereign Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-right py-10 pr-12 font-black uppercase text-[11px] text-primary/40 tracking-[0.3em]">الطرف المقابل</TableHead>
                  <TableHead className="text-right font-black uppercase text-[11px] text-primary/40 tracking-[0.3em]">نوع الإجراء</TableHead>
                  <TableHead className="text-right font-black uppercase text-[11px] text-primary/40 tracking-[0.3em]">القيمة</TableHead>
                  <TableHead className="text-right font-black uppercase text-[11px] text-primary/40 tracking-[0.3em]">البيانات الوصفية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-32"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                    <TableCell className="py-12 pr-12">
                      <div className="flex items-center gap-6">
                        <Avatar className="w-14 h-14 border border-primary/20 shadow-xl">
                          <AvatarImage src={t.type === 'transfer_send' ? t.targetUserPhoto : t.senderUserPhoto} />
                          <AvatarFallback className="bg-zinc-900 text-xs font-black text-primary">XM</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-black text-lg text-white">
                            {t.type === 'transfer_send' ? t.targetUserName : t.senderUserName || "XMOOD SYSTEM"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-black mt-1 uppercase">{new Date(t.createdAt).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-full font-black text-[10px] uppercase px-4 py-1.5 ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {t.type === 'deposit' ? 'إيداع إداري' : t.type === 'transfer_send' ? 'تحويل مرسل' : t.type === 'transfer_receive' ? 'تحويل مستلم' : 'شراء أصول'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-black text-4xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm font-bold leading-relaxed max-w-sm">
                      {t.description}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-60 opacity-10 font-black text-5xl uppercase tracking-[0.5em] italic">No Transactions</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
