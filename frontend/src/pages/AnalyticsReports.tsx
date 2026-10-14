import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  DollarSign,
  CreditCard,
  Banknote,
  QrCode,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export const AnalyticsReports: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const data = await api.getSalesReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrintZReport = () => {
    window.print();
  };

  if (loading && !report) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fin = report?.financials || {
    gross_sales: 0,
    discounts: 0,
    net_sales: 0,
    tax_collected: 0,
    packaging_fees: 0,
    delivery_fees: 0,
    final_total: 0
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Financial Analytics & Daily Z-Report
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              Audited
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            End-of-day sales register reconciliation, tax reports, and channel financial totals.
          </p>
        </div>

        <button
          onClick={handlePrintZReport}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 text-xs"
        >
          <Printer className="w-4 h-4" />
          Print Daily Z-Report
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gross Item Sales</span>
          <div className="text-2xl font-black text-white font-mono">₹{fin.gross_sales.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Before taxes & discounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Taxes (GST 5%)</span>
          <div className="text-2xl font-black text-amber-400 font-mono">₹{fin.tax_collected.toLocaleString()}</div>
          <p className="text-xs text-gray-500">CGST + SGST collected</p>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Packaging & Delivery</span>
          <div className="text-2xl font-black text-blue-400 font-mono">
            ₹{(fin.packaging_fees + fin.delivery_fees).toLocaleString()}
          </div>
          <p className="text-xs text-gray-500">Recovered operational fees</p>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Net Total Revenue</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">₹{fin.final_total.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Final recognized income</p>
        </div>
      </div>

      {/* Row: Payment Mode Breakdown & Printable Daily Register */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Payment Method Tender Breakdown</h3>
          </div>

          <div className="space-y-3 pt-2">
            {report?.payment_methods.map((p: any) => (
              <div key={p.payment_method} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-950 border border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-300 font-mono uppercase text-xs">
                    {p.payment_method.slice(0, 3)}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase">{p.payment_method.replace('_', ' ')}</h4>
                    <span className="text-[11px] text-gray-400">{p.count} transactions</span>
                  </div>
                </div>
                <div className="font-mono font-bold text-sm text-amber-400">
                  ₹{Number(p.total).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Printable Z-Report Container */}
        <div className="p-6 rounded-2xl bg-white text-black font-mono text-xs space-y-4 shadow-2xl">
          <div className="text-center pb-3 border-b-2 border-black">
            <h3 className="text-base font-black uppercase">PEPITO CLOUD KITCHEN HUB</h3>
            <p className="text-[10px]">DAILY REGISTER CLOSING (Z-REPORT)</p>
            <p className="text-[10px]">TIMESTAMP: {new Date().toLocaleString()}</p>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>GROSS ITEM SALES:</span>
              <span className="font-bold">₹{fin.gross_sales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>DISCOUNTS GRANTED:</span>
              <span>-₹{fin.discounts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>NET FOOD SALES:</span>
              <span className="font-bold">₹{fin.net_sales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST TAX (5%):</span>
              <span>₹{fin.tax_collected.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>PACKAGING SURCHARGE:</span>
              <span>₹{fin.packaging_fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>DELIVERY CHARGES:</span>
              <span>₹{fin.delivery_fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-black text-sm font-black">
              <span>TOTAL REVENUE:</span>
              <span>₹{fin.final_total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-600">
            REGISTER VERIFIED BY MANAGER • SHIFT CLOSED
          </div>
        </div>
      </div>
    </div>
  );
};

