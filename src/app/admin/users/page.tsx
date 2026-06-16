"use client";

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Phone, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUsersIntelligence() {
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
        owner: 'المالك العام', admin: 'المدير التنفيذي', gm: 'مدير العمليات', store_manager: 'مشرف المستودع',
        design_manager: 'مشرف التصاميم', designer: 'مصمم معتمد', accountant: 'المحاسب المالي',
        support: 'الدعم الفني', middleman: 'وسيط معتمد', agent: 'وكيل شحن', user: 'عضو موثق'
      };
      await updateDoc(doc(db, "users", userId), { role: newRole, label: labels[newRole] || 'عضو موثق' });
      toast({ title: "تم التحديث السيادي للرتبة" });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'banned' ? 'active' : 'banned';
    await updateDoc(doc(db, "users", userId), { communityStatus: nextStatus });
    toast({ title: `تم ${nextStatus === 'banned' ? 'حظر' : 'تنشيط'} العضو بنجاح` });
  };

  const filtered = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
        <div>
           <h1 className="text-4xl font-headline font-black gold-text leading-tight">سجلات الاستخبارات والرقابة</h1>
           <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Universal Identity & Security Control</p>
        </div>
        <div className="flex gap-4 bg-card p-4 rounded-3xl border shadow-sm">
           <div className="text-center px-6 border-l">
              <p className="text-[7px] font-black text-muted-foreground uppercase mb-1">إجمالي الأعضاء</p>
              <p className="text-2xl font-black text-primary tracking-tighter">{users?.length || 0}</p>
           </div>
           <div className="text-center px-6 border-l">
              <p className="text-[7px] font-black text-muted-foreground uppercase mb-1">نشطون الآن</p>
              <p className="text-2xl font-black text-green-500 tracking-tighter">{users?.filter(u => u.communityStatus !== 'banned').length}</p>
           </div>
           <div className="text-center px-6">
              <p className="text-[7px] font-black text-muted-foreground uppercase mb-1">تحت الحظر</p>
              <p className="text-2xl font-black text-red-500 tracking-tighter">{users?.filter(u => u.communityStatus === 'banned').length}</p>
           </div>
        </div>
      </header>

      <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="p-6 md:p-8 border-b bg-muted/5">
           <div className="relative max-w-2xl w-full group">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <Input 
                placeholder="ابحث بالاسم، الهاتف، أو البريد الإلكتروني..." 
                className="pr-14 h-14 md:h-16 bg-background border-none rounded-2xl text-base md:text-lg font-black shadow-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(setSearchTerm(e.target.value))}
              />
           </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-hidden">
          <ScrollArea className="max-h-[70vh] responsive-table">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-20">
                <TableRow>
                  <TableHead className="text-right py-6 md:py-8 pr-12 font-black uppercase text-[9px] md:text-[10px] tracking-widest">الهوية السيادية</TableHead>
                  <TableHead className="text-right font-black uppercase text-[9px] md:text-[10px] tracking-widest">البيانات الفنية</TableHead>
                  <TableHead className="text-right font-black uppercase text-[9px] md:text-[10px] tracking-widest">السيولة (USD)</TableHead>
                  <TableHead className="text-right font-black uppercase text-[9px] md:text-[10px] tracking-widest">الأمن</TableHead>
                  <TableHead className="text-center font-black uppercase text-[9px] md:text-[10px] tracking-widest">التحكم المركزي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></TableCell></TableRow>
                ) : filtered?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-40 text-muted-foreground font-bold uppercase tracking-widest opacity-40">DATABASE_EMPTY: NO_MATCHES_FOUND</TableCell></TableRow>
                ) : filtered?.map((u) => (
                  <TableRow key={u.id} className="hover:bg-primary/5 border-b border-border/50 group transition-all duration-300">
                    <TableCell className="py-6 md:py-8 pr-12" data-label="الهوية">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="relative shrink-0">
                           <Avatar className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[1.25rem] border-2 border-primary/10 shadow-xl overflow-hidden">
                              <AvatarImage src={u.photoURL} className="object-cover" />
                              <AvatarFallback className="bg-zinc-100 font-black text-primary">XM</AvatarFallback>
                           </Avatar>
                           <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-background ${u.communityStatus === 'banned' ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`} />
                        </div>
                        <div className="flex flex-col truncate">
                           <span className="font-black text-base md:text-xl group-hover:text-primary transition-colors leading-none mb-1 truncate">{u.displayName}</span>
                           <span className="text-[8px] md:text-[9px] font-mono text-muted-foreground uppercase tracking-tighter truncate opacity-60">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-label="البيانات">
                       <div className="flex flex-col gap-1.5">
                          <span className="font-black text-xs flex items-center gap-2 text-foreground"><Phone size={12} className="text-primary" /> {u.phoneNumber || "---"}</span>
                          <div className="flex items-center gap-2">
                             <UserCheck size={12} className={u.isVerified ? "text-green-500" : "text-zinc-300"} />
                             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{u.isVerified ? 'VERIFIED' : 'PENDING'}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="font-black text-xl md:text-2xl text-primary tracking-tighter" data-label="الرصيد">{formatUSD(u.walletBalance || 0)}</TableCell>
                    <TableCell data-label="الأمان">
                       <Badge variant="outline" className={`rounded-full px-5 py-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest ${u.role === 'owner' ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-muted-foreground/30'}`}>
                          {u.role}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center" data-label="التحكم">
                       <div className="flex items-center justify-center gap-3 md:gap-4">
                          <Select defaultValue={u.role} onValueChange={(v) => handleUpdateRole(u.id, v)} disabled={isUpdating === u.id}>
                             <SelectTrigger className="w-36 md:w-44 h-10 md:h-12 rounded-xl bg-muted/40 border-none font-black text-[8px] md:text-[10px] uppercase tracking-widest shadow-sm">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent dir="rtl" className="rounded-2xl border-none shadow-2xl">
                                <SelectItem value="owner" className="font-black text-xs">المالك العام</SelectItem>
                                <SelectItem value="admin" className="font-black text-xs">المدير التنفيذي</SelectItem>
                                <SelectItem value="support" className="font-black text-xs">دعم فني</SelectItem>
                                <SelectItem value="agent" className="font-black text-xs">وكيل معتمد</SelectItem>
                                <SelectItem value="designer" className="font-black text-xs">مصمم معتمد</SelectItem>
                                <SelectItem value="user" className="font-black text-xs">عضو بريميوم</SelectItem>
                             </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className={`h-10 w-10 md:h-12 md:w-12 rounded-xl shadow-sm border ${u.communityStatus === 'banned' ? 'text-green-500 hover:bg-green-50 border-green-100' : 'text-red-500 hover:bg-red-50 border-red-100'}`} onClick={() => handleStatusChange(u.id, u.communityStatus)}>
                             <ShieldAlert size={20} />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
