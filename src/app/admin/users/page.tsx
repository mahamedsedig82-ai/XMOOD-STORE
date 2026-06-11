
"use client";

import { useState } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCog, Shield, User as UserIcon, Wallet } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsers() {
  const db = useFirestore();
  const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const { data: users, loading } = useCollection(usersQuery);
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast({ title: "تم التحديث", description: "تم تغيير رتبة المستخدم بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الرتبة" });
    }
  };

  const filteredUsers = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold mb-1">إدارة الأعضاء</h1>
          <p className="text-muted-foreground text-sm">تحكم في صلاحيات المستخدمين والاطلاع على محافظهم.</p>
        </div>
      </header>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 p-6 border-b">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="البحث بالاسم، البريد، أو ID..." 
              className="pr-10 h-11 rounded-xl bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">المحفظة</TableHead>
                <TableHead className="text-right">الرتبة</TableHead>
                <TableHead className="text-right">تاريخ الانضمام</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">جاري التحميل...</TableCell></TableRow>
              ) : filteredUsers?.map((u) => (
                <TableRow key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <UserIcon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{u.displayName}</span>
                        <span className="text-[10px] text-muted-foreground">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Wallet size={14} />
                      {formatUSD(u.walletBalance || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="rounded-md font-bold text-[10px]">
                      {u.role === 'admin' ? 'مدير عام' : u.role === 'agent' ? 'وكيل معتمد' : 'عضو'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select defaultValue={u.role} onValueChange={(val) => handleUpdateRole(u.uid, val)}>
                      <SelectTrigger className="w-32 h-9 text-xs rounded-lg mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">عضو</SelectItem>
                        <SelectItem value="agent">وكيل</SelectItem>
                        <SelectItem value="admin">مدير</SelectItem>
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
