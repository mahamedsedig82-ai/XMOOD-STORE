"use client";

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, User as UserIcon, Star, Loader2, Award, Zap } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminUsersManagement() {
  const db = useFirestore();
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("createdAt", "desc"), limit(200));
  }, [db]);

  const { data: users, loading } = useCollection(usersQuery);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      const labels: Record<string, string> = {
        owner: 'المالك العام',
        admin: 'المدير التنفيذي',
        gm: 'مدير العمليات',
        store_manager: 'مشرف المستودع',
        design_manager: 'مشرف التصاميم',
        designer: 'مصمم معتمد',
        accountant: 'المحاسب المالي',
        support: 'الدعم الفني',
        middleman: 'وسيط معتمد',
        agent: 'وكيل شحن',
        user: 'عضو موثق'
      };

      await updateDoc(doc(db, "users", userId), { 
        role: newRole,
        label: labels[newRole] || 'عضو موثق'
      });
      toast({ title: "تم تحديث الرتبة", description: `الدور الجديد للمستخدم: ${labels[newRole]}` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الصلاحيات", description: "تأكد من امتلاكك صلاحيات تعديل الرتب." });
    } finally {
      setIsUpdating(null);
    }
  };

  const filtered = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">إدارة الأعضاء والرتب</h1>
          <p className="text-zinc-500 mt-3 font-bold uppercase tracking-widest text-[10px]">XMOOD Professional Role Management Center</p>
        </div>
        <div className="flex gap-4">
           <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
              <Zap className="text-primary animate-pulse" size={24} />
              <div>
                <span className="text-[8px] font-black text-zinc-500 block uppercase">إجمالي الأعضاء</span>
                <span className="text-lg font-black text-white">{users?.length || 0}</span>
              </div>
           </div>
        </div>
      </header>

      <Card className="luxury-card border-none overflow-hidden bg-zinc-950/40 shadow-2xl">
        <CardHeader className="p-10 border-b border-white/5 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative max-w-xl w-full">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <Input 
              placeholder="ابحث بالاسم، البريد، أو المعرف الرقمي..." 
              className="pr-14 h-14 bg-black border-none rounded-2xl text-lg font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge className="bg-primary text-black font-black px-6 py-2 rounded-full uppercase text-[10px] tracking-widest">Digital Records Active</Badge>
        </CardHeader>
        <CardContent className="p-0 responsive-table">
          <Table>
            <TableHeader className="bg-black/60">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-right py-8 pr-12 font-black uppercase text-[10px] text-zinc-500">العضو والهوية</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500">المحفظة</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500">الرتبة</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] text-zinc-500">التاريخ</TableHead>
                <TableHead className="text-center font-black uppercase text-[10px] text-zinc-500">تعديل الدور</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
              ) : filtered?.map((u) => (
                <TableRow key={u.id} className="hover:bg-primary/5 border-b border-white/5 transition-all group">
                  <TableCell className="py-8 pr-12" data-label="العضو">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                         <img src={u.photoURL || `https://picsum.photos/seed/${u.id}/100/100`} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/5 shadow-xl group-hover:border-primary/40 transition-all" alt="" />
                         {u.role === 'owner' && <Award className="absolute -top-2 -right-2 text-primary bg-black rounded-full p-1" size={20} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-white group-hover:gold-text transition-colors">{u.displayName}</span>
                        <span className="text-[9px] opacity-40 font-mono uppercase tracking-tighter">{u.uid}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary text-xl tracking-tighter" data-label="الرصيد">{formatUSD(u.walletBalance || 0)}</TableCell>
                  <TableCell data-label="الرتبة">
                    <Badge variant="outline" className={`rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest ${
                      u.role === 'owner' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                      u.role === 'admin' ? 'text-primary border-primary/20 bg-primary/5' : 
                      'text-zinc-500 border-white/5 bg-white/5'
                    }`}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-500" data-label="انضمام">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '---'}
                  </TableCell>
                  <TableCell className="text-center" data-label="تغيير">
                    <Select 
                      disabled={isUpdating === u.id}
                      defaultValue={u.role} 
                      onValueChange={(val) => handleUpdateRole(u.id, val)}
                    >
                      <SelectTrigger className="w-44 h-12 bg-zinc-900 border-none mx-auto font-black text-[10px] uppercase rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 text-white" dir="rtl">
                        <SelectItem value="owner">المالك العام</SelectItem>
                        <SelectItem value="admin">المدير التنفيذي</SelectItem>
                        <SelectItem value="gm">مدير العمليات</SelectItem>
                        <SelectItem value="accountant">المحاسب المالي</SelectItem>
                        <SelectItem value="design_manager">مشرف التصاميم</SelectItem>
                        <SelectItem value="designer">مصمم معتمد</SelectItem>
                        <SelectItem value="middleman">وسيط معتمد</SelectItem>
                        <SelectItem value="agent">وكيل شحن</SelectItem>
                        <SelectItem value="support">دعم فني</SelectItem>
                        <SelectItem value="user">عضو موثق</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
