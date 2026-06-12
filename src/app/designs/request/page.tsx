
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Palette, Ruler, FileText, Send, Loader2, Sparkles } from "lucide-react";

export default function DesignRequestPage() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    designType: "",
    description: "",
    colors: "",
    dimensions: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "design_requests"), {
        customerId: user.uid,
        customerEmail: user.email,
        customerName: profile?.displayName || "عميل",
        ...form,
        status: "pending",
        drafts: [],
        finalFiles: [],
        createdAt: new Date().toISOString()
      });
      toast({ title: "تم إرسال الطلب", description: "سيقوم أحد مصممينا بمراجعة طلبك فوراً." });
      setForm({ designType: "", description: "", colors: "", dimensions: "", notes: "" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الطلب." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <header className="text-center mb-16 space-y-4">
          <Sparkles className="mx-auto text-primary w-12 h-12 mb-4" />
          <h1 className="text-5xl font-headline font-bold text-slate-900">طلب تصميم ملكي</h1>
          <p className="text-muted-foreground text-lg">حوّل رؤيتك إلى واقع رقمي باحترافية استثنائية.</p>
        </header>

        <form onSubmit={handleSubmit}>
          <Card className="luxury-card p-8 md:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <FileText size={14} /> نوع التصميم
                </label>
                <Select onValueChange={(val) => setForm({...form, designType: val})} required>
                  <SelectTrigger className="h-14 rounded-2xl border-primary/10 bg-muted/30">
                    <SelectValue placeholder="اختر نوع الخدمة..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="logo">شعار هوية بصرية</SelectItem>
                    <SelectItem value="social">تصاميم سوشيال ميديا</SelectItem>
                    <SelectItem value="ads">بنرات إعلانية</SelectItem>
                    <SelectItem value="motion">موشن جرافيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <Ruler size={14} /> المقاسات المطلوبة
                </label>
                <Input 
                  placeholder="مثال: 1080x1080px" 
                  className="h-14 rounded-2xl border-primary/10 bg-muted/30"
                  value={form.dimensions}
                  onChange={e => setForm({...form, dimensions: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <Palette size={14} /> الألوان المفضلة
              </label>
              <Input 
                placeholder="مثال: ذهبي، أبيض، أسود فخم..." 
                className="h-14 rounded-2xl border-primary/10 bg-muted/30"
                value={form.colors}
                onChange={e => setForm({...form, colors: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                وصف الفكرة بالتفصيل
              </label>
              <Textarea 
                placeholder="اشرح لنا تفاصيل التصميم الذي ترغب به..." 
                className="min-h-[150px] rounded-3xl border-primary/10 bg-muted/30 p-6"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full royal-button h-16 text-lg">
              {loading ? <Loader2 className="animate-spin" /> : <><Send className="ml-2" /> إرسال الطلب للاعتماد</>}
            </Button>
          </Card>
        </form>
      </div>
    </main>
  );
}
