
"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, getDocs, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Zap, Loader2, MapPin, Smartphone, UserPlus, Search, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function AdminAgentsManagement() {
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isAddingAgent, setIsAddingAgent] = useState(false);

  // تم تبسيط الاستعلام لإزالة الخطأ الخاص بالفهارس المفقودة
  const agentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("role", "in", ["middleman", "agent", "owner"]));
  }, [db]);

  const { data: rawAgents, loading } = useCollection(agentsQuery);

  // فرز الوكلاء برمجياً لضمان الاستقرار
  const agents = useMemo(() => {
    return [...rawAgents].sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [rawAgents]);

  const handleSearchUser = async () => {
    if (!searchEmail.trim() || !db) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail.trim().toLowerCase()), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setFoundUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        toast({ variant: "destructive", title: "غير موجود", description: "لم نجد عضواً بهذا البريد الإلكتروني." });
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
        residence: foundUser.residence || "غير محدد",
        phoneNumber: foundUser.phoneNumber || "",
        completedDeals: foundUser.completedDeals || 0,
        middlemanInfo: { 
          services: ["charging"], 
          isAvailable: true,
          workHours: "24/7 Sovereign Access"
        }
      });
      setIsAddingAgent(false);
      setFoundUser(null);
      setSearchEmail("");
      toast({ title: "تمت الترقية", description: "تم تعيين العضو كوكيل شحن معتمد." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent || !db) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", editingAgent.id), {
        middlemanInfo: editingAgent.middlemanInfo || { services: [], isAvailable: true },
        phoneNumber: editingAgent.phoneNumber || "",
        residence: editingAgent.residence || "",
        label: editingAgent.role === 'owner' ? 'المالك السيادي' : editingAgent.role === 'agent' ? 'وكيل معتمد' : 'وسيط معتمد'
      });
      setEditingAgent(null);
      toast({ title: "تم تحديث البيانات", description: "تم تحديث بيانات الوكيل السيادية بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث البيانات." });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleService = (service: string) => {
    const currentServices = editingAgent?.middlemanInfo?.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter((s: string) => s !== service)
      : [...currentServices, service];
    
    setEditingAgent({
      ...editingAgent,
      middlemanInfo: {
        ...(editingAgent?.middlemanInfo || {}),
        services: newServices
      }
    });
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">إدارة شؤون الوكلاء</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Elite Agents & Escrow Logistics Control</p>
        </div>
        <Dialog open={isAddingAgent} onOpenChange={setIsAddingAgent}>
           <DialogTrigger asChild>
              <Button className="royal-button h-16 px-10"><UserPlus size={20} className="ml-3" /> تعيين وكيل جديد</Button>
           </DialogTrigger>
           <DialogContent className="bg-zinc-950 border border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <DialogHeader>
                 <DialogTitle className="text-3xl font-bold gold-text flex items-center gap-4"><UserPlus size={28} /> بحث وتعيين</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-8">
                 <div className="flex gap-4">
                    <Input 
                      placeholder="البريد الإلكتروني للعضو..." 
                      value={searchEmail}
                      onChange={e => setSearchEmail(e.target.value)}
                      className="h-14 bg-zinc-900 border-none rounded-xl px-6" 
                    />
                    <Button onClick={handleSearchUser} disabled={isProcessing} className="h-14 w-14 rounded-xl p-0 bg-primary text-black"><Search size={24} /></Button>
                 </div>
                 {foundUser && (
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <img src={foundUser.photoURL || `https://picsum.photos/seed/${foundUser.uid}/100/100`} className="w-12 h-12 rounded-xl" alt="" />
                          <div>
                             <p className="font-bold">{foundUser.displayName}</p>
                             <p className="text-xs text-zinc-500">{foundUser.email}</p>
                          </div>
                       </div>
                       <Button onClick={promoteToAgent} disabled={isProcessing} className="bg-primary text-black font-bold h-10 px-6 rounded-lg">تعيين كوكيل</Button>
                    </div>
                 )}
              </div>
           </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 gap-10">
        <Card className="luxury-card border-none bg-zinc-950/60 overflow-hidden">
          <CardHeader className="p-10 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-4">
              <ShieldCheck className="text-primary" /> قائمة النخبة المعتمدة
            </CardTitle>
            <Badge variant="outline" className="border-white/10 text-zinc-500 text-[8px] font-black">{agents?.length || 0} ACTIVE AGENTS</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-right py-6 pr-10 font-black text-[9px] uppercase text-zinc-500">الوكيل والمنطقة</TableHead>
                  <TableHead className="text-right font-black text-[9px] uppercase text-zinc-500">الخدمات المصرحة</TableHead>
                  <TableHead className="text-right font-black text-[9px] uppercase text-zinc-500">الحالة</TableHead>
                  <TableHead className="text-center font-black text-[9px] uppercase text-zinc-500">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : agents?.map((m: any) => (
                  <TableRow key={m.id} className="hover:bg-primary/5 border-b border-white/5 transition-all">
                    <TableCell className="py-6 pr-10">
                      <div className="flex items-center gap-4">
                        <img src={m.photoURL || `https://picsum.photos/seed/${m.id}/100/100`} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                        <div>
                          <p className="font-bold text-white">{m.displayName}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <MapPin size={10} className="text-primary" />
                             <span className="text-[10px] text-zinc-400 font-bold">{m.residence || "غير محدد"}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {m.middlemanInfo?.services?.map((s: string) => (
                          <Badge key={s} className="bg-primary/10 text-primary border-primary/20 text-[7px] px-2 py-0.5 uppercase">
                            {s === 'escrow' ? 'الوساطة' : s === 'charging' ? 'شحن المحفظة' : s}
                          </Badge>
                        ))}
                        {(!m.middlemanInfo?.services || m.middlemanInfo.services.length === 0) && <span className="text-[8px] text-zinc-600 italic">لا توجد خدمات</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${m.middlemanInfo?.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                          <span className="text-[10px] font-bold text-zinc-400">{m.middlemanInfo?.isAvailable ? 'متاح للعمل' : 'غير متصل'}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Button onClick={() => setEditingAgent(m)} variant="ghost" size="sm" className="h-10 px-6 rounded-xl border border-white/5 text-primary hover:bg-primary/10 font-black text-[9px] uppercase tracking-widest">تعديل البيانات</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
         <DialogContent className="bg-zinc-950 border border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
               <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4">
                  <Zap size={28} /> تكليف مهام الوكيل
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-zinc-500 uppercase pr-3">رقم واتساب الوكيل (دولي)</label>
                     <Input 
                       value={editingAgent?.phoneNumber || ""} 
                       onChange={e => setEditingAgent({...editingAgent, phoneNumber: e.target.value})}
                       placeholder="+966..." 
                       className="h-12 bg-zinc-900 border-none rounded-xl px-4 font-bold text-primary" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-zinc-500 uppercase pr-3">مكان السكن / المنطقة</label>
                     <Input 
                       value={editingAgent?.residence || ""} 
                       onChange={e => setEditingAgent({...editingAgent, residence: e.target.value})}
                       placeholder="مثال: الخرطوم، حي الرياض" 
                       className="h-12 bg-zinc-900 border-none rounded-xl px-4 font-bold" 
                     />
                  </div>
               </div>

               <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <h4 className="font-bold text-lg">حالة الاتصال</h4>
                    <p className="text-xs text-zinc-500">تظهر للعملاء في صفحة الوكلاء العامة.</p>
                  </div>
                  <Switch 
                    checked={editingAgent?.middlemanInfo?.isAvailable} 
                    onCheckedChange={(val) => setEditingAgent({...editingAgent, middlemanInfo: {...(editingAgent?.middlemanInfo || {}), isAvailable: val}})}
                  />
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-bold text-primary uppercase pr-2">الخدمات المصرح بها</h4>
                  <div className="grid grid-cols-1 gap-4">
                     {[
                       { id: 'escrow', label: 'الوساطة في صفقات المجتمع', desc: 'تأمين الصفقات بين البائع والمشتري' },
                       { id: 'charging', label: 'شحن رصيد المحفظة للعملاء', desc: 'استقبال المبالغ وتحويل الرصيد سيادياً' }
                     ].map((service) => (
                       <div key={service.id} className="flex items-start gap-4 p-4 bg-zinc-900 rounded-xl cursor-pointer hover:bg-zinc-800 transition-all" onClick={() => toggleService(service.id)}>
                          <Checkbox checked={editingAgent?.middlemanInfo?.services?.includes(service.id)} className="mt-1" />
                          <div>
                             <p className="font-bold text-sm">{service.label}</p>
                             <p className="text-[10px] text-zinc-500">{service.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            <DialogFooter className="mt-10">
               <Button onClick={handleUpdateAgent} disabled={isProcessing} className="royal-button w-full h-16 text-lg">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "حفظ التكليفات الجديدة"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
