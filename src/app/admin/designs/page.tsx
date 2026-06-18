"use client";

import { useState, useRef } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ImageIcon, Loader2, Upload, ShieldCheck, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function DesignerPortfolioAdmin() {
  const { profile, user } = useUser();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const [newDesign, setNewDesign] = useState({ title: "", description: "", imageUrl: "", category: "Logo" });

  const galleryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: galleryItems, loading } = useCollection(galleryQuery);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const b64 = await compressImage(file);
        setNewDesign({ ...newDesign, imageUrl: b64 });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل معالجة الصورة" });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleAddToGallery = async () => {
    if (!newDesign.title || !newDesign.imageUrl || !db || !user) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال العنوان ورفع الصورة." });
      return;
    }
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "gallery"), {
        ...newDesign,
        designerId: user.uid,
        designerName: profile?.displayName || "مصمم معتمد",
        designerPhone: profile?.phoneNumber || "",
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });
      setIsGalleryOpen(false);
      setNewDesign({ title: "", description: "", imageUrl: "", category: "Logo" });
      toast({ title: "تم النشر في المعرض بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الإضافة" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("حذف هذا العمل الفني نهائياً؟")) return;
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
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-card/60 p-8 rounded-[2.5rem] border shadow-sm">
        <div>
           <h1 className="text-4xl font-headline font-black gold-text">إدارة معرض الأعمال</h1>
           <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Creative Portfolio Hub</p>
        </div>
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-lg shadow-xl"><Plus size={24} className="ml-3" /> نشر عمل جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[3rem] p-10 max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader><DialogTitle className="text-3xl font-black gold-text flex items-center gap-4"><ImageIcon size={28} /> إضافة عمل إبداعي</DialogTitle></DialogHeader>
            <div className="space-y-8 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-4">عنوان العمل</label><Input value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} placeholder="مثال: لوقو احترافي 2025" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-4">الفئة</label><Input value={newDesign.category} onChange={e => setNewDesign({...newDesign, category: e.target.value})} placeholder="Slogan, Identity, etc." /></div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-primary uppercase pr-4">صورة العمل الفني</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-48 bg-muted/40 border-2 border-dashed border-primary/20 rounded-[2rem] flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-primary/5 transition-all">
                    {newDesign.imageUrl ? <img src={newDesign.imageUrl} className="h-full w-full object-cover" alt="" /> : <div className="text-center"><Upload className="text-primary mx-auto mb-2" size={32} /><p className="text-[10px] font-black opacity-40">اضغط للرفع من هاتفك</p></div>}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-primary uppercase pr-4">وصف مختصر</label>
                 <Textarea value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} placeholder="اشرح تفاصيل التصميم..." />
              </div>
            </div>
            <DialogFooter className="mt-10"><Button onClick={handleAddToGallery} disabled={isProcessing} className="royal-button w-full h-18 text-xl">{isProcessing ? <Loader2 className="animate-spin" /> : <><Zap size={20} className="ml-2" /> نشر العمل الآن</>}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={60} /></div>
        ) : galleryItems?.length === 0 ? (
          <div className="col-span-full py-40 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
             <ImageIcon size={100} className="text-muted-foreground mb-6" />
             <p className="text-xl font-black uppercase tracking-widest">المعرض لا يحتوي على أعمال حالياً</p>
          </div>
        ) : galleryItems?.map((item: any) => (
          <Card key={item.id} className="luxury-card border-none flex flex-col group h-full shadow-lg">
             <div className="relative aspect-video overflow-hidden bg-muted">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <Badge className="absolute top-4 right-4 bg-primary text-black font-black uppercase text-[8px] px-4 py-1 rounded-full shadow-2xl">{item.category}</Badge>
             </div>
             <CardContent className="p-8 flex-1 flex flex-col">
                <h4 className="font-black text-2xl line-clamp-1 mb-2 group-hover:gold-text transition-colors">{item.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed font-medium">{item.description}</p>
             </CardContent>
             <div className="p-5 bg-muted/30 border-t mt-auto">
                <Button onClick={() => handleDeleteItem(item.id)} disabled={isProcessing} variant="destructive" className="w-full h-12 rounded-xl gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl">
                   {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <><Trash2 size={18} /> حذف العمل نهائياً</>}
                </Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}