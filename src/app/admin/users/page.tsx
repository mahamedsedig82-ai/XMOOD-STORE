
"use client";

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, User as UserIcon, Wallet, Star, Loader2 } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsers() {
  const db = useFirestore();
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: users, loading } = useCollection(usersQuery);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast({ title: "تم تحديث الرتبة", description: `رتبة المستخدم الآن: ${newRole}` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "ليس لديك صلاحية" });
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
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-4xl font-headline font-bold gold-text">إدارة النخبة والرتب</h1>
        <p className="text-muted-foreground mt-2">منح الصلاحيات، ترقية الوكلاء، ومراقبة نشاط الحسابات.</p>
      </header>

      <Card className="luxury-card border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="ابحث بالاسم، البريد، أو المعرف..." 
              className="pr-10 h-12 bg-white/5 border-none rounded-2xl"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right py-6 pr-10">المستخدم</TableHead>
                <TableHead className="text-right">المحفظة</TableHead>
                <TableHead className="text-right">الرتبة</TableHead>
                <TableHead className="text-right">تاريخ الانضمام</TableHead>
                <TableHead className="text-center">تغيير الرتبة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filtered?.map((u) => (
                <TableRow key={u.id} className="hover:bg-white/5 border-b border-white/5 transition-colors">
                  <TableCell className="py-6 pr-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <UserIcon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{u.displayName}</span>
                        <span className="text-[10px] opacity-40 uppercase font-black">{u.uid?.substring(0,10)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary">{formatUSD(u.walletBalance || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : u.role === 'agent' ? 'secondary' : 'outline'} className="rounded-full">
                      {u.role === 'admin' ? 'مدير عام' : u.role === 'agent' ? 'وكيل معتمد' : 'عضو XMOOD'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs opacity-50">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '---'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select 
                      disabled={isUpdating === u.id}
                      defaultValue={u.role} 
                      onValueChange={(val) => handleUpdateRole(u.id, val)}
                    >
                      <SelectTrigger className="w-32 h-10 bg-white/5 border-none mx-auto font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10" dir="rtl">
                        <SelectItem value="user">عضو عادي</SelectItem>
                        <SelectItem value="agent">وكيل شحن</SelectItem>
                        <SelectItem value="admin">مدير نظام</SelectItem>
                        <SelectItem value="vip">عميل VIP</SelectItem>
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
