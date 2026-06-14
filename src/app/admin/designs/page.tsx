
"use client";

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Palette, Image as ImageIcon, Loader2, Save, Smartphone, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function DesignerPortfolioAdmin() {
  const { profile, user } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const [newDesign, setNewDesign] = useState({ title: "", description: "", imageUrl: "", category: "Logo" });
  const [designerPhone, setDesignerPhone] = useState(profile?.phoneNumber || "");

  const galleryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: galleryItems, loading } = useCollection(galleryQuery);

  const handleAddToGallery = async () => {
    if (!newDesign.title || !newDesign.imageUrl || !db || !user) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال العنوان ورابط الصورة." });
      return;
    }
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "gallery"), {
        ...newDesign,
        designerId: user.uid,
        designerName: profile?.displayName || "مصمم معتمد",
        designerPhone: designerPhone || profile?.phoneNumber || "",
        createdAt: new Date().toISOString()
      });
      setIsGalleryOpen(false);
      setNewDesign({ title: "", description: "", imageUrl: "", category: "Logo" });
      toast({ title: "تمت الإضافة", description: "التصميم الآن متاح في المعرض العام للعملاء." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في النشر" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string, designerId: string) => {
    if (profile?.role !== 'owner' && designerId !== user?.uid) {
      toast({ variant: "destructive", title: "غير مصرح", description: "يمكنك حذف أعمالك الخاصة فقط." });
      return;
    }
    if (!confirm("هل تريد حذف هذا التصميم من المعرض؟")) return;
    try {
      await deleteDoc(doc(db, "gallery", id));
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    }
  };

  const handleUpdatePhone = async () => {
    if (!user || !db) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { phoneNumber: designerPhone });
      toast({ title: "تم تحديث الرقم", description: "سيتم توجيه طلبات التواصل من العملاء لهذا الرقم." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold gold-text">إدارة معرض أعمالي</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Professional Portfolio & Task Management</p>
        </div>
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-10 text-lg"><Plus size={24} className="ml-3" /> نشر عمل جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4">
                <ImageIcon size={28} /> إضافة لتصميمات النخبة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">عنوان العمل</label>
                <Input value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">رابط الصورة (16:9)</label>
                <Input value={newDesign.imageUrl} onChange={e => setNewDesign({...newDesign, imageUrl: e.target.value})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-mono text-xs" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">الفئة (شعار، بنر، موشن)</label>
                <Input value={newDesign.category} onChange={e => setNewDesign({...newDesign, category: e.target.value})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">وصف العمل وتفاصيل التنفيذ</label>
                <Textarea value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} className="bg-zinc-900 border-none rounded-2xl min-h-[120px] p-4" />
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button onClick={handleAddToGallery} disabled={isProcessing} className="royal-button w-full h-16 text-lg">
                {isProcessing ? <Loader2 className="animate-spin" /> : "نشر العمل في المعرض العام"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-1 luxury-card border-none p-10 bg-primary/5">
           <h3 className="text-xl font-bold gold-text mb-8 flex items-center gap-3"><Smartphone size={20} /> تواصل العملاء</h3>
           <p className="text-xs text-zinc-500 mb-8 leading-relaxed font-medium">الرقم المكتوب هنا هو الذي سيظهر للعملاء عند الضغط على "طلب تصميم مشابه" في المعرض العام.</p>
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-primary uppercase pr-2">رقم واتساب المصمم (دولي)</label>
                 <Input value={designerPhone} onChange={e => setDesignerPhone(e.target.value)} placeholder="+966..." className="h-14 bg-black border-primary/20 rounded-xl px-6 text-center font-black tracking-widest text-primary" />
              </div>
              <Button onClick={handleUpdatePhone} disabled={isProcessing} className="w-full h-14 rounded-xl border border-primary/40 bg-primary/10 text-primary font-bold uppercase text-[10px] tracking-widest gap-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <><Save size={16} /> تثبيت بيانات التواصل</>}
              </Button>
           </div>
        </Card>

        <Card className="lg:col-span-2 luxury-card border-none bg-zinc-950/60 overflow-hidden">
           <CardHeader className="p-10 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-4"><Palette className="text-primary" /> قائمة أعمالي المنشورة</CardTitle>
              <Badge variant="outline" className="border-white/10 text-zinc-500 text-[8px] font-black">{galleryItems?.filter(i => i.designerId === user?.uid || profile?.role === 'owner').length || 0} WORK(S)</Badge>
           </CardHeader>
           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto custom-scrollbar">
              {galleryItems?.filter(i => i.designerId === user?.uid || profile?.role === 'owner').map((item: any) => (
                <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-video bg-zinc-900 border border-white/5">
                   <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" />
                   <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                      <h4 className="font-bold text-primary mb-2">{item.title}</h4>
                      <p className="text-[10px] text-zinc-400 mb-6">{item.category}</p>
                      <div className="flex gap-2">
                         <Button onClick={() => handleDeleteItem(item.id, item.designerId)} variant="ghost" size="icon" className="h-10 w-10 text-red-500 hover:bg-red-500/10 rounded-full">
                           <Trash2 size={18} />
                         </Button>
                      </div>
                   </div>
                </div>
              ))}
              {galleryItems?.length === 0 && (
                <div className="col-span-full py-40 text-center opacity-20">
                   <Palette size={80} className="mx-auto mb-6" />
                   <p className="font-bold uppercase tracking-widest">لا توجد أعمال في المعرض حالياً</p>
                </div>
              )}
           </div>
        </Card>
      </div>
    </div>
  );
}
