"use client";

import { useState, useRef } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ImageIcon, Loader2, Upload, Zap, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
          const MAX_WIDTH = 1000;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
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
        toast({ title: "تم تجهيز العمل الفني بنجاح" });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل معالجة الصورة" });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleAddToGallery = async () => {
    if (!newDesign.title || !newDesign.imageUrl || !db || !user) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء العنوان ورفع الصورة." });
      return;
    }

    setIsProcessing(true);
    const data = {
      ...newDesign,
      designerId: user.uid,
      designerName: profile?.displayName || "مصمم معتمد",
      designerPhone: profile?.phoneNumber || "",
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "gallery"), data);
      setIsGalleryOpen(false);
      setNewDesign({ title: "", description: "", imageUrl: "", category: "Logo" });
      toast({ title: "تم نشر العمل الأسطوري بنجاح" });
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'gallery',
        operation: 'create',
        requestResourceData: data
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العمل الأسطوري نهائياً؟") || !db) return;
    
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "gallery", id));
      toast({ title: "تم التطهير والحذف بنجاح" });
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `gallery/${id}`,
        operation: 'delete'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-16 animate-fade-in pb-40" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-10 bg-card/60 p-10 rounded-[4rem] border shadow-2xl backdrop-blur-3xl">
        <div className="text-right">
           <h1 className="text-5xl font-headline font-black gold-text leading-tight">إدارة معرض الأعمال</h1>
           <p className="text-[11px] font-black uppercase text-emerald-500 tracking-[0.5em] mt-3">Elite Creative Portfolio Hub 8.0</p>
        </div>
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogTrigger asChild>
            <Button className="royal-button h-20 px-16 text-xl shadow-primary/40"><Plus size={32} className="ml-4" /> نشر عمل جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[4rem] p-12 max-w-3xl overflow-y-auto max-h-[95vh] shadow-[0_0_100px_rgba(0,0,0,0.4)]">
            <DialogHeader>
              <DialogTitle className="text-4xl font-black gold-text flex items-center gap-6"><ImageIcon size={40} /> إضافة عمل إبداعي</DialogTitle>
            </DialogHeader>
            <div className="space-y-10 mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-primary uppercase pr-6 tracking-widest">عنوان العمل الفني</label>
                    <Input value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} placeholder="مثال: هوية بصرية 2025" className="rounded-[2rem]" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-primary uppercase pr-6 tracking-widest">التصنيف الفني</label>
                    <Input value={newDesign.category} onChange={e => setNewDesign({...newDesign, category: e.target.value})} placeholder="Logo, Identity, Motion" className="rounded-[2rem]" />
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="text-[11px] font-black text-primary uppercase pr-6 tracking-widest">صورة العمل (رفع من الهاتف)</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-64 bg-muted/40 border-4 border-dashed border-primary/30 rounded-[3.5rem] flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-primary/5 transition-all relative shadow-inner">
                    {newDesign.imageUrl ? (
                      <img src={newDesign.imageUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="text-center animate-pulse">
                         <Upload className="text-primary mx-auto mb-4" size={48} />
                         <p className="text-[11px] font-black opacity-50 tracking-widest">انقر لرفع صورة العمل</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="text-[11px] font-black text-primary uppercase pr-6 tracking-widest">وصف العمل وتفاصيله</label>
                 <Textarea value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} placeholder="اشرح رؤيتك الفنية في هذا التصميم..." className="min-h-[160px] p-8 rounded-[2.5rem]" />
              </div>
            </div>
            <DialogFooter className="mt-12">
               <Button onClick={handleAddToGallery} disabled={isProcessing} className="royal-button w-full h-20 text-2xl shadow-xl">
                 {isProcessing ? <Loader2 className="animate-spin" /> : <><Sparkles size={24} className="ml-3" /> نشر العمل الأسطوري الآن</>}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {loading ? (
          <div className="col-span-full py-60 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={80} /></div>
        ) : galleryItems?.length === 0 ? (
          <div className="col-span-full py-60 text-center luxury-card border-dashed opacity-30 flex flex-col items-center gap-10">
             <ImageIcon size={140} className="text-muted-foreground mb-4" />
             <p className="text-3xl font-black uppercase tracking-[0.5em]">المعرض لا يحتوي على روائع بعد</p>
          </div>
        ) : galleryItems?.map((item: any) => (
          <Card key={item.id} className="luxury-card border-none flex flex-col group h-full shadow-2xl relative">
             <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-125" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                <Badge className="absolute top-6 right-6 bg-primary text-black font-black uppercase text-[9px] px-6 py-2 rounded-full shadow-2xl tracking-widest border-none">
                  {item.category}
                </Badge>
             </div>
             <CardContent className="p-10 flex-1 flex flex-col relative z-10">
                <h4 className="font-black text-3xl line-clamp-1 mb-4 group-hover:gold-text transition-colors duration-500">{item.title}</h4>
                <p className="text-base text-muted-foreground line-clamp-3 h-18 leading-relaxed font-medium mb-8">{item.description}</p>
                <div className="mt-auto pt-8 border-t border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary"><User size={14} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.designerName}</span>
                   </div>
                </div>
             </CardContent>
             <div className="p-6 bg-black/20 border-t border-white/5 mt-auto flex gap-4">
                <Button 
                  onClick={() => handleDeleteItem(item.id)} 
                  disabled={isProcessing}
                  variant="destructive" 
                  className="w-full h-14 rounded-2xl gap-4 font-black text-[11px] uppercase tracking-widest shadow-2xl group/btn"
                >
                   {isProcessing ? <Loader2 className="animate-spin" /> : <><Trash2 size={22} className="group-hover/btn:rotate-12 transition-transform" /> حذف العمل السيادي</>}
                </Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}