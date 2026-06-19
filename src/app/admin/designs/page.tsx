"use client";

import { useState, useRef } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ImageIcon, Loader2, Upload, Sparkles, User, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

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

  const galleryItems = (rawGalleryItems || []).sort((a: any, b: any) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

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
      designerName: profile?.displayName || "Elite Designer",
      designerPhone: profile?.phoneNumber || "",
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "gallery"), data);
      setIsGalleryOpen(false);
      setNewDesign({ title: "", description: "", imageUrl: "", category: "Signature" });
      toast({ title: "تم نشر العمل الإبداعي بنجاح" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف النهائي لهذا العمل من المعرض؟") || !db) return;
    
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "gallery", id));
      toast({ title: "تم الحذف بنجاح من الأرشيف" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-40" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-card p-10 rounded-[3rem] border shadow-2xl">
        <div className="text-right">
           <h1 className="text-4xl font-black gold-text leading-tight tracking-tighter">أرشيف الأعمال الإبداعية</h1>
           <p className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.5em] mt-2">Elite Design Portfolio Hub</p>
        </div>
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogTrigger asChild>
            <Button className="royal-button h-18 px-12 text-base shadow-2xl hover:scale-105 transition-all"><Plus size={24} className="ml-3" /> نشر روائع جديدة</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[3.5rem] p-12 max-w-2xl overflow-y-auto max-h-[90vh] shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black gold-text flex items-center gap-4"><ImageIcon size={32} /> إضافة عمل للرواد</DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase pr-6 tracking-widest">عنوان العمل</label>
                    <Input value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} placeholder="Xmood Official Branding..." />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase pr-6 tracking-widest">التصنيف</label>
                    <Input value={newDesign.category} onChange={e => setNewDesign({...newDesign, category: e.target.value})} placeholder="Signature, Identity, UI..." />
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-primary uppercase pr-6 tracking-widest">التحفة الفنية (الصورة)</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-56 bg-muted/30 border-2 border-dashed border-primary/20 rounded-[2.5rem] flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-primary/5 transition-all">
                    {newDesign.imageUrl ? (
                      <img src={newDesign.imageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="" />
                    ) : (
                      <div className="text-center opacity-40">
                         <Upload className="mx-auto mb-3" size={40} />
                         <p className="text-[10px] font-black uppercase tracking-widest">رفع من الأستوديو المركزي</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-primary uppercase pr-6 tracking-widest">شرح الرؤية الإبداعية</label>
                 <Textarea value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} placeholder="صف تفاصيل هذا العمل الاستثنائي..." className="min-h-[150px] !bg-zinc-950/50" />
              </div>
            </div>
            <DialogFooter className="mt-12">
               <Button onClick={handleAddToGallery} disabled={isProcessing} className="royal-button w-full h-20 text-2xl shadow-2xl">
                 {isProcessing ? <Loader2 className="animate-spin" /> : <><Sparkles size={24} className="ml-4" /> خلود العمل في المعرض</>}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={100} /></div>
        ) : galleryItems.length === 0 ? (
          <div className="col-span-full py-60 text-center opacity-30 italic font-black uppercase tracking-[0.5em] text-zinc-500">The Gallery is Empty</div>
        ) : galleryItems.map((item: any) => (
          <Card key={item.id} className="luxury-card border-none flex flex-col group h-full hover:scale-[1.03] transition-all duration-700 relative">
             {/* 🛡️ Delete Action Header (Outside Image Scope) */}
             <div className="p-4 bg-muted/20 border-b flex items-center justify-between z-20">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[7px] px-3 py-1 uppercase tracking-widest">{item.category}</Badge>
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} 
                  disabled={isProcessing}
                  variant="ghost" 
                  className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                >
                   <Trash2 size={18} />
                </Button>
             </div>

             <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
             </div>

             <CardContent className="p-8 flex-1 flex flex-col">
                <h4 className="font-black text-2xl line-clamp-1 mb-3 group-hover:gold-text transition-all tracking-tighter">{item.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-8 flex-1 font-medium">{item.description}</p>
                <div className="pt-6 border-t flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm"><User size={14} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.designerName}</span>
                   </div>
                   <div className="flex items-center gap-2 text-[8px] font-bold text-muted-foreground uppercase opacity-60">
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
