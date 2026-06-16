"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitBranch, Plus, Trash2, Edit2, Loader2, Link as LinkIcon, Home, ShoppingBag, Briefcase, Palette, ShieldCheck, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminBranchesManager() {
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ name: "", href: "/", icon: "Home", description: "" });

  const branchesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "site_branches"), orderBy("order", "asc"));
  }, [db]);

  const { data: branches, loading } = useCollection(branchesQuery);

  const iconsMap: Record<string, any> = {
    Home: Home,
    ShoppingBag: ShoppingBag,
    Briefcase: Briefcase,
    Palette: Palette,
    ShieldCheck: ShieldCheck,
    Zap: Zap
  };

  const handleSubmit = async () => {
    if (!form.name || !db) return;
    setIsProcessing(true);
    try {
      const data = { ...form, order: branches?.length || 0, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "site_branches", editingId), data);
        toast({ title: "تم التحديث السيادي للفرع" });
      } else {
        await addDoc(collection(db, "site_branches"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم إضافة فرع جديد للمنصة" });
      }
      setIsOpen(false);
      resetForm();
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", href: "/", icon: "Home", description: "" });
    setEditingId(null);
  };

  const startEdit = (b: any) => {
    setForm({ name: b.name, href: b.href, icon: b.icon || "Home", description: b.description || "" });
    setEditingId(b.id);
    setIsOpen(true);
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b pb-10">
        <div>
          <h1 className="text-5xl font-headline font-black gold-text">إدارة فروع المنصة</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">Universal Site Navigation & Branches Control</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-base"><Plus size={24} className="ml-3" /> إضافة فرع جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[3rem] p-12 shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black gold-text flex items-center gap-4"><GitBranch size={28} /> {editingId ? 'تعديل بيانات الفرع' : 'تأسيس فرع جديد'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3 tracking-widest">اسم الفرع</label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none px-6 font-bold" placeholder="مثال: المتجر الرئيسي" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3 tracking-widest">الرابط (Route/URL)</label>
                  <Input value={form.href} onChange={e => setForm({...form, href: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none px-6 font-mono text-xs" placeholder="/store" />
               </div>
               <div className="col-span-full space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3 tracking-widest">الأيقونة الممثلة</label>
                  <select 
                    value={form.icon} 
                    onChange={e => setForm({...form, icon: e.target.value})}
                    className="w-full h-14 rounded-2xl bg-muted/40 border-none px-6 font-bold text-sm appearance-none"
                  >
                    {Object.keys(iconsMap).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
               </div>
               <div className="col-span-full space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3 tracking-widest">وصف مختصر للفرع</label>
                  <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none px-6 font-medium" placeholder="شرح يظهر في القائمة الجانبية..." />
               </div>
            </div>
            <DialogFooter className="mt-12">
               <Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-16 text-lg">
                  {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? "تحديث الفرع السيادي" : "تأكيد وإضافة الفرع"}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></div>
        ) : branches?.length === 0 ? (
          <Card className="col-span-full luxury-card border-dashed p-40 text-center opacity-30">
            <GitBranch size={100} className="mx-auto mb-8" />
            <p className="text-2xl font-black uppercase tracking-widest">لا توجد فروع مسجلة.. قم بإضافة أول فرع</p>
          </Card>
        ) : (
          branches?.map((b: any) => {
            const IconComp = iconsMap[b.icon] || Home;
            return (
              <Card key={b.id} className="luxury-card border-none bg-card/60 backdrop-blur-xl p-8 group">
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                       <IconComp size={24} />
                    </div>
                    <div className="flex gap-2">
                       <Button size="icon" variant="ghost" onClick={() => startEdit(b)} className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary"><Edit2 size={16} /></Button>
                       <Button size="icon" variant="ghost" onClick={() => confirm("حذف هذا الفرع من نظام الملاحة؟") && deleteDoc(doc(db, "site_branches", b.id))} className="h-9 w-9 rounded-xl hover:bg-red-50 text-red-500"><Trash2 size={16} /></Button>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black mb-2">{b.name}</h3>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter mb-4 opacity-60">{b.href}</Badge>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">{b.description || "لا يوجد وصف محدد لهذا الفرع."}</p>
                 </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
