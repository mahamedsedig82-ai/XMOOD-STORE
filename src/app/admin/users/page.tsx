
"use client";

import { useState } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, User as UserIcon, Wallet, Star } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminUsers() {
  const db = useFirestore();
  const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const { data: users, loading } = useCollection(usersQuery);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateRole = (userId: string, newRole: string) => {
    setIsUpdating(userId);
    const userRef = doc(db, "users", userId);
    
    updateDoc(userRef, { role: newRole })
      .then(() => {
        toast({ title: "تم تحديث الرتبة", description: `المستخدم الآن في رتبة: ${newRole}` });
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: { role: newRole }
        }));
      })
      .finally(() => setIsUpdating(null));
  };

  const filteredUsers = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-3xl font-headline font-bold mb-1">إدارة الأعضاء والرتب</h1>
        <p className="text-muted-foreground text-sm">تحكم في صلاحيات المستخدمين، منح الرتب، ومراقبة محافظهم.</p>
      </header>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem]">
        <CardHeader className="bg-slate-50/50 p-6 border-b">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="البحث بالاسم، البريد، أو المعرف..." 
              className="pr-10 h-12 rounded-2xl bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right py-4 font-bold">المستخدم</TableHead>
                <TableHead className="text-right font-bold">المحفظة</TableHead>
                <TableHead className="text-right font-bold">الرتبة الحالية</TableHead>
                <TableHead className="text-right font-bold">تاريخ الانضمام</TableHead>
                <TableHead className="text-center font-bold">تغيير الرتبة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">جاري تحميل الأعضاء...</TableCell></TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">لم يتم العثور على نتائج</TableCell></TableRow>
              ) : filteredUsers?.map((u) => (
                <TableRow key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                        <UserIcon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{u.displayName}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-primary font-black">
                      <Wallet size={14} />
                      {formatUSD(u.walletBalance || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : u.role === 'agent' ? 'secondary' : 'outline'} className="rounded-full font-bold text-[10px] px-3">
                      {u.role === 'admin' ? 'مدير عام' : u.role === 'agent' ? 'وكيل معتمد' : 'عضو XMOOD'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '---'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select 
                      disabled={isUpdating === u.uid}
                      defaultValue={u.role} 
                      onValueChange={(val) => handleUpdateRole(u.uid, val)}
                    >
                      <SelectTrigger className="w-32 h-10 text-xs rounded-xl mx-auto font-bold border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl" dir="rtl">
                        <SelectItem value="user" className="font-bold text-xs py-3">عضو عادي</SelectItem>
                        <SelectItem value="agent" className="font-bold text-xs py-3">وكيل شحن</SelectItem>
                        <SelectItem value="admin" className="font-bold text-xs py-3">مدير نظام</SelectItem>
                        <SelectItem value="vip" className="font-bold text-xs py-3">عميل VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-8">
            <Star className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">رتبة الوكيل</h3>
            <p className="text-xs text-slate-400 leading-relaxed">الوكلاء هم عصب المنصة، يمتلكون صلاحية شحن أرصدة العملاء والظهور في قائمة الموزعين المعتمدين.</p>
         </Card>
         <Card className="border-none shadow-sm rounded-3xl bg-white p-8">
            <Shield className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">رتبة المدير</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">المدراء يمتلكون صلاحية الدخول للوحة التحكم، تعديل المنتجات، مراقبة المالية، وتغيير رتب الأعضاء.</p>
         </Card>
         <Card className="border-none shadow-sm rounded-3xl bg-primary text-white p-8">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <UserIcon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">رتبة VIP</h3>
            <p className="text-xs text-white/80 leading-relaxed">مخصصة لكبار العملاء، تمنحهم خصومات حصرية على باقات الشحن والخدمات الرقمية الفاخرة.</p>
         </Card>
      </div>
    </div>
  );
}
