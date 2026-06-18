"use client";

import { useState, useRef } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ImageIcon, Loader2, Upload, Sparkles, User } from "lucide-react";
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
      createdAt: new Date().toISOString(), // الحقل الموحد للعرض
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "gallery"), data);
      setIsGalleryOpen(false);
      setNewDesign({ title: "", description: "", imageUrl: "", category: "Logo" });
      toast({ title: "تم نشر العمل الإبداعي" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف النهائي؟") || !db) return;
    
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "gallery", id));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-40" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-card/40 p-6 rounded-[2rem] border shadow-xl">
        <div className="text-right">
           <h1 className="text-3xl font-black gold-text leading-tight">إدارة معرض الأعمال</h1>
           <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Creative Portfolio Manager</p>
        </div>
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogTrigger asChild>
            <Button className="royal-button h-14 px-10"><Plus size={20} className="ml-2" /> نشر عمل جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[2.5rem] p-10 max-w-2xl overflow-y-auto max-h-[90vh] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black gold-text flex items-center gap-4"><ImageIcon size={24} /> إضافة عمل إبداعي</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-primary uppercase pr-3">عنوان العمل</label>
                    <Input value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} placeholder="مثال: هوية بصرية 2025" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-primary uppercase pr-3">التصنيف</label>
                    <Input value={newDesign.category} onChange={e => setNewDesign({...newDesign, category: e.target.value})} placeholder="Logo, Identity..." />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-primary uppercase pr-3">صورة العمل</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-40 bg-muted/40 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden hover:bg-primary/5 transition-all">
                    {newDesign.imageUrl ? (
                      <img src={newDesign.imageUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="text-center opacity-40">
                         <Upload className="mx-auto mb-1" size={24} />
                         <p className="text-[9px] font-black uppercase">رفع من الاستوديو</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-primary uppercase pr-3">وصف العمل</label>
                 <Textarea value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} placeholder="اشرح تفاصيل التصميم..." className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter className="mt-8">
               <Button onClick={handleAddToGallery} disabled={isProcessing} className="royal-button w-full h-16">
                 {isProcessing ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} className="ml-2" /> نشر الآن</>}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={50} /></div>
        ) : galleryItems?.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-30 italic">لا توجد أعمال في المعرض حالياً</div>
        ) : galleryItems?.map((item: any) => (
          <Card key={item.id} className="luxury-card border-none flex flex-col group h-full">
             <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Badge className="absolute top-3 right-3 bg-primary text-black font-black uppercase text-[7px] px-3 py-1 rounded-full">{item.category}</Badge>
             </div>
             <CardContent className="p-6 flex-1 flex flex-col">
                <h4 className="font-black text-xl line-clamp-1 mb-2">{item.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-6 flex-1">{item.description}</p>
                <div className="pt-4 border-t flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User size={12} /></div>
                      <span className="text-[9px] font-black uppercase text-zinc-500">{item.designerName}</span>
                   </div>
                   <Button 
                    onClick={() => handleDeleteItem(item.id)} 
                    disabled={isProcessing}
                    variant="ghost" 
                    className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                     <Trash2 size={18} />
                  </Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}