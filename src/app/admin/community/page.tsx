
"use client";

import { useState, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, deleteDoc, addDoc, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, MessageSquare, ShieldAlert, BarChart3, 
  Trash2, CheckCircle, XCircle, AlertTriangle, 
  History, ShieldCheck, Eye, Search, Filter, Loader2
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CommunityAdminHub() {
  const { profile } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  // Real-time Queries
  const postsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "marketplace_listings"), orderBy("createdAt", "desc"), limit(100));
  }, [db]);

  const reportsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "community_reports"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
  }, [db]);

  const auditQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "community_audit_logs"), orderBy("createdAt", "desc"), limit(100));
  }, [db]);

  const { data: posts, loading: postsLoading } = useCollection(postsQuery);
  const { data: reports, loading: reportsLoading } = useCollection(reportsQuery);
  const { data: logs, loading: logsLoading } = useCollection(auditQuery);

  const stats = useMemo(() => ({
    totalPosts: posts?.length || 0,
    pendingReports: reports?.length || 0,
    activeUsers: Array.from(new Set(posts?.map(p => p.userId))).length
  }), [posts, reports]);

  const logAction = async (action: string, targetId: string, details: string) => {
    if (!profile || !db) return;
    await addDoc(collection(db, "community_audit_logs"), {
      adminId: profile.uid,
      adminName: profile.displayName,
      action,
      targetId,
      details,
      createdAt: new Date().toISOString()
    });
  };

  const handlePostAction = async (postId: string, action: 'hide' | 'delete' | 'restore') => {
    if (!db) return;
    try {
      if (action === 'delete') {
        if (!confirm("هل أنت متأكد من الحذف النهائي لهذا المنشور؟")) return;
        await deleteDoc(doc(db, "marketplace_listings", postId));
        logAction("ADMIN_PERMANENT_DELETE", postId, "حذف نهائي للمنشور من قاعدة البيانات");
      } else {
        await updateDoc(doc(db, "marketplace_listings", postId), { status: action === 'hide' ? 'hidden' : 'active' });
        logAction("ADMIN_STATUS_CHANGE", postId, `تغيير حالة المنشور إلى: ${action}`);
      }
      toast({ title: "تم تنفيذ الإجراء الإشرافي بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في تنفيذ الإجراء" });
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "community_reports", reportId), { status: action === 'resolve' ? 'resolved' : 'dismissed' });
      logAction("REPORT_HANDLED", reportId, `معالجة البلاغ كـ: ${action}`);
      toast({ title: "تم تحديث حالة البلاغ" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في المعالجة" });
    }
  };

  const filteredPosts = posts?.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-10">
        <div>
          <h1 className="text-4xl font-black gold-text">إدارة المجتمع والرقابة</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Professional Community Governance & Audit Console</p>
        </div>
        <div className="flex gap-4">
           <Card className="p-5 luxury-card border-primary/10 flex items-center gap-4">
              <div className="bg-red-500/10 text-red-500 p-3 rounded-xl"><ShieldAlert size={20} /></div>
              <div>
                <span className="text-[9px] font-black text-muted-foreground block uppercase">بلاغات معلقة</span>
                <span className="text-2xl font-black text-red-500">{stats.pendingReports}</span>
              </div>
           </Card>
           <Card className="p-5 luxury-card border-primary/10 flex items-center gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-xl"><Users size={20} /></div>
              <div>
                <span className="text-[9px] font-black text-muted-foreground block uppercase">ناشرون نشطون</span>
                <span className="text-2xl font-black text-primary">{stats.activeUsers}</span>
              </div>
           </Card>
        </div>
      </header>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 border mb-8 flex gap-2">
          <TabsTrigger value="posts" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            المنشورات ({stats.totalPosts})
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white relative">
            البلاغات ({stats.pendingReports})
            {stats.pendingReports > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-red-600 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-red-600">!</span>}
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            سجل العمليات (Audit)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card className="luxury-card border-none overflow-hidden bg-card/40">
            <CardHeader className="p-8 border-b flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="relative w-full md:w-80">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input placeholder="بحث في المنشورات..." className="pr-12 h-12 bg-background border-none text-xs rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
               </div>
               <Badge variant="outline" className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">Real-time Feed Active</Badge>
            </CardHeader>
            <ScrollArea className="max-h-[600px] overflow-x-auto responsive-table">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="text-right py-6 pr-8 font-black text-[10px] uppercase">الناشر والعنوان</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase">التصنيف</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase">الحالة</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">إجراءات الرقابة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredPosts?.map((post: any) => (
                    <TableRow key={post.id} className="hover:bg-primary/5 border-b transition-all group">
                      <TableCell className="py-6 pr-8" data-label="الناشر">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 border shadow-sm">
                            <AvatarImage src={post.userPhoto} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{post.title}</p>
                            <p className="text-[10px] text-muted-foreground">بواسطة: {post.userName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-label="التصنيف"><Badge variant="secondary" className="text-[9px] uppercase px-3">{post.type}</Badge></TableCell>
                      <TableCell data-label="الحالة">
                        <Badge className={`text-[9px] uppercase px-3 border-none ${post.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center" data-label="الإجراءات">
                        <div className="flex justify-center gap-3">
                           <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted" onClick={() => handlePostAction(post.id, post.status === 'active' ? 'hide' : 'restore')}>
                              <XCircle size={16} />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-500/10" onClick={() => handlePostAction(post.id, 'delete')}>
                              <Trash2 size={16} />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reportsLoading ? (
                <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
              ) : reports?.length === 0 ? (
                <div className="col-span-full py-40 text-center luxury-card border-dashed opacity-30">
                   <ShieldCheck size={80} className="mx-auto mb-6 text-green-500" />
                   <p className="text-2xl font-black uppercase tracking-[0.3em]">المجتمع آمن.. لا توجد بلاغات</p>
                </div>
              ) : reports?.map((report: any) => (
                <Card key={report.id} className="luxury-card border-red-500/20 bg-red-500/5 p-8 space-y-6 animate-fade-up">
                   <div className="flex justify-between items-start">
                      <div className="bg-red-600/20 text-red-500 p-3 rounded-2xl">
                         <AlertTriangle size={24} />
                      </div>
                      <Badge className="bg-background text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest">Pending Review</Badge>
                   </div>
                   <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black mb-2">سبب البلاغ المذكور</p>
                      <p className="text-base font-bold leading-relaxed">{report.reason}</p>
                   </div>
                   <div className="p-5 bg-background/60 rounded-2xl border border-border">
                      <p className="text-[10px] text-muted-foreground font-black uppercase mb-1">المحتوى المستهدف</p>
                      <p className="text-xs font-bold text-primary truncate">ID: {report.targetId}</p>
                      {report.targetContent && <p className="text-xs mt-2 italic">"{report.targetContent}"</p>}
                   </div>
                   <div className="flex gap-4 pt-4 border-t border-border">
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase h-12 rounded-xl shadow-lg" onClick={() => handleReportAction(report.id, 'resolve')}>معالجة وحذف</Button>
                      <Button variant="outline" className="flex-1 text-muted-foreground font-black text-[10px] uppercase h-12 rounded-xl" onClick={() => handleReportAction(report.id, 'dismiss')}>تجاهل</Button>
                   </div>
                </Card>
              ))}
           </div>
        </TabsContent>

        <TabsContent value="audit">
           <Card className="luxury-card border-none bg-card/40 p-0 overflow-hidden shadow-xl">
              <ScrollArea className="h-[600px] overflow-x-auto responsive-table">
                 <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-20">
                       <TableRow>
                          <TableHead className="text-right py-6 pr-8 text-[10px] font-black uppercase">الإجراء المتخذ</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase">المسؤول</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase">التفاصيل الكاملة</TableHead>
                          <TableHead className="text-left pl-8 text-[10px] font-black uppercase">التوقيت</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {logsLoading ? (
                         <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin text-primary" /></TableCell></TableRow>
                       ) : logs?.map((log: any) => (
                         <TableRow key={log.id} className="hover:bg-muted/50 border-b border-border/50">
                            <TableCell className="py-5 pr-8 font-black text-xs text-primary" data-label="الإجراء">{log.action}</TableCell>
                            <TableCell className="font-bold text-xs" data-label="المسؤول">{log.adminName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground font-medium" data-label="التفاصيل">{log.details}</TableCell>
                            <TableCell className="text-left pl-8 text-[10px] font-mono opacity-60" data-label="التوقيت">{new Date(log.createdAt).toLocaleString('ar-EG')}</TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </ScrollArea>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
