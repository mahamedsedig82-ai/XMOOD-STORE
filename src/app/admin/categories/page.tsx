"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Plus, Trash2, Edit2, Loader2, FolderTree, ArrowRight, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminCategoriesTree() {
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ name: "", slug: "", parentId: "none", description: "" });

  const catsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "categories"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: categories, loading } = useCollection(catsQuery);

  const handleSubmit = async () => {
    if (!form.name || !db) return;
    setIsProcessing(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), data);
        toast({ title: "تم التحديث" });
      } else {
        await addDoc(collection(db, "categories"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم إنشاء القسم" });
      }
      setIsOpen(false);
      resetForm();
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", slug: "", parentId: "none", description: "" });
    setEditingId(null);
  };

  const startEdit = (c: any) => {
    setForm({ name: c.name, slug: c.slug || "", parentId: c.parentId || "none", description: c.description || "" });
    setEditingId(c.id);
    setIsOpen(true);
  };

  const rootCategories = categories?.filter(c => c.parentId === "none") || [];

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-headline font-black gold-text">إدارة الهيكل التنظيمي</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">Categories & Subcategories Architecture</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-base"><Plus size={24} className="ml-3" /> إنشاء قسم جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-zinc-950 border-none rounded-[3rem] p-12 shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black gold-text flex items-center gap-4"><Layers size={28} /> {editingId ? 'تعديل القسم' : 'إضافة قسم للمتجر'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3 tracking-widest">اسم القسم</label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border-none px-6 font-bold" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3 tracking-widest">الاسم اللطيف (Slug)</label>
                  <Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border-none px-6 font-mono text-xs" placeholder="electronics-gear" />
               </div>
               <div className="col-span-full space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3 tracking-widest">القسم الأب (الرئيسي)</label>
                  <select 
                    value={form.parentId} 
                    onChange={e => setForm({...form, parentId: e.target.value})}
                    className="w-full h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border-none px-6 font-bold text-sm appearance-none"
                  >
                    <option value="none">-- قسم رئيسي (بدون أب) --</option>
                    {rootCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="col-span-full space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3 tracking-widest">الوصف التعريفي</label>
                  <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border-none px-6 font-medium" />
               </div>
            </div>
            <DialogFooter className="mt-12">
               <Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-16 text-lg">
                  {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? "تحديث القسم السيادي" : "تأكيد وإضافة القسم"}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></div>
        ) : rootCategories.length === 0 ? (
          <Card className="luxury-card border-dashed p-40 text-center opacity-30">
            <FolderTree size={100} className="mx-auto mb-8" />
            <p className="text-2xl font-black uppercase tracking-widest">لا توجد أقسام مسجلة حالياً</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {rootCategories.map((root) => (
              <Card key={root.id} className="luxury-card border-none shadow-xl bg-white dark:bg-zinc-950 overflow-hidden group">
                 <div className="p-8 border-b bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-primary text-white rounded-[1.25rem] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                          <Layers size={24} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black">{root.name}</h3>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter mt-1 opacity-60">Root Category: /{root.slug}</Badge>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <Button size="icon" variant="ghost" onClick={() => startEdit(root)} className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary"><Edit2 size={16} /></Button>
                       <Button size="icon" variant="ghost" onClick={() => confirm("حذف القسم وكافة تفرعاته؟") && deleteDoc(doc(db, "categories", root.id))} className="h-10 w-10 rounded-xl hover:bg-red-50 text-red-500"><Trash2 size={16} /></Button>
                    </div>
                 </div>
                 <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {categories?.filter(c => c.parentId === root.id).map(sub => (
                         <div key={sub.id} className="p-6 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-between border border-transparent hover:border-primary/20 transition-all group/sub">
                            <div className="flex items-center gap-4">
                               <ArrowRight size={14} className="text-primary opacity-40 group-hover/sub:translate-x-[-4px] transition-transform" />
                               <span className="font-bold text-sm">{sub.name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                               <Button size="icon" variant="ghost" onClick={() => startEdit(sub)} className="h-8 w-8 text-primary"><Edit2 size={12} /></Button>
                               <Button size="icon" variant="ghost" onClick={() => deleteDoc(doc(db, "categories", sub.id))} className="h-8 w-8 text-red-500"><Trash2 size={12} /></Button>
                            </div>
                         </div>
                       ))}
                       <button onClick={() => { setForm({...form, parentId: root.id}); setIsOpen(true); }} className="p-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:text-primary hover:border-primary/40 transition-all text-xs font-black uppercase tracking-widest">
                          <Plus size={16} /> إضافة تفرع لـ {root.name}
                       </button>
                    </div>
                 </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
