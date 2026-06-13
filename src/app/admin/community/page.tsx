
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
  History, ShieldCheck, Eye, Search, Filter
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CommunityAdminHub() {
  const { profile } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const postsQuery = useMemoFirebase(() => query(collection(db, "marketplace_listings"), orderBy("createdAt", "desc"), limit(100)), [db]);
  const reportsQuery = useMemoFirebase(() => query(collection(db, "community_reports"), where("status", "==", "pending"), orderBy("createdAt", "desc")), [db]);
  const auditQuery = useMemoFirebase(() => query(collection(db, "community_audit_logs"), orderBy("createdAt", "desc"), limit(50)), [db]);

  const { data: posts, loading: postsLoading } = useCollection(postsQuery);
  const { data: reports, loading: reportsLoading } = useCollection(reportsQuery);
  const { data: logs, loading: logsLoading } = useCollection(auditQuery);

  const stats = useMemo(() => ({
    totalPosts: posts?.length || 0,
    pendingReports: reports?.length || 0,
    trustedAgents: 0, // Would need a separate user query
  }), [posts, reports]);

  const logAction = async (action: string, targetId: string, details: string) => {
    if (!profile) return;
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
    try {
      if (action === 'delete') {
        if (!confirm("حذف نهائي؟")) return;
        await deleteDoc(doc(db, "marketplace_listings", postId));
        logAction("DELETE_POST", postId, "تم حذف المنشور بشكل نهائي");
      } else {
        await updateDoc(doc(db, "marketplace_listings", postId), { status: action === 'hide' ? 'hidden' : 'active' });
        logAction("UPDATE_POST_STATUS", postId, `تغيير الحالة إلى: ${action}`);
      }
      toast({ title: "تم تنفيذ الإجراء" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التنفيذ" });
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      await updateDoc(doc(db, "community_reports", reportId), { status: action === 'resolve' ? 'resolved' : 'dismissed' });
      logAction("REPORT_ACTION", reportId, `إغلاق البلاغ كـ: ${action}`);
      toast({ title: "تم تحديث حالة البلاغ" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">إدارة المجتمع والرقابة</h1>
          <p className="text-zinc-500 mt-3 font-bold uppercase tracking-widest text-[10px]">XMOOD Community Governance & Moderation Console</p>
        </div>
        <div className="flex gap-4">
           <Card className="p-4 bg-primary/5 border-primary/10 flex items-center gap-4">
              <BarChart3 className="text-primary" size={24} />
              <div>
                <span className="text-[8px] font-black text-zinc-500 block uppercase">بلاغات معلقة</span>
                <span className="text-xl font-black text-red-500">{stats.pendingReports}</span>
              </div>
           </Card>
        </div>
      </header>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="bg-zinc-950 p-1.5 rounded-2xl h-16 border border-white/5 mb-8 flex gap-2">
          <TabsTrigger value="posts" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
            <MessageSquare size={16} className="ml-2" /> المنشورات
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white relative">
            <ShieldAlert size={16} className="ml-2" /> البلاغات
            {stats.pendingReports > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 rounded-full flex items-center justify-center text-[10px] border-2 border-red-600 animate-bounce">{stats.pendingReports}</span>}
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            <History size={16} className="ml-2" /> سجل النشاط الإداري
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card className="luxury-card border-none overflow-hidden bg-zinc-950/40">
            <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/5">
               <div className="relative w-72">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <Input placeholder="بحث في المنشورات..." className="pr-10 h-10 bg-black border-none text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
               </div>
               <Badge variant="outline" className="border-white/10 text-zinc-500 text-[8px] font-black uppercase tracking-widest">Live Feed Active</Badge>
            </CardHeader>
            <ScrollArea className="max-h-[600px]">
              <Table>
                <TableHeader className="bg-black/60 sticky top-0 z-20">
                  <TableRow className="border-white/5">
                    <TableHead className="text-right py-6 pr-8 font-black text-[10px] uppercase text-zinc-500">الناشر والعنوان</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase text-zinc-500">التصنيف</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase text-zinc-500">الحالة</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase text-zinc-500">إجراءات الرقابة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts?.map((post: any) => (
                    <TableRow key={post.id} className="hover:bg-primary/5 border-b border-white/5 transition-all">
                      <TableCell className="py-6 pr-8">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 border border-white/10">
                            <AvatarImage src={post.userPhoto} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-white">{post.title}</p>
                            <p className="text-[10px] text-zinc-500">بواسطة: {post.userName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[8px] uppercase">{post.type}</Badge></TableCell>
                      <TableCell>
                        <Badge className={`text-[8px] uppercase px-3 ${post.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                           <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-zinc-400 hover:text-white border border-white/5" onClick={() => handlePostAction(post.id, post.status === 'active' ? 'hide' : 'restore')}>
                              <XCircle size={16} />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-500/10 border border-white/5" onClick={() => handlePostAction(post.id, 'delete')}>
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
              {reports?.map((report: any) => (
                <Card key={report.id} className="luxury-card border-red-500/20 bg-red-500/5 p-8 space-y-6 animate-fade-up">
                   <div className="flex justify-between items-start">
                      <div className="bg-red-600/20 text-red-500 p-2 rounded-xl">
                         <AlertTriangle size={24} />
                      </div>
                      <Badge className="bg-black text-red-500 border border-red-500/20 text-[8px] font-black uppercase">Pending Review</Badge>
                   </div>
                   <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">سبب البلاغ</p>
                      <p className="text-sm font-bold text-white leading-relaxed">{report.reason}</p>
                   </div>
                   <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">المحتوى المستهدف</p>
                      <p className="text-xs text-zinc-300 italic">ID: {report.targetId}</p>
                   </div>
                   <div className="flex gap-4 pt-4 border-t border-white/5">
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase h-11" onClick={() => handleReportAction(report.id, 'resolve')}>معالجة المخالفة</Button>
                      <Button variant="outline" className="flex-1 border-white/10 text-zinc-500 font-black text-[10px] uppercase h-11" onClick={() => handleReportAction(report.id, 'dismiss')}>تجاهل</Button>
                   </div>
                </Card>
              ))}
              {reports?.length === 0 && (
                <div className="col-span-full py-40 text-center opacity-30">
                   <ShieldCheck size={80} className="mx-auto mb-6 text-green-500" />
                   <p className="text-2xl font-bold uppercase tracking-[0.3em]">المجتمع آمن.. لا توجد بلاغات معلقة</p>
                </div>
              )}
           </div>
        </TabsContent>

        <TabsContent value="audit">
           <Card className="luxury-card border-none bg-zinc-950/40 p-0 overflow-hidden">
              <ScrollArea className="h-[600px]">
                 <Table>
                    <TableHeader className="bg-black/60 sticky top-0 z-20">
                       <TableRow className="border-white/5">
                          <TableHead className="text-right py-6 pr-8 text-[10px] font-black uppercase text-zinc-500">الإجراء</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase text-zinc-500">المسؤول</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase text-zinc-500">التفاصيل</TableHead>
                          <TableHead className="text-left pl-8 text-[10px] font-black uppercase text-zinc-500">التوقيت</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {logs?.map((log: any) => (
                         <TableRow key={log.id} className="hover:bg-white/5 border-b border-white/5">
                            <TableCell className="py-5 pr-8 font-black text-xs text-primary">{log.action}</TableCell>
                            <TableCell className="font-bold text-xs">{log.adminName}</TableCell>
                            <TableCell className="text-[10px] text-zinc-500 font-medium">{log.details}</TableCell>
                            <TableCell className="text-left pl-8 text-[10px] font-mono opacity-40">{new Date(log.createdAt).toLocaleString('ar-EG')}</TableCell>
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
