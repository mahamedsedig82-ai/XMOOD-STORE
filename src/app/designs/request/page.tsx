
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Palette, Ruler, FileText, Send, Loader2, Sparkles, Phone } from "lucide-react";

export default function DesignRequestPage() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    designType: "",
    description: "",
    colors: "",
    dimensions: "",
    customerPhone: profile?.phoneNumber || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى تسجيل الدخول أولاً." });
      return;
    }
    setLoading(true);

    try {
      await addDoc(collection(db, "design_requests"), {
        customerId: user.uid,
        customerEmail: user.email,
        customerName: profile?.displayName || "عميل",
        customerPhone: form.customerPhone,
        ...form,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      toast({ title: "تم إرسال الطلب", description: "سيقوم المصرف بالتواصل معك عبر الواتساب فوراً." });
      setForm({ designType: "", description: "", colors: "", dimensions: "", customerPhone: profile?.phoneNumber || "" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الطلب." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-4xl">
        <header className="text-center mb-16 space-y-4">
          <Sparkles className="mx-auto text-primary w-12 h-12 mb-4" />
          <h1 className="text-5xl font-headline font-bold gold-text">طلب تصميم بريميوم</h1>
          <p className="text-zinc-500 text-lg">حول فكرتك إلى حقيقة بلمسة احترافية عصرية.</p>
        </header>

        <form onSubmit={handleSubmit}>
          <Card className="luxury-card p-10 space-y-8 border-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                  <FileText size={14} /> نوع التصميم
                </label>
                <Select onValueChange={(val) => setForm({...form, designType: val})} required>
                  <SelectTrigger className="h-14 rounded-2xl bg-zinc-900 border-none text-white font-bold">
                    <SelectValue placeholder="اختر نوع الخدمة..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10 text-white">
                    <SelectItem value="logo">شعار هوية بصرية</SelectItem>
                    <SelectItem value="social">تصاميم سوشيال ميديا</SelectItem>
                    <SelectItem value="ads">بنرات إعلانية</SelectItem>
                    <SelectItem value="motion">موشن جرافيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                  <Phone size={14} /> رقم الواتساب الخاص بك
                </label>
                <Input 
                  placeholder="مثال: +966500000000" 
                  className="h-14 rounded-2xl bg-zinc-900 border-none text-white font-bold"
                  value={form.customerPhone}
                  onChange={e => setForm({...form, customerPhone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                   <Ruler size={14} /> المقاسات
                 </label>
                 <Input 
                   placeholder="1080x1080px..." 
                   className="h-14 rounded-2xl bg-zinc-900 border-none text-white font-bold"
                   value={form.dimensions}
                   onChange={e => setForm({...form, dimensions: e.target.value})}
                 />
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                   <Palette size={14} /> الألوان المفضلة
                 </label>
                 <Input 
                   placeholder="ذهبي، أسود، أحمر..." 
                   className="h-14 rounded-2xl bg-zinc-900 border-none text-white font-bold"
                   value={form.colors}
                   onChange={e => setForm({...form, colors: e.target.value})}
                 />
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase text-primary tracking-widest">وصف الفكرة بالتفصيل</label>
              <Textarea 
                placeholder="اشرح لنا تفاصيل التصميم الذي ترغب به..." 
                className="min-h-[150px] rounded-3xl bg-zinc-900 border-none text-white p-6 font-bold"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full royal-button h-18 text-xl">
              {loading ? <Loader2 className="animate-spin" /> : <><Send className="ml-3" /> إرسال الطلب للمصمم</>}
            </Button>
          </Card>
        </form>
      </div>
    </main>
  );
}
