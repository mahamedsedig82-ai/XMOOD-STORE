
"use client";

import { useParams } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, CheckCircle2, Clock, ShieldCheck, Tag, Truck, Zap, Loader2, DollarSign, User, Copy } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function OrderInvoicePage() {
  const { id } = useParams();
  const db = useFirestore();
  const orderRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "orders", id as string);
  }, [db, id]);

  const { data: order, loading } = useDoc(orderRef);

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: `تم نسخ ${label} إلى الحافظة.` });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={60} /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-3xl font-black bg-background">القسيمة غير موجودة</div>;

  return (
    <main className="min-h-screen bg-muted/30 pb-40" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-32 max-w-4xl">
        
        <div className="flex justify-between items-center mb-10 no-print">
           <h1 className="text-2xl md:text-3xl font-black gold-text">القسيمة الرسمية للعملية</h1>
           <Button onClick={handlePrint} variant="outline" className="h-12 rounded-xl font-black text-[10px] md:text-xs gap-3 border-primary/20 hover:bg-primary/5">
              <Printer size={18} /> طباعة القسيمة (PDF)
           </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
           <Card id="invoice-render" className="luxury-card border-none bg-white dark:bg-zinc-950 p-6 md:p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10 border-b pb-12 mb-12">
                 <div className="space-y-4">
                    <img src="https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png" alt="XMOOD" className="h-12 md:h-20 w-auto object-contain mb-2" />
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Official Sovereign Invoice</p>
                    <div className="pt-4 space-y-2">
                       <p className="text-[10px] md:text-xs font-bold flex items-center gap-3 cursor-pointer group" onClick={() => copyToClipboard(order.id, "رقم العملية")}>
                          <Tag size={14} className="text-primary" /> 
                          مرجع العملية: <span className="font-mono text-primary group-hover:underline">{order.id}</span>
                          <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                       </p>
                       <p className="text-[10px] md:text-xs font-bold flex items-center gap-3"><Clock size={14} className="text-primary" /> التاريخ: {new Date(order.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                 </div>
                 <div className="text-center md:text-left space-y-4 w-full md:w-auto">
                    <Badge className={`h-12 w-full md:w-auto px-10 rounded-2xl font-black text-sm uppercase tracking-widest ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                       {order.status === 'completed' ? 'تم التنفيذ' : 'قيد المعالجة'}
                    </Badge>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Execution Mode: Automated</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-16 relative z-10">
                 <div className="p-6 md:p-8 bg-muted/20 rounded-[1.5rem] md:rounded-[2rem] border border-border/50">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2"><User size={14} /> بيانات المستحوذ</h4>
                    <p className="text-lg md:text-xl font-black">{order.userName}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">{order.userEmail}</p>
                    <p className="text-[9px] font-mono text-zinc-500 mt-2 cursor-pointer hover:text-primary" onClick={() => copyToClipboard(order.userId, "معرف العميل")}>ID: {order.userId}</p>
                 </div>
                 <div className="p-6 md:p-8 bg-muted/20 rounded-[1.5rem] md:rounded-[2rem] border border-border/50">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2"><Truck size={14} /> لوجستيات التسليم</h4>
                    <p className="text-lg md:text-xl font-black">{order.shippingMethodName}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">البريد المعتمد: {order.deliveryEmail || "تلقائي"}</p>
                    <Badge variant="outline" className="mt-4 border-green-500/20 text-green-500 text-[8px] font-black uppercase">DELIVERY: {order.deliveryStatus}</Badge>
                 </div>
              </div>

              <div className="relative z-10 space-y-6">
                 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 border-r-4 border-primary pr-4">الأصول والخدمات المشمولة</h4>
                 <div className="bg-muted/30 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right">
                         <thead className="bg-muted/50 border-b">
                            <tr>
                               <th className="p-4 md:p-6 font-black text-[10px] md:text-xs">المنتج / الخدمة</th>
                               <th className="p-4 md:p-6 font-black text-[10px] md:text-xs text-center">الكمية</th>
                               <th className="p-4 md:p-6 font-black text-[10px] md:text-xs text-left">السعر</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y">
                            {order.items?.map((item: any, i: number) => (
                              <tr key={i} className="hover:bg-muted/20 transition-colors">
                                 <td className="p-4 md:p-6 font-bold text-xs md:text-sm">{item.name}</td>
                                 <td className="p-4 md:p-6 text-center font-black text-xs md:text-sm">x{item.quantity}</td>
                                 <td className="p-4 md:p-6 text-left font-black text-xs md:text-sm">{formatUSD(item.price)}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 relative z-10">
                 <div className="space-y-8">
                    {order.shippingCodeSent ? (
                      <div 
                        className="p-8 bg-primary/5 border-2 border-dashed border-primary/40 rounded-[1.5rem] md:rounded-[2.5rem] shadow-inner text-center cursor-pointer group hover:bg-primary/10 transition-all"
                        onClick={() => copyToClipboard(order.shippingCodeSent, "كود التفعيل")}
                      >
                         <p className="text-[10px] font-black text-primary uppercase mb-4 tracking-[0.2em] flex items-center justify-center gap-2">
                           كود التفعيل السيادي <Copy size={12} className="opacity-40 group-hover:opacity-100" />
                         </p>
                         <p className="text-2xl md:text-5xl font-black tracking-[0.1em] md:tracking-[0.3em] gold-text select-all break-all">{order.shippingCodeSent}</p>
                         <p className="text-[7px] font-bold text-muted-foreground uppercase mt-6 tracking-widest">انقر لنسخ الكود فوراً</p>
                      </div>
                    ) : (
                      <div className="p-8 bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-[1.5rem] md:rounded-[2.5rem] text-center">
                         <p className="text-amber-500 font-black text-sm uppercase">بانتظار تزويد الكود من المخزون</p>
                         <p className="text-[9px] text-muted-foreground mt-2 uppercase">Stock replenishing in progress...</p>
                      </div>
                    )}
                 </div>

                 <div className="space-y-8">
                    <div className="p-6 md:p-8 bg-primary/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-primary/20 relative overflow-hidden">
                       <h4 className="text-[10px] font-black text-primary uppercase mb-6 flex items-center gap-2"><DollarSign size={14}/> التحليل المالي</h4>
                       <div className="space-y-4">
                          <div className="flex justify-between font-bold text-muted-foreground text-[10px] md:text-xs uppercase">
                             <span>الرصيد قبل</span>
                             <span>{formatUSD(order.balanceBefore || 0)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-muted-foreground text-[10px] md:text-xs uppercase">
                             <span>تكلفة اللوجستيات</span>
                             <span>{formatUSD(order.shippingFee || 0)}</span>
                          </div>
                          <div className="h-px bg-primary/10 my-4" />
                          <div className="flex justify-between items-end">
                             <span className="font-black text-xs md:text-sm uppercase">صافي الرصيد بعد</span>
                             <span className="text-xl md:text-2xl font-black text-primary">{formatUSD(order.balanceAfter || 0)}</span>
                          </div>
                          <div className="flex justify-between items-end pt-4">
                             <span className="font-black text-xs md:text-sm uppercase gold-text">إجمالي المدفوع</span>
                             <span className="text-3xl md:text-6xl font-black gold-text tracking-tighter">{formatUSD(order.totalAmount)}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-20 pt-10 border-t text-center space-y-4 opacity-40 grayscale group hover:opacity-100 transition-opacity">
                 <p className="text-[8px] font-black uppercase tracking-[0.5em]">Precision Automated Receipt by XMOOD Sovereign Cloud Settlement Engine</p>
                 <div className="flex justify-center gap-8">
                    <Zap size={20} />
                    <ShieldCheck size={20} />
                    <CheckCircle2 size={20} />
                 </div>
              </div>
           </Card>
        </motion.div>
      </div>
      
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; }
          .container { max-width: 100% !important; width: 100% !important; padding: 0 !important; }
          #invoice-render { box-shadow: none !important; border: 2px solid #d4af37 !important; color: black !important; }
          .gold-text { color: #b8860b !important; -webkit-text-fill-color: #b8860b !important; }
        }
      `}</style>
    </main>
  );
}
