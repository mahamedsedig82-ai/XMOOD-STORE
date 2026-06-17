
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      toast({ variant: "destructive", title: "بيانات ناقصة" });
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
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold gold-text">إدارة معرض أعمالي</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Professional Portfolio & Gallery Control</p>
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
              <div className="space-y-2"><label className="text-[10px] font-bold text-primary uppercase pr-3">عنوان العمل</label><Input value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" /></div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">صورة العمل</label>
                <div onClick={() => fileInputRef.current?.click()} className="h-24 bg-zinc-900 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all">
                  {newDesign.imageUrl ? <img src={newDesign.imageUrl} className="h-full w-full object-cover rounded-xl" alt="" /> : <Upload className="text-primary" />}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-primary uppercase pr-3">الفئة</label><Input value={newDesign.category} onChange={e => setNewDesign({...newDesign, category: e.target.value})} className="h-14 bg-zinc-900 border-none rounded-xl px-6 font-bold" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-primary uppercase pr-3">الوصف</label><Textarea value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} className="bg-zinc-900 border-none rounded-2xl min-h-[100px] p-4" /></div>
            </div>
            <DialogFooter className="mt-10"><Button onClick={handleAddToGallery} disabled={isProcessing} className="royal-button w-full h-16">{isProcessing ? <Loader2 className="animate-spin" /> : "نشر العمل في المعرض"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></div>
        ) : galleryItems?.length === 0 ? (
          <div className="col-span-full py-40 text-center luxury-card border-dashed opacity-30"><Palette size={80} className="mx-auto mb-6" /><p className="font-bold uppercase tracking-widest">لا توجد أعمال في المعرض حالياً</p></div>
        ) : galleryItems?.map((item: any) => (
          <Card key={item.id} className="luxury-card border-none bg-zinc-900/60 overflow-hidden flex flex-col group hover:border-primary/20 transition-all">
             <div className="relative aspect-video overflow-hidden">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <Badge className="absolute top-3 right-3 bg-primary text-black font-black text-[7px] uppercase px-3 py-1 rounded-full shadow-lg">{item.category}</Badge>
             </div>
             <CardContent className="p-5 flex-1 space-y-2">
                <h4 className="font-black text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{item.description}</p>
             </CardContent>
             
             {/* زر الحذف في شريط مستقل تماماً بالأسفل لضمان الوصول إليه دائماً */}
             <div className="p-4 bg-black/40 border-t border-white/5 mt-auto">
                <Button 
                  onClick={() => handleDeleteItem(item.id)} 
                  disabled={isProcessing}
                  variant="destructive" 
                  className="w-full h-11 rounded-xl gap-3 font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-red-500/20"
                >
                   {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <><Trash2 size={16} /> حذف العمل الفني</>}
                </Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
