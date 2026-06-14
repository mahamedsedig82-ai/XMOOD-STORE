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
  History, ShieldCheck, Eye, Search, Filter, Loader2, Zap, UserPlus, MapPin, ShoppingBag
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function OpenMarketAdminHub() {
  const { profile } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [agentSearchEmail, setAgentSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const postsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "marketplace_listings"), orderBy("createdAt", "desc"), limit(100));
  }, [db]);

  const reportsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "community_reports"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
  }, [db]);

  const agentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("role", "in", ["middleman", "agent", "owner"]));
  }, [db]);

  const auditQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "community_audit_logs"), orderBy("createdAt", "desc"), limit(100));
  }, [db]);

  const { data: posts, loading: postsLoading } = useCollection(postsQuery);
  const { data: reports, loading: reportsLoading } = useCollection(reportsQuery);
  const { data: agents, loading: agentsLoading } = useCollection(agentsQuery);
  const { data: logs, loading: logsLoading } = useCollection(auditQuery);

  const stats = useMemo(() => ({
    totalPosts: posts?.length || 0,
    pendingReports: reports?.length || 0,
    activeAgents: agents?.length || 0
  }), [posts, reports, agents]);

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
        if (!confirm("هل أنت متأكد من الحذف النهائي؟")) return;
        await deleteDoc(doc(db, "marketplace_listings", postId));
        logAction("MARKET_DELETE", postId, "حذف منشور من السوق المفتوح");
      } else {
        await updateDoc(doc(db, "marketplace_listings", postId), { status: action === 'hide' ? 'hidden' : 'active' });
        logAction("MARKET_STATUS", postId, `تغيير حالة المنشور إلى: ${action}`);
      }
      toast({ title: "تم تنفيذ الإجراء بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التنفيذ" });
    }
  };

  const handleAgentSearch = async () => {
    if (!agentSearchEmail.trim() || !db) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", agentSearchEmail.trim().toLowerCase()), limit(1));
      const { getDocs } = await import("firebase/firestore");
      const snap = await getDocs(q);
      if (!snap.empty) {
        setFoundUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        toast({ variant: "destructive", title: "غير موجود", description: "لم نجد عضواً بهذا البريد." });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const promoteToAgent = async () => {
    if (!foundUser || !db) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", foundUser.id), {
        role: "agent",
        label: "وكيل معتمد",
        isTrusted: true,
        middlemanInfo: { services: ["charging"], isAvailable: true }
      });
      setFoundUser(null);
      setAgentSearchEmail("");
      toast({ title: "تم التعيين", description: "العضو الآن وكيل معتمد في السوق المفتوح." });
    } finally {
      setIsProcessing(false);
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
          <h1 className="text-4xl font-black gold-text">إدارة السوق المفتوح والرقابة</h1>
          <p className="text-muted-foreground mt-3 font-bold uppercase tracking-widest text-[10px]">Open Market Governance & Trust Console</p>
        </div>
        <div className="flex gap-4">
           <Card className="p-5 luxury-card flex items-center gap-4">
              <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl"><ShieldAlert size={20} /></div>
              <div>
                <span className="text-[9px] font-black text-muted-foreground block uppercase">بلاغات نشطة</span>
                <span className="text-2xl font-black text-red-500">{stats.pendingReports}</span>
              </div>
           </Card>
           <Card className="p-5 luxury-card flex items-center gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-2xl"><Users size={20} /></div>
              <div>
                <span className="text-[9px] font-black text-muted-foreground block uppercase">وكلاء معتمدون</span>
                <span className="text-2xl font-black text-primary">{stats.activeAgents}</span>
              </div>
           </Card>
        </div>
      </header>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 rounded-3xl h-16 border mb-8 flex gap-2">
          <TabsTrigger value="posts" className="flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            المنشورات ({stats.totalPosts})
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            إدارة الوكلاء
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white relative">
            البلاغات ({stats.pendingReports})
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            سجل العمليات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card className="luxury-card border-none overflow-hidden bg-card/40">
            <CardHeader className="p-8 border-b flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="relative w-full md:w-80">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input placeholder="بحث في السوق..." className="pr-12 h-12 bg-background border-none text-xs rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
               </div>
               <Badge variant="outline" className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">Market Feed Active</Badge>
            </CardHeader>
            <ScrollArea className="max-h-[600px] overflow-x-auto responsive-table">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="text-right py-6 pr-8 font-black text-[10px] uppercase">الناشر والعنوان</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase">التصنيف</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase">الحالة</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin text-primary" /></TableCell></TableRow>
                  ) : filteredPosts?.map((post: any) => (
                    <TableRow key={post.id} className="hover:bg-primary/5 border-b group">
                      <TableCell className="py-6 pr-8" data-label="الناشر">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 border">
                            <AvatarImage src={post.userPhoto} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm">{post.title}</p>
                            <p className="text-[10px] text-muted-foreground">بواسطة: {post.userName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-label="التصنيف"><Badge variant="secondary" className="text-[9px] uppercase">{post.type}</Badge></TableCell>
                      <TableCell data-label="الحالة">
                        <Badge className={`text-[9px] uppercase ${post.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center" data-label="الإجراءات">
                        <div className="flex justify-center gap-2">
                           <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl" onClick={() => handlePostAction(post.id, post.status === 'active' ? 'hide' : 'restore')}>
                              <XCircle size={16} />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-red-500" onClick={() => handlePostAction(post.id, 'delete')}>
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

        <TabsContent value="agents">
           <Card className="luxury-card p-10 space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h3 className="text-2xl font-bold mb-2">إدارة الوكلاء المعتمدين</h3>
                    <p className="text-sm text-muted-foreground">قم بتعيين أو إزالة الوكلاء الموثوقين في السوق المفتوح.</p>
                 </div>
                 <Dialog>
                    <DialogTrigger asChild>
                       <Button className="royal-button h-14 px-8"><UserPlus size={20} className="ml-2" /> تعيين وكيل جديد</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-none rounded-3xl p-10 max-w-lg">
                       <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">بحث وتعيين وكيل</DialogTitle>
                       </DialogHeader>
                       <div className="space-y-6 mt-6">
                          <div className="flex gap-3">
                             <Input placeholder="البريد الإلكتروني..." value={agentSearchEmail} onChange={e => setAgentSearchEmail(e.target.value)} className="h-12 bg-muted border-none rounded-xl px-4" />
                             <Button onClick={handleAgentSearch} disabled={isProcessing} className="h-12 w-12 rounded-xl bg-primary text-black"><Search size={20} /></Button>
                          </div>
                          {foundUser && (
                             <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <Avatar className="h-12 w-12"><AvatarImage src={foundUser.photoURL} /></Avatar>
                                   <div>
                                      <p className="font-bold">{foundUser.displayName}</p>
                                      <p className="text-xs opacity-60">{foundUser.email}</p>
                                   </div>
                                </div>
                                <Button onClick={promoteToAgent} disabled={isProcessing} className="h-10 px-5 bg-primary text-black font-bold rounded-lg">تعيين وكيل</Button>
                             </div>
                          )}
                       </div>
                    </DialogContent>
                 </Dialog>
              </div>

              <Table className="responsive-table">
                 <TableHeader className="bg-muted/20">
                    <TableRow>
                       <TableHead className="text-right py-6 font-black text-[10px] uppercase">الوكيل المعتمد</TableHead>
                       <TableHead className="text-right font-black text-[10px] uppercase">الرتبة</TableHead>
                       <TableHead className="text-right font-black text-[10px] uppercase">الحالة</TableHead>
                       <TableHead className="text-center font-black text-[10px] uppercase">التحكم</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {agents?.map((agent: any) => (
                       <TableRow key={agent.id} className="hover:bg-muted/20 transition-all border-b">
                          <TableCell className="py-6" data-label="الوكيل">
                             <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-primary/20"><AvatarImage src={agent.photoURL} /></Avatar>
                                <div>
                                   <p className="font-bold">{agent.displayName}</p>
                                   <p className="text-xs opacity-60">{agent.email}</p>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell data-label="الرتبة"><Badge variant="outline" className="border-primary/20 text-primary uppercase text-[8px]">{agent.role}</Badge></TableCell>
                          <TableCell data-label="الحالة">
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${agent.middlemanInfo?.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[10px] font-bold opacity-60">{agent.middlemanInfo?.isAvailable ? 'متصل' : 'غير متوفر'}</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-center" data-label="التحكم">
                             <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={async () => {
                                if(confirm("إزالة صفة الوكيل؟")) {
                                   await updateDoc(doc(db, "users", agent.id), { role: "user", isTrusted: false, label: "عضو موثق" });
                                   toast({ title: "تم سحب الاعتماد" });
                                }
                             }}>إلغاء التعيين</Button>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </Card>
        </TabsContent>

        <TabsContent value="reports">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reports?.map((report: any) => (
                <Card key={report.id} className="luxury-card border-red-500/20 bg-red-500/5 p-8 space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="bg-red-600/20 text-red-500 p-3 rounded-2xl"><AlertTriangle size={24} /></div>
                      <Badge className="bg-background text-red-500 border border-red-500/20 text-[9px] font-black uppercase">Pending Review</Badge>
                   </div>
                   <p className="text-base font-bold leading-relaxed">{report.reason}</p>
                   <div className="p-5 bg-background/60 rounded-2xl border">
                      <p className="text-[10px] text-muted-foreground font-black uppercase mb-1">المحتوى المستهدف</p>
                      <p className="text-xs font-bold text-primary truncate">ID: {report.targetId}</p>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase h-12 rounded-xl" onClick={() => updateDoc(doc(db, "community_reports", report.id), { status: "resolved" })}>معالجة وحذف</Button>
                      <Button variant="outline" className="flex-1 text-muted-foreground font-black text-[10px] uppercase h-12 rounded-xl" onClick={() => updateDoc(doc(db, "community_reports", report.id), { status: "dismissed" })}>تجاهل</Button>
                   </div>
                </Card>
              ))}
           </div>
        </TabsContent>

        <TabsContent value="audit">
           <Card className="luxury-card border-none bg-card/40 overflow-hidden">
              <ScrollArea className="h-[600px] overflow-x-auto responsive-table">
                 <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-20">
                       <TableRow>
                          <TableHead className="text-right py-6 pr-8 text-[10px] font-black uppercase">الإجراء</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase">المسؤول</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase">التفاصيل</TableHead>
                          <TableHead className="text-left pl-8 text-[10px] font-black uppercase">التوقيت</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {logs?.map((log: any) => (
                         <TableRow key={log.id} className="hover:bg-muted/50 border-b">
                            <TableCell className="py-5 pr-8 font-black text-xs text-primary" data-label="الإجراء">{log.action}</TableCell>
                            <TableCell className="font-bold text-xs" data-label="المسؤول">{log.adminName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground" data-label="التفاصيل">{log.details}</TableCell>
                            <TableCell className="text-left pl-8 text-[10px] opacity-60" data-label="التوقيت">{new Date(log.createdAt).toLocaleString('ar-EG')}</TableCell>
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