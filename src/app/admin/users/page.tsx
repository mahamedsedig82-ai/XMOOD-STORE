"use client";

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy, limit, deleteDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, User as UserIcon, Star, Loader2, Award, Zap, Eye, Phone, MapPin, Calendar, Clock, ShieldAlert, Trash2 } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
    <div className="space-y-6 md:space-y-10 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6 md:pb-10">
        <div>
           <h1 className="text-3xl md:text-4xl font-headline font-black gold-text leading-tight">سجلات الأعضاء والتحري</h1>
           <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Universal User Identity & Security Management</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-6 md:px-8 py-2 rounded-full font-black text-[9px] md:text-[10px] tracking-widest shadow-sm">
           DATABASE ACTIVE: {users?.length || 0} RECORDS
        </Badge>
      </header>

      <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="p-6 md:p-8 border-b flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/5">
           <div className="relative max-w-2xl w-full group">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <Input 
                placeholder="ابحث بالاسم، الهاتف، أو البريد الإلكتروني..." 
                className="pr-14 h-14 md:h-16 bg-background border-none rounded-2xl text-base md:text-lg font-black shadow-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-4 md:gap-8 bg-background/50 p-4 rounded-2xl md:rounded-3xl border w-full md:w-auto">
              <div className="text-center px-4 md:px-6 border-l flex-1">
                 <p className="text-[7px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">نشطون</p>
                 <p className="text-xl md:text-2xl font-black text-green-500 tracking-tighter">{users?.filter(u => u.communityStatus !== 'banned').length}</p>
              </div>
              <div className="text-center px-4 md:px-6 flex-1">
                 <p className="text-[7px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">محظورون</p>
                 <p className="text-xl md:text-2xl font-black text-red-500 tracking-tighter">{users?.filter(u => u.communityStatus === 'banned').length}</p>
              </div>
           </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-hidden">
          <ScrollArea className="max-h-[70vh] responsive-table">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-20">
                <TableRow>
                  <TableHead className="text-right py-6 md:py-8 pr-12 font-black uppercase text-[9px] md:text-[10px] tracking-widest">العضو والبيانات السيادية</TableHead>
                  <TableHead className="text-right font-black uppercase text-[9px] md:text-[10px] tracking-widest">التواصل المباشر</TableHead>
                  <TableHead className="text-right font-black uppercase text-[9px] md:text-[10px] tracking-widest">رصيد المحفظة</TableHead>
                  <TableHead className="text-right font-black uppercase text-[9px] md:text-[10px] tracking-widest">الأمن والتوثيق</TableHead>
                  <TableHead className="text-center font-black uppercase text-[9px] md:text-[10px] tracking-widest">وحدة التحكم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></TableCell></TableRow>
                ) : filtered?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-40 text-muted-foreground font-bold">لم نجد أي أعضاء مطابقين لبحثك السيادي.</TableCell></TableRow>
                ) : filtered?.map((u) => (
                  <TableRow key={u.id} className="hover:bg-primary/5 border-b border-border/50 group transition-all duration-300">
                    <TableCell className="py-6 md:py-8 pr-12" data-label="العضو">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="relative shrink-0">
                           <Avatar className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.25rem] border-2 border-primary/10 shadow-xl overflow-hidden">
                              <AvatarImage src={u.photoURL} className="object-cover" />
                              <AvatarFallback className="bg-zinc-100 font-black text-primary">XM</AvatarFallback>
                           </Avatar>
                           <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-background ${u.communityStatus === 'banned' ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`} />
                        </div>
                        <div className="flex flex-col truncate">
                           <span className="font-black text-base md:text-xl group-hover:text-primary transition-colors leading-none mb-1 truncate">{u.displayName}</span>
                           <span className="text-[8px] md:text-[10px] font-mono text-muted-foreground uppercase tracking-tighter truncate">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-label="التواصل">
                       <div className="flex flex-col">
                          <span className="font-black text-sm flex items-center gap-2 text-foreground"><Phone size={12} className="text-primary" /> {u.phoneNumber || "---"}</span>
                          <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase mt-1 tracking-widest">Verified: {u.isVerified ? 'YES' : 'NO'}</span>
                       </div>
                    </TableCell>
                    <TableCell className="font-black text-xl md:text-2xl text-primary tracking-tighter" data-label="الرصيد">{formatUSD(u.walletBalance || 0)}</TableCell>
                    <TableCell data-label="الأمان">
                       <Badge variant="outline" className={`rounded-full px-4 md:px-5 py-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest ${u.securityLevel === 'sovereign' ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-muted-foreground/30'}`}>
                          {u.securityLevel || 'standard'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center" data-label="التحكم">
                       <div className="flex items-center justify-center gap-3 md:gap-4">
                          <Select defaultValue={u.role} onValueChange={(v) => handleUpdateRole(u.id, v)}>
                             <SelectTrigger className="w-32 md:w-40 h-10 md:h-11 rounded-xl bg-muted/40 border-none font-black text-[8px] md:text-[9px] uppercase tracking-widest shadow-sm">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent dir="rtl" className="rounded-2xl border-none shadow-2xl">
                                <SelectItem value="owner" className="font-black text-xs">المالك</SelectItem>
                                <SelectItem value="admin" className="font-black text-xs">مدير تنفيذي</SelectItem>
                                <SelectItem value="support" className="font-black text-xs">دعم فني</SelectItem>
                                <SelectItem value="agent" className="font-black text-xs">وكيل معتمد</SelectItem>
                                <SelectItem value="user" className="font-black text-xs">عضو بريميوم</SelectItem>
                             </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className={`h-10 w-10 md:h-11 md:w-11 rounded-xl shadow-sm border ${u.communityStatus === 'banned' ? 'text-green-500 hover:bg-green-50 border-green-100' : 'text-red-500 hover:bg-red-50 border-red-100'}`} onClick={() => handleStatusChange(u.id, u.communityStatus)}>
                             <ShieldAlert size={18} md:size={20} />
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