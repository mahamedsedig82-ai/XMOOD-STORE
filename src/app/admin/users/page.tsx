
"use client";

import { useState, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Phone, ShieldAlert, UserCheck, Wallet, Mail } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminUsersIntelligence() {
  const db = useFirestore();
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("createdAt", "desc"), limit(200));
  }, [db]);

  const { data: users, loading } = useCollection(usersQuery);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateRole = (userId: string, newRole: string) => {
    if (!db) return;
    setIsUpdating(userId);
    const labels: Record<string, string> = {
      owner: 'المالك العام', admin: 'المدير التنفيذي', gm: 'مدير العمليات', store_manager: 'مشرف المستودع',
      design_manager: 'مشرف التصاميم', designer: 'مصمم معتمد', accountant: 'المحاسب المالي',
      support: 'الدعم الفني', middleman: 'وسيط معتمد', agent: 'وكيل شحن', user: 'عضو موثق'
    };
    const userRef = doc(db, "users", userId);
    const data = { role: newRole, label: labels[newRole] || 'عضو موثق' };
    
    updateDoc(userRef, data)
      .then(() => {
        toast({ title: "تم التحديث السيادي للرتبة" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: data
        }));
      })
      .finally(() => setIsUpdating(null));
  };

  const handleStatusChange = (userId: string, currentStatus: string) => {
    if (!db) return;
    const nextStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const userRef = doc(db, "users", userId);
    updateDoc(userRef, { communityStatus: nextStatus })
      .then(() => {
        toast({ title: `تم ${nextStatus === 'banned' ? 'حظر' : 'تنشيط'} العضو بنجاح` });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update'
        }));
      });
  };

  const filtered = useMemo(() => {
    if (!users) return [];
    const search = searchTerm.toLowerCase();
    return users.filter(u => 
      u.displayName?.toLowerCase().includes(search) || 
      u.email?.toLowerCase().includes(search) ||
      u.phoneNumber?.includes(searchTerm)
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
             <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight">سجلات الاستخبارات والرقابة</h1>
             <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Universal Identity & Security Control Center</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <Card className="flex-1 md:w-40 p-4 bg-card border-none shadow-xl text-center">
                <p className="text-[7px] font-black text-muted-foreground uppercase mb-1">إجمالي الأعضاء</p>
                <p className="text-2xl font-black text-primary">{users?.length || 0}</p>
             </Card>
             <Card className="flex-1 md:w-40 p-4 bg-green-500/5 border-green-500/20 shadow-xl text-center">
                <p className="text-[7px] font-black text-green-600 uppercase mb-1">النشطون</p>
                <p className="text-2xl font-black text-green-500">{users?.filter(u => u.communityStatus !== 'banned').length}</p>
             </Card>
             <Card className="flex-1 md:w-40 p-4 bg-red-500/5 border-red-500/20 shadow-xl text-center">
                <p className="text-[7px] font-black text-red-600 uppercase mb-1">تحت الحظر</p>
                <p className="text-2xl font-black text-red-500">{users?.filter(u => u.communityStatus === 'banned').length}</p>
             </Card>
          </div>
        </div>

        <div className="relative group max-w-3xl">
           <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={22} />
           <Input 
             placeholder="ابحث بالاسم، الهاتف، أو البريد الإلكتروني..." 
             className="pr-14 h-16 bg-card border-none rounded-2xl text-lg font-black shadow-2xl focus:ring-2 focus:ring-primary/20"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="responsive-table">
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50">
                  <TableHead className="text-right py-8 pr-12 font-black uppercase text-[10px] tracking-widest text-muted-foreground">الهوية السيادية</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">بيانات الاتصال</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">الرصيد المتاح</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">الأمن</TableHead>
                  <TableHead className="text-center font-black uppercase text-[10px] tracking-widest text-muted-foreground">التحكم المركزي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></TableCell></TableRow>
                ) : filtered?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-40 text-muted-foreground font-bold uppercase tracking-widest opacity-40">لا توجد سجلات</TableCell></TableRow>
                ) : filtered?.map((u) => (
                  <TableRow key={u.id} className="hover:bg-primary/5 border-b border-border/30 group transition-all duration-300">
                    <TableCell className="py-8 pr-12" data-label="الهوية">
                      <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                           <Avatar className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 border-primary/10 shadow-xl overflow-hidden">
                              <AvatarImage src={u.photoURL} className="object-cover" />
                              <AvatarFallback className="bg-zinc-100 font-black text-primary">XM</AvatarFallback>
                           </Avatar>
                           <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-background ${u.communityStatus === 'banned' ? 'bg-red-500' : 'bg-green-500'}`} />
                        </div>
                        <div className="flex flex-col truncate">
                           <span className="font-black text-base md:text-lg group-hover:text-primary transition-colors leading-none mb-1.5 truncate">{u.displayName}</span>
                           <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail size={10} className="text-primary" />
                              <span className="text-[9px] font-mono uppercase tracking-tighter truncate opacity-60">{u.email}</span>
                           </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-label="الاتصال">
                       <div className="flex flex-col gap-1.5">
                          <span className="font-black text-xs flex items-center gap-2 text-foreground"><Phone size={12} className="text-primary" /> {u.phoneNumber || "---"}</span>
                          <div className="flex items-center gap-2">
                             <UserCheck size={12} className={u.isVerified ? "text-green-500" : "text-zinc-300"} />
                             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{u.isVerified ? 'موثق' : 'قيد الانتظار'}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell data-label="الرصيد">
                       <div className="flex items-center gap-2 text-primary">
                          <Wallet size={16} />
                          <span className="font-black text-xl md:text-2xl tracking-tighter">{formatUSD(u.walletBalance || 0)}</span>
                       </div>
                    </TableCell>
                    <TableCell data-label="الأمن">
                       <Badge variant="outline" className={`rounded-full px-5 py-1 text-[8px] font-black uppercase tracking-widest ${u.role === 'owner' ? 'border-amber-500 text-amber-600 bg-amber-500/5' : 'border-muted-foreground/30'}`}>
                          {u.role}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center" data-label="التحكم">
                       <div className="flex items-center justify-center gap-4">
                          <Select defaultValue={u.role} onValueChange={(v) => handleUpdateRole(u.id, v)} disabled={isUpdating === u.id}>
                             <SelectTrigger className="w-36 md:w-44 h-11 rounded-xl bg-background border-border/50 font-black text-[9px] uppercase tracking-widest shadow-sm">
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
                          <Button size="icon" variant="ghost" className={`h-11 w-11 rounded-xl shadow-sm border ${u.communityStatus === 'banned' ? 'text-green-500 hover:bg-green-50 border-green-200' : 'text-red-500 hover:bg-red-50 border-red-200'}`} onClick={() => handleStatusChange(u.id, u.communityStatus)}>
                             <ShieldAlert size={20} />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
