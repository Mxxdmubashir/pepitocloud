import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { Order } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const channelLabel = {
    direct_pos: 'DIRECT POS BILLING',
    takeaway: 'TAKEAWAY COUNTER',
    swiggy: 'SWIGGY CLOUD DELIVERY',
    zomato: 'ZOMATO ONLINE ORDER',
    ubereats: 'UBER EATS DELIVERY'
  }[order.channel] || order.channel.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-gray-100">
        {/* Modal Controls (Not printed) */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">Order Receipt & Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 80mm Thermal Receipt Content */}
        <div id="thermal-receipt-print" className="mt-4 p-4 bg-white text-black rounded-lg shadow-inner font-mono text-xs leading-relaxed select-text">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-gray-400">
            <h2 className="text-base font-extrabold uppercase tracking-wider">{order.brand_name || 'PEPITO CLOUD KITCHEN'}</h2>
            <p className="text-[10px] text-gray-600">Central Kitchen Hub 01</p>
            <p className="text-[10px] text-gray-600">100ft Road, Indiranagar, Bengaluru</p>
            <p className="text-[10px] text-gray-600">GSTIN: 29AABCP1029K1Z5 | Ph: +91 80 4455 6677</p>
          </div>

          {/* Meta Info */}
          <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px] space-y-0.5">
            <div className="flex justify-between font-bold">
              <span>ORDER: {order.order_number}</span>
              <span className="uppercase">{channelLabel}</span>
            </div>
            {order.channel_order_id && (
              <div className="text-[10px] text-gray-700">AGGREGATOR REF: {order.channel_order_id}</div>
            )}
            <div>DATE: {new Date(order.created_at).toLocaleString()}</div>
            <div>CUSTOMER: {order.customer_name} ({order.customer_phone})</div>
            {order.delivery_address && (
              <div className="text-[10px] text-gray-700 truncate">ADDR: {order.delivery_address}</div>
            )}
            <div>PAYMENT: {order.payment_method.toUpperCase()} ({order.payment_status.toUpperCase()})</div>
          </div>

          {/* Items Table */}
          <div className="py-2 border-b border-dashed border-gray-400">
            <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-gray-300">
              <span className="w-3/5">ITEM</span>
              <span className="w-1/5 text-center">QTY</span>
              <span className="w-1/5 text-right">AMT (₹)</span>
            </div>
            <div className="pt-1.5 space-y-1.5">
              {order.items?.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[11px]">
                    <span className="w-3/5 font-semibold leading-tight">{item.item_name}</span>
                    <span className="w-1/5 text-center">x{item.quantity}</span>
                    <span className="w-1/5 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-[9px] text-gray-600 pl-2">
                      {item.modifiers.map((m, mIdx) => (
                        <div key={mIdx}>+ {m.name} {m.price > 0 && `(₹${m.price})`}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-₹{order.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span>₹{order.tax_amount.toFixed(2)}</span>
            </div>
            {order.packaging_fee > 0 && (
              <div className="flex justify-between">
                <span>Packaging Fee:</span>
                <span>₹{order.packaging_fee.toFixed(2)}</span>
              </div>
            )}
            {order.delivery_fee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>₹{order.delivery_fee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-gray-300 text-sm font-extrabold">
              <span>GRAND TOTAL:</span>
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Special Instructions & Footer */}
          {order.special_instructions && (
            <div className="py-1.5 border-b border-dashed border-gray-400 text-[10px] italic">
              <strong>KITCHEN NOTE:</strong> {order.special_instructions}
            </div>
          )}

          <div className="text-center pt-3 text-[10px] text-gray-600 space-y-1">
            <p className="font-semibold">*** THANK YOU FOR ORDERING ***</p>
            <p>Freshly prepared in our cloud kitchen</p>
            <p className="tracking-widest text-[8px]">||||| | |||| |||||| || | |||||</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print 80mm Receipt
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl transition-all border border-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

