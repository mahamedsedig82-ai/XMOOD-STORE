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
      toast({ title: "تم التحديث" });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    await updateDoc(doc(db, "users", userId), { communityStatus: nextStatus });
    toast({ title: `تم ${nextStatus === 'banned' ? 'حظر' : 'تنشيط'} العضو` });
  };

  const filtered = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-10">
        <div>
           <h1 className="text-4xl font-headline font-black gold-text">سجلات الأعضاء والتحري</h1>
           <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Universal User Identity & Security Management</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-8 py-2 rounded-full font-black text-[10px] tracking-widest">
           DATABASE ACTIVE: {users?.length || 0} RECORDS
        </Badge>
      </header>

      <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 border-b flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/5">
           <div className="relative max-w-2xl w-full">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="ابحث بالاسم، الهاتف، أو البريد الإلكتروني..." 
                className="pr-14 h-14 bg-background border-none rounded-2xl text-lg font-bold"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-4">
              <div className="text-center px-6 border-r">
                 <p className="text-[8px] font-black text-muted-foreground uppercase">نشطون حالياً</p>
                 <p className="text-xl font-black text-green-500">{users?.filter(u => u.communityStatus !== 'banned').length}</p>
              </div>
              <div className="text-center px-6">
                 <p className="text-[8px] font-black text-muted-foreground uppercase">محظورون</p>
                 <p className="text-xl font-black text-red-500">{users?.filter(u => u.communityStatus === 'banned').length}</p>
              </div>
           </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="max-h-[800px] responsive-table">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-20">
                <TableRow>
                  <TableHead className="text-right py-8 pr-12 font-black uppercase text-[10px]">العضو والبيانات</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px]">الهاتف / العمر</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px]">المحفظة</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px]">الأمن</TableHead>
                  <TableHead className="text-center font-black uppercase text-[10px]">التحكم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={50} /></TableCell></TableRow>
                ) : filtered?.map((u) => (
                  <TableRow key={u.id} className="hover:bg-primary/5 border-b border-border/50 group transition-all">
                    <TableCell className="py-8 pr-12">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                           <img src={u.photoURL || `https://picsum.photos/seed/${u.id}/100/100`} className="w-16 h-16 rounded-2xl object-cover border shadow-xl" alt="" />
                           <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background ${u.communityStatus === 'banned' ? 'bg-red-500' : 'bg-green-500'}`} />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-black text-lg group-hover:text-primary transition-colors">{u.displayName}</span>
                           <span className="text-[10px] font-mono text-muted-foreground uppercase">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="font-bold text-sm flex items-center gap-2"><Phone size={12} className="text-primary" /> {u.phoneNumber || "---"}</span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase mt-1">العمر: {u.age || "غير محدد"} عاماً</span>
                       </div>
                    </TableCell>
                    <TableCell className="font-black text-xl text-primary tracking-tighter">{formatUSD(u.walletBalance || 0)}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className={`rounded-full px-4 text-[8px] font-black uppercase ${u.securityLevel === 'sovereign' ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-zinc-200'}`}>
                          {u.securityLevel || 'basic'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-4">
                          <Select defaultValue={u.role} onValueChange={(v) => handleUpdateRole(u.id, v)}>
                             <SelectTrigger className="w-36 h-10 rounded-xl bg-muted/50 border-none font-bold text-[10px] uppercase">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent dir="rtl">
                                <SelectItem value="owner">المالك</SelectItem>
                                <SelectItem value="admin">مدير</SelectItem>
                                <SelectItem value="support">دعم</SelectItem>
                                <SelectItem value="user">عضو</SelectItem>
                             </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className={`h-10 w-10 rounded-xl ${u.communityStatus === 'banned' ? 'text-green-500' : 'text-red-500'}`} onClick={() => handleStatusChange(u.id, u.communityStatus)}>
                             <ShieldAlert size={18} />
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
