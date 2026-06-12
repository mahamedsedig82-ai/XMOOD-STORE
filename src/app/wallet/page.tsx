
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, ArrowRightLeft, Edit2, Zap, UserCheck, AlertTriangle } from "lucide-react";
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
      toast({ title: "تم التحديث السيادي", description: "تم تعديل هويتك الرقمية بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التعديل", description: "تأكد من اتصالك بالشبكة السيادية." });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم نسخ المعرف", description: "المعرف الرقمي جاهز للتقديم للوكيل." });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-primary" size={60} /></div>;

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-black font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 animate-fade-in max-w-7xl">
        
        <header className="mb-20 flex flex-col md:flex-row justify-between items-center gap-12 border-b border-primary/10 pb-20">
          <div className="flex items-center gap-12">
            <div className="relative group">
              <Avatar className="w-40 h-40 rounded-[3rem] border-4 border-primary/20 shadow-2xl overflow-hidden">
                <AvatarImage src={profile?.photoURL} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-6xl font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setNewDisplayName(profile?.displayName || "");
                  setNewPhotoURL(profile?.photoURL || "");
                }}
                className="absolute -bottom-4 -right-4 w-14 h-14 bg-primary text-black rounded-[1.5rem] flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <Edit2 size={24} />
              </button>
            </div>
            <div className="text-right">
              <h1 className="text-7xl font-headline font-bold gold-text leading-tight">{profile?.displayName}</h1>
              <p className="text-slate-500 font-bold text-2xl mt-4">{profile?.fullName || "المواطن الرقمي"}</p>
              <Badge className="bg-primary/20 text-primary border-primary/30 mt-6 px-8 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.5em]">{profile?.label}</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full md:w-auto items-end">
            <Button asChild className="h-24 px-20 royal-button text-3xl shadow-primary/30">
              <Link href="/wallet/transfer"><ArrowRightLeft className="ml-6" size={32} /> تحويل P2P فوري</Link>
            </Button>
            <div className="flex items-center gap-4 text-amber-500 bg-amber-500/5 px-8 py-3 rounded-2xl border border-amber-500/20">
              <AlertTriangle size={20} />
              <span className="text-sm font-bold">شحن الرصيد يتم حصرياً عبر الوكلاء المعتمدين</span>
            </div>
          </div>
        </header>

        {isEditing && (
          <Card className="luxury-card border-none p-12 mb-20 animate-fade-in legendary-border">
            <h3 className="text-3xl font-bold mb-12 gold-text flex items-center gap-4">
              <UserCheck size={32} /> تحديث بيانات الهوية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 pr-6 tracking-widest">الاسم المستعار (Alias)</label>
                <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="h-18 bg-black border-primary/10 rounded-2xl px-8 text-white text-xl font-bold" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 pr-6 tracking-widest">رابط الصورة الشخصية</label>
                <Input value={newPhotoURL} onChange={e => setNewPhotoURL(e.target.value)} className="h-18 bg-black border-primary/10 rounded-2xl px-8 text-white text-xl font-bold" />
              </div>
            </div>
            <div className="mt-16 flex gap-8">
              <Button onClick={handleUpdateProfile} className="h-20 px-16 royal-button text-2xl">حفظ التغييرات</Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-slate-500 h-20 px-16 rounded-[2rem] text-2xl hover:bg-white/5 transition-all">إلغاء</Button>
            </div>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
          <Card className="luxury-card border-none relative overflow-hidden p-16 legendary-border group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[200px] rounded-full group-hover:bg-primary/20 transition-all"></div>
            <p className="text-[11px] font-black uppercase tracking-[0.8em] text-primary/60 mb-10">السيادة المالية المتاحة</p>
            <div className="text-9xl font-black text-white mb-8 tracking-tighter drop-shadow-2xl">{formatUSD(balance)}</div>
            <div className="text-3xl font-bold text-slate-500 uppercase tracking-[0.3em]">{formatSDG(balance)}</div>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-16 flex flex-col md:flex-row items-center gap-20 bg-zinc-950">
            <div className="flex-1 space-y-10 text-right">
               <div className="flex items-center gap-8 text-primary">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20 animate-pulse">
                    <Zap size={44} />
                  </div>
                  <h3 className="text-5xl font-bold gold-text">معرف الخزانة الرقمية</h3>
               </div>
               <p className="text-slate-400 leading-relaxed font-bold text-xl">
                  هذا المعرف هو بصمتك المالية في XMOOD. قدمه للوكلاء المعتمدين لشحن رصيدك فوراً في الوقت الحقيقي.
               </p>
               <div className="flex items-center gap-8">
                  <div className="bg-black px-12 py-8 rounded-[2.5rem] border border-dashed border-primary/40 flex items-center gap-8 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => copyToClipboard(user?.uid || "")}>
                    <span className="font-mono font-black text-4xl text-primary tracking-widest">{user?.uid?.substring(0, 14).toUpperCase()}</span>
                    <Copy size={32} className="text-primary/40 group-hover:text-primary" />
                  </div>
               </div>
            </div>
            <div className="w-full md:w-80 p-10 bg-black rounded-[3rem] text-center border border-white/5 relative">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
              <p className="text-[10px] font-black text-slate-600 uppercase mb-6 tracking-[0.5em] relative z-10">Emergency Recovery</p>
              <div className="bg-zinc-900 p-8 rounded-[2rem] border border-primary/10 font-mono text-lg text-primary/20 blur-[8px] hover:blur-none transition-all cursor-help relative z-10">
                {profile?.emergencyCode}
              </div>
              <p className="text-[9px] text-slate-700 mt-6 uppercase tracking-widest relative z-10">Security Shield Active</p>
            </div>
          </Card>
        </div>

        <Card className="luxury-card border-none overflow-hidden legendary-border">
          <CardHeader className="p-16 border-b border-white/5 flex flex-row items-center justify-between bg-zinc-950">
            <CardTitle className="text-4xl font-bold flex items-center gap-8">
              <History size={40} className="text-primary" /> سجل التدفقات السيادية
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[12px] font-black tracking-[0.6em] px-10 py-3 rounded-full">Verified Ledger Protocol</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-right py-12 pr-16 font-black uppercase text-[12px] text-primary/40 tracking-[0.4em]">الكيان المقابل</TableHead>
                  <TableHead className="text-right font-black uppercase text-[12px] text-primary/40 tracking-[0.4em]">بروتوكول الإجراء</TableHead>
                  <TableHead className="text-right font-black uppercase text-[12px] text-primary/40 tracking-[0.4em]">القيمة الرقمية</TableHead>
                  <TableHead className="text-right font-black uppercase text-[12px] text-primary/40 tracking-[0.4em]">التفاصيل السيادية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5 group">
                    <TableCell className="py-16 pr-16">
                      <div className="flex items-center gap-8">
                        <Avatar className="w-18 h-18 border border-primary/20 shadow-2xl">
                          <AvatarImage src={t.type === 'transfer_send' ? t.targetUserPhoto : t.senderUserPhoto} className="object-cover" />
                          <AvatarFallback className="bg-zinc-900 text-xs font-black text-primary">XM</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-black text-2xl text-white group-hover:text-primary transition-colors">
                            {t.type === 'transfer_send' ? t.targetUserName : t.senderUserName || "XMOOD SYSTEM"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-black mt-2 uppercase tracking-widest">{new Date(t.createdAt).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-full font-black text-[11px] uppercase px-6 py-2 border ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {t.type === 'deposit' ? 'إيداع مركزي' : t.type === 'transfer_send' ? 'تحويل صادر' : t.type === 'transfer_receive' ? 'تحويل وارد' : 'حيازة أصل'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-black text-5xl tracking-tighter ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-slate-400 text-lg font-bold leading-relaxed max-w-sm">
                      {t.description}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-80 opacity-10 font-black text-7xl uppercase tracking-[0.6em] italic">No Transactions</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
