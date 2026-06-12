
"use client";

import { useState } from "react";
import { generateAiDesign } from "@/ai/flows/generate-design-flow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Download, Wand2, Loader2, Image as ImageIcon, Zap, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AiDesignPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("luxury gold professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ variant: "destructive", title: "وصف ناقص", description: "يرجى كتابة ما تريد تصميمه." });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAiDesign({ prompt, style });
      setGeneratedImage(result.imageUrl);
      setHistory(prev => [result.imageUrl, ...prev]);
      toast({ title: "تم التوليد بنجاح", description: "تصميمك الأسطوري جاهز الآن." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ فني", description: "فشل توليد التصميم، حاول مجدداً." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `xmood-design-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-12 animate-fade-in text-white" dir="rtl">
      <header className="flex items-center gap-6">
        <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-black shadow-2xl shadow-primary/20">
          <Wand2 size={32} />
        </div>
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">استوديو المصمم الذكي</h1>
          <p className="text-slate-500 text-sm font-black uppercase tracking-[0.4em] mt-1">Sovereign AI Design Studio</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-1 luxury-card border-none p-10 flex flex-col justify-between">
          <div className="space-y-8">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl font-bold flex items-center gap-4 gold-text">
                <Zap size={24} className="text-primary" /> معايير التصميم
              </CardTitle>
              <CardDescription>اكتب وصفاً دقيقاً باللغة الإنجليزية للحصول على أفضل النتائج.</CardDescription>
            </CardHeader>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pr-4">وصف التصميم (Prompt)</label>
                <Textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Example: A luxurious gold logo for a gaming store, abstract crown, black background, 4k..."
                  className="h-32 bg-black border-none rounded-2xl p-6 font-bold text-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pr-4">النمط الفني (Style)</label>
                <Input 
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  placeholder="luxury, golden, cinematic..."
                  className="h-12 bg-black border-none rounded-xl px-6 font-bold"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="royal-button h-20 text-2xl mt-12 shadow-2xl"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles size={28} className="ml-4" /> توليد الآن</>}
          </Button>
        </Card>

        <Card className="lg:col-span-2 luxury-card border-none overflow-hidden flex flex-col legendary-border">
          <div className="flex-1 relative flex items-center justify-center p-6 bg-zinc-950/50">
            {generatedImage ? (
              <div className="relative group w-full h-full flex items-center justify-center">
                <img src={generatedImage} className="max-h-[600px] w-auto rounded-3xl shadow-[0_0_100px_rgba(255,184,0,0.2)] border border-primary/20" alt="Generated" />
                <div className="absolute top-6 left-6 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button onClick={handleDownload} className="h-14 w-14 rounded-2xl bg-primary text-black p-0 shadow-2xl"><Download size={24} /></Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 opacity-10">
                <ImageIcon size={120} className="mx-auto" />
                <p className="text-3xl font-black uppercase tracking-[0.5em]">Awaiting Creation...</p>
              </div>
            )}
          </div>
          
          {history.length > 0 && (
            <div className="p-8 bg-black/60 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-3">
                <History size={14} /> سجل التوليد الأخير
              </h4>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {history.map((img, i) => (
                  <button key={i} onClick={() => setGeneratedImage(img)} className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 hover:border-primary transition-all shrink-0">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
