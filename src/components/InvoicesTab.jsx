import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Building2,
  Check,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { InvoiceStatusBadge } from './StatusBadge';

export default function InvoicesTab() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const isStaff = user?.role === 'mechanic' || user?.role === 'admin';

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices/');
      const list = res.data.results || res.data || [];
      setInvoices(list);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkPaid = async (invoiceId) => {
    setPayingId(invoiceId);
    setError(null);
    try {
      await api.post(`/invoices/${invoiceId}/mark_paid/`);
      setMessage(`Invoice #${invoiceId} marked as SETTLED & PAID!`);
      setTimeout(() => setMessage(null), 3500);
      fetchInvoices();
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: 'paid' });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to mark invoice as paid.');
    } finally {
      setPayingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-6 h-6" />
            </div>
            Digital Tax Invoices & Payments
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official GST-compliant service invoices, parts itemization, and instant settlement records
          </p>
        </div>

        <button
          onClick={fetchInvoices}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Invoices
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Invoices List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-mono text-sm">
          Loading billing records...
        </div>
      ) : invoices.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center">
          <FileText className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No invoices generated yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Invoices are issued automatically once a mechanic completes service diagnosis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl hover:border-emerald-500/40 hover:bg-slate-800/60 transition duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      INVOICE #INV-{inv.id}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">Job #{inv.job}</h3>
                  </div>
                  <InvoiceStatusBadge status={inv.status} />
                </div>

                <div className="space-y-2 py-3.5 border-y border-white/5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="font-mono text-white">₹{parseFloat(inv.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST (18%):</span>
                    <span className="font-mono text-white">₹{parseFloat(inv.tax).toFixed(2)}</span>
                  </div>
                  {parseFloat(inv.discount) > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount:</span>
                      <span className="font-mono">-₹{parseFloat(inv.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-white text-sm pt-2 border-t border-white/5">
                    <span>Grand Total:</span>
                    <span className="font-mono text-lg text-emerald-400">₹{parseFloat(inv.total).toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono mt-3">
                  Issued: {new Date(inv.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(inv)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition cursor-pointer"
                >
                  View Bill Sheet
                </button>
                {isStaff && inv.status === 'unpaid' && (
                  <button
                    type="button"
                    disabled={payingId === inv.id}
                    onClick={() => handleMarkPaid(inv.id)}
                    className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Mark Paid</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formal Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-3xl shadow-2xl max-w-lg w-full p-8 text-white relative">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-5 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                  AP
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">AutoCare Pro Tax Invoice</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    GSTIN: 27AABCA1234F1Z5 • Reference #INV-{selectedInvoice.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Bill Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950/50 p-3.5 rounded-2xl border border-white/10 text-xs">
                <span className="text-slate-400 font-semibold">Payment Status:</span>
                <InvoiceStatusBadge status={selectedInvoice.status} />
              </div>

              <div className="border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs bg-slate-950/40">
                <div className="flex justify-between text-slate-300">
                  <span>Parts & Labor Subtotal:</span>
                  <span className="font-mono text-white">₹{parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Goods & Services Tax (GST 18%):</span>
                  <span className="font-mono text-white">₹{parseFloat(selectedInvoice.tax).toFixed(2)}</span>
                </div>
                {parseFloat(selectedInvoice.discount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Deducted:</span>
                    <span className="font-mono">-₹{parseFloat(selectedInvoice.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2.5 font-black text-base text-white">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-emerald-400">₹{parseFloat(selectedInvoice.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>All replacements backed by 6-month / 10,000 km workshop warranty.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-white/10"
              >
                <Printer className="w-4 h-4" /> Print Tax Receipt
              </button>
              {isStaff && selectedInvoice.status === 'unpaid' && (
                <button
                  type="button"
                  disabled={payingId === selectedInvoice.id}
                  onClick={() => handleMarkPaid(selectedInvoice.id)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CreditCard className="w-4 h-4" /> Settle Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
