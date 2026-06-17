"use client";

import { useState, useRef } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Palette, Image as ImageIcon, Loader2, Save, Smartphone, MessageSquare, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function DesignerPortfolioAdmin() {
  const { profile, user } = useUser();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const [newDesign, setNewDesign] = useState({ title: "", description: "", imageUrl: "", category: "Logo" });
  const [designerPhone, setDesignerPhone] = useState(profile?.phoneNumber || "");

  const galleryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: galleryItems, loading } = useCollection(galleryQuery);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        setNewDesign({ ...newDesign, imageUrl: event.target?.result as string });
        setIsProcessing(false);
        toast({ title: "تم معالجة الصورة بنجاح" });
      };
    }
  };

  const handleAddToGallery = async () => {
    if (!newDesign.title || !newDesign.imageUrl || !db || !user) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال العنوان والصورة." });
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
      toast({ title: "تم النشر في المعرض" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل تريد حذف هذا التصميم نهائياً من المعرض؟")) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "gallery", id));
      toast({ title: "تم الحذف بنجاح" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card/60 backdrop-blur-xl p-8 rounded-[2.5rem] border shadow-sm">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight">إدارة معرض أعمالي</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px] italic opacity-60">Professional Portfolio & Gallery Control</p>
        </div>
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-lg shadow-xl shadow-primary/20"><Plus size={24} className="ml-3" /> نشر عمل فني جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4">
                <ImageIcon size={28} /> إضافة لتصميمات النخبة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3"><label className="text-[10px] font-black text-primary uppercase pr-4">عنوان العمل</label><Input value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} className="h-14" /></div>
                 <div className="space-y-3"><label className="text-[10px] font-black text-primary uppercase pr-4">الفئة (مثال: شعار، هوية)</label><Input value={newDesign.category} onChange={e => setNewDesign({...newDesign, category: e.target.value})} className="h-14" /></div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-primary uppercase pr-4">صورة العمل الفني</label>
                <div onClick={() => fileInputRef.current?.click()} className="h-24 bg-muted/40 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden group">
                  {newDesign.imageUrl ? <img src={newDesign.imageUrl} className="h-full w-full object-cover group-hover:scale-105 transition-transform" alt="" /> : <div className="flex flex-col items-center gap-2"><Upload size={24} className="text-primary" /><span className="text-[9px] font-bold uppercase opacity-60">اختر ملف الصورة</span></div>}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="space-y-3"><label className="text-[10px] font-black text-primary uppercase pr-4">وصف العمل الفني</label><Textarea value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} className="min-h-[120px]" /></div>
            </div>
            <DialogFooter className="mt-12"><Button onClick={handleAddToGallery} disabled={isProcessing} className="royal-button w-full h-18 text-xl shadow-2xl shadow-primary/20">{isProcessing ? <Loader2 className="animate-spin" /> : "نشر العمل في المعرض"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-40 text-center flex flex-col items-center gap-6"><Loader2 className="animate-spin text-primary" size={80} /><p className="font-black text-zinc-500 uppercase tracking-[0.4em] text-[10px]">Loading Artistic Assets...</p></div>
        ) : galleryItems?.length === 0 ? (
          <div className="col-span-full py-40 text-center luxury-card border-dashed opacity-30 flex flex-col items-center justify-center"><Palette size={100} className="mb-6 text-muted-foreground" /><p className="font-black text-2xl uppercase tracking-widest">لا توجد أعمال في المعرض حالياً</p></div>
        ) : galleryItems?.map((item: any) => (
          <Card key={item.id} className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl flex flex-col group overflow-hidden h-full border-2 border-transparent hover:border-primary/20">
             <div className="relative aspect-video overflow-hidden">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                <Badge className="absolute top-4 right-4 bg-primary text-black font-black text-[8px] uppercase px-5 py-1.5 rounded-full shadow-2xl">{item.category}</Badge>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
             </div>
             <CardContent className="p-8 flex-1 flex flex-col space-y-4">
                <h4 className="font-black text-2xl line-clamp-1 group-hover:gold-text transition-colors">{item.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-medium opacity-80 h-15">{item.description}</p>
             </CardContent>
             
             {/* Admin Actions - Isolated Bottom Bar */}
             <div className="p-6 bg-muted/30 border-t mt-auto">
                <Button 
                  onClick={() => handleDeleteItem(item.id)} 
                  disabled={isProcessing}
                  variant="destructive" 
                  className="w-full h-14 rounded-2xl gap-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/10 hover:scale-[1.02] transition-transform"
                >
                   {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <><Trash2 size={20} /> حذف العمل الفني نهائياً</>}
                </Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
