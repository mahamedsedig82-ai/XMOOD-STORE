"use client";

import { useState, useRef, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, deleteDoc, doc, addDoc, query, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ImageIcon, Loader2, Upload, User, Clock } from "lucide-react";
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
  
  const [newDesign, setNewDesign] = useState({ title: "", description: "", imageUrl: "", category: "Signature" });

  const galleryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "gallery"));
  }, [db]);

  const { data: rawGalleryItems, loading } = useCollection(galleryQuery);

  const galleryItems = useMemo(() => {
    if (!rawGalleryItems) return [];
    return [...rawGalleryItems].sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [rawGalleryItems]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
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
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleAddToGallery = () => {
    if (!newDesign.title || !newDesign.imageUrl || !db || !user) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }

    setIsProcessing(true);
    const data = {
      ...newDesign,
      designerId: user.uid,
      designerName: profile?.displayName || "Elite Designer",
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    addDoc(collection(db, "gallery"), data)
      .then(() => {
        setIsGalleryOpen(false);
        setNewDesign({ title: "", description: "", imageUrl: "", category: "Signature" });
        toast({ title: "تم نشر العمل الإبداعي بنجاح" });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'gallery',
          operation: 'create',
          requestResourceData: data
        }));
      })
      .finally(() => setIsProcessing(false));
  };

  const handleDeleteItem = (docId: string) => {
    if (!docId || !db) return;
    if (!window.confirm("⚠️ هل أنت متأكد من حذف هذا العمل نهائياً من الأرشيف؟")) return;
    
    const docRef = doc(db, "gallery", docId);
    
    // Non-blocking delete for instant UI response
    deleteDoc(docRef)
      .then(() => toast({ title: "تم الحذف بنجاح" }))
      .catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
  };

  return (
    <div className="space-y-12 animate-fade-in pb-40" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-2xl">
        <div className="text-right">
           <h1 className="text-3xl md:text-4xl font-black gold-text leading-tight">إدارة أرشيف الأعمال</h1>
           <p className="text-[9px] md:text-[11px] font-black uppercase text-muted-foreground tracking-[0.3em] mt-2">Elite Design Control Panel</p>
        </div>
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogTrigger asChild>
            <Button className="royal-button h-14 md:h-18 px-8 md:px-12 text-sm md:text-base shadow-2xl"><Plus size={24} className="ml-3" /> نشر عمل جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 max-w-2xl overflow-y-auto max-h-[90vh] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-black gold-text flex items-center gap-4"><ImageIcon size={32} /> إضافة للرواد</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 md:space-y-8 mt-6 md:mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase pr-4">عنوان العمل</label>
                    <Input value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} placeholder="العنوان..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase pr-4">التصنيف</label>
                    <Input value={newDesign.category} onChange={e => setNewDesign({...newDesign, category: e.target.value})} placeholder="Signature..." />
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-primary uppercase pr-4">الصورة الفنية</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-40 md:h-48 bg-muted/30 border-2 border-dashed border-primary/20 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center cursor-pointer overflow-hidden group">
                    {newDesign.imageUrl ? (
                      <img src={newDesign.imageUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="text-center opacity-40">
                         <Upload className="mx-auto mb-2" size={32} />
                         <p className="text-[9px] font-black uppercase">رفع من الاستوديو</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-primary uppercase pr-4">شرح الرؤية الإبداعية</label>
                 <Textarea value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} placeholder="صف العمل..." className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter className="mt-8">
               <Button onClick={handleAddToGallery} disabled={isProcessing} className="royal-button w-full h-16 md:h-20 text-lg md:text-2xl">
                 {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد النشر الفوري"}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={60} /></div>
        ) : galleryItems.length === 0 ? (
          <div className="col-span-full py-40 text-center opacity-30 italic font-black uppercase tracking-[0.3em]">الأرشيف فارغ حالياً</div>
        ) : galleryItems.map((item: any) => (
          <Card key={item.id} className="luxury-card border-none flex flex-col group h-full shadow-lg overflow-visible bg-card">
             <div className="p-3 bg-zinc-950 border-b border-primary/10 flex items-center justify-between rounded-t-[2rem] md:rounded-t-[3.5rem] relative z-[50]">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[7px] px-3 py-1 uppercase tracking-tighter">{item.category}</Badge>
                <button 
                  onClick={() => handleDeleteItem(item.id)}
                  className="h-9 w-9 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-xl bg-black/60 border border-red-500/20 cursor-pointer active:scale-90"
                  title="حذف نهائي"
                >
                   <Trash2 size={18} />
                </button>
             </div>

             <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105" alt="" />
             </div>

             <CardContent className="p-6 md:p-8 flex-1 flex flex-col bg-card">
                <h4 className="font-black text-xl md:text-2xl line-clamp-1 mb-2 gold-text tracking-tighter">{item.title}</h4>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6 flex-1">{item.description}</p>
                <div className="pt-4 border-t border-border/40 flex items-center justify-between opacity-60">
                   <div className="flex items-center gap-2">
                      <User size={12} className="text-primary" />
                      <span className="text-[8px] font-black uppercase">{item.designerName}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-[7px] font-bold">
                      <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
