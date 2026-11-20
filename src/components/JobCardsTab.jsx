import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  ClipboardList,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Package,
  RefreshCw,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JobStatusBadge } from './StatusBadge';

const STATUS_STEPS = [
  { key: 'booked', label: 'Booked', pct: 15 },
  { key: 'inspection', label: 'Diagnostics', pct: 35 },
  { key: 'in_progress', label: 'Repairing', pct: 60 },
  { key: 'waiting_parts', label: 'Parts Transit', pct: 75 },
  { key: 'completed', label: 'Completed', pct: 90 },
  { key: 'delivered', label: 'Released', pct: 100 },
];

export default function JobCardsTab({ onNavigateToInvoices }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Item form modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({
    kind: 'part',
    description: '',
    quantity: 1,
    unit_price: '',
  });

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const isStaff = user?.role === 'mechanic' || user?.role === 'admin';

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/');
      const list = res.data.results || res.data || [];
      setJobs(list);
      if (selectedJob) {
        const updated = list.find((j) => j.id === selectedJob.id);
        if (updated) setSelectedJob(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    setUpdatingStatus(true);
    setActionError(null);
    try {
      const res = await api.patch(`/jobs/${jobId}/set_status/`, { status: newStatus });
      setActionMessage(`Job #${jobId} status transitioned to "${newStatus.replace('_', ' ')}"!`);
      setTimeout(() => setActionMessage(null), 3000);
      setSelectedJob(res.data);
      fetchJobs();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.detail || 'Failed to update job status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setActionError(null);
    try {
      await api.post(`/jobs/${selectedJob.id}/items/`, {
        kind: itemForm.kind,
        description: itemForm.description,
        quantity: parseInt(itemForm.quantity) || 1,
        unit_price: parseFloat(itemForm.unit_price).toFixed(2),
      });
      setShowItemModal(false);
      setItemForm({ kind: 'part', description: '', quantity: 1, unit_price: '' });
      setActionMessage('Item logged to job card billable sheet!');
      setTimeout(() => setActionMessage(null), 3000);
      fetchJobs();
    } catch (err) {
      console.error(err);
      setActionError('Failed to add line item.');
    }
  };

  const handleGenerateInvoice = async (jobId) => {
    setGeneratingInvoice(true);
    setActionError(null);
    try {
      const res = await api.post(`/invoices/generate/${jobId}/`, {});
      setActionMessage(`Tax Invoice generated successfully! Total: ₹${res.data.total}`);
      setTimeout(() => setActionMessage(null), 4000);
      fetchJobs();
      if (onNavigateToInvoices) onNavigateToInvoices(res.data);
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.detail || 'Invoice already exists or could not be generated.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === 'all') return true;
    return j.status === statusFilter;
  });

  const getJobProgressPct = (status) => {
    const step = STATUS_STEPS.find((s) => s.key === status);
    return step ? step.pct : 20;
  };

  const calculateItemsTotal = (items) => {
    if (!items || !items.length) return 0;
    return items.reduce((acc, it) => acc + it.quantity * parseFloat(it.unit_price || 0), 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ClipboardList className="w-6 h-6" />
            </div>
            {isStaff ? 'Workshop Floor & Job Cards Console' : 'My Live Vehicle Service Cards'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isStaff
              ? 'Real-time diagnostic progress, part consumption logs, labor allocations, and automated invoicing'
              : 'Track the step-by-step progress of your vehicle as our mechanics work on it in the bay'}
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Status
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {['all', 'booked', 'inspection', 'in_progress', 'waiting_parts', 'completed', 'delivered'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 rounded-xl capitalize transition cursor-pointer whitespace-nowrap border ${
              statusFilter === st
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-mono text-sm">
          Loading workshop cards...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center">
          <ClipboardList className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No active job cards found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter !== 'all' ? `No jobs currently in "${statusFilter}"` : 'Book a service appointment to generate a job card.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => {
            const progress = getJobProgressPct(job.status);
            const itemsSum = calculateItemsTotal(job.items);
            const baseRate = parseFloat(job.appointment?.service?.base_price || 0);
            const runningTotal = baseRate + itemsSum;

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl hover:border-blue-500/40 hover:bg-slate-800/60 transition duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-white text-base">
                      #JOB-{job.id}
                    </span>
                    <JobStatusBadge status={job.status} />
                    <span className="text-xs font-mono text-slate-500">
                      Logged {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Vehicle:</span>
                      <span className="font-bold text-white">
                        {job.appointment?.vehicle?.make} {job.appointment?.vehicle?.model}
                      </span>
                      <span className="license-plate text-[10px] px-1.5 py-0.2">
                        {job.appointment?.vehicle?.reg_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Package:</span>
                      <span className="font-medium text-purple-300">
                        {job.appointment?.service?.name}
                      </span>
                    </div>

                    {job.mechanic && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Technician:</span>
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {job.mechanic.username}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1 pt-1 max-w-md">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Service Progress</span>
                      <span className="font-bold text-blue-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Right summary pill */}
                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                      Est. Tally
                    </span>
                    <span className="text-lg font-black text-white font-mono">
                      ₹{runningTotal.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {job.items?.length || 0} line item(s)
                    </span>
                  </div>

                  <button
                    type="button"
                    className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-600/20 border border-white/10 group-hover:border-blue-500/40 text-slate-400 group-hover:text-blue-300 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Card Detailed Inspection Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-white/15 rounded-3xl shadow-2xl max-w-2xl w-full p-7 text-white my-8">
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-white">Job Card #{selectedJob.id}</h3>
                  <JobStatusBadge status={selectedJob.status} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">
                    Vehicle: {selectedJob.appointment?.vehicle?.make} {selectedJob.appointment?.vehicle?.model}
                  </span>
                  <span className="license-plate text-[10px] px-2 py-0.5">
                    {selectedJob.appointment?.vehicle?.reg_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper */}
            <div className="py-4 border-b border-white/10">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                Live Workshop Lifecycle
              </span>
              <div className="flex items-center justify-between relative">
                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === selectedJob.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1 text-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isDone
                            ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                            : 'bg-slate-800 text-slate-500 border border-white/10'
                        } ${isCurrent ? 'ring-2 ring-blue-400' : ''}`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-[10px] mt-1 text-slate-400 font-medium max-w-[60px] truncate">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Staff status transition controller */}
            {isStaff && (
              <div className="my-5 p-4 bg-slate-800/80 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Transition Lifecycle Stage
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Advance this vehicle to the next workshop phase
                  </span>
                </div>
                <select
                  disabled={updatingStatus}
                  value={selectedJob.status}
                  onChange={(e) => handleStatusChange(selectedJob.id, e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="booked">Booked (Intake)</option>
                  <option value="inspection">Diagnostics & Inspection</option>
                  <option value="in_progress">Under Active Repair</option>
                  <option value="waiting_parts">Waiting for Spare Parts</option>
                  <option value="completed">Service Completed & Tested</option>
                  <option value="delivered">Delivered to Owner</option>
                </select>
              </div>
            )}

            {/* Parts & Labor Table */}
            <div className="mt-5">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  Billable Parts & Labor Entries
                </h4>
                {isStaff && (
                  <button
                    onClick={() => setShowItemModal(true)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Part / Labor
                  </button>
                )}
              </div>

              {selectedJob.items?.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-6 text-center bg-white/5 rounded-2xl border border-white/5">
                  No additional parts or replacement spares logged on this card yet.
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden text-xs bg-slate-950/40">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {selectedJob.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5">
                          <td className="py-2 px-3 capitalize font-bold text-slate-200">
                            {item.kind === 'part' ? '📦 Part' : '🔧 Labor'}
                          </td>
                          <td className="py-2 px-3 text-white font-medium">{item.description}</td>
                          <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-400">
                            ₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Cost Breakdown & Invoicing */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
              <div className="text-xs text-slate-400 space-y-0.5">
                <div>
                  Service Package Rate: <strong className="text-white font-mono">₹{selectedJob.appointment?.service?.base_price}</strong>
                </div>
                <div>
                  Parts & Labor Logged: <strong className="text-white font-mono">₹{calculateItemsTotal(selectedJob.items).toFixed(2)}</strong>
                </div>
              </div>

              {isStaff && (
                <button
                  type="button"
                  disabled={generatingInvoice}
                  onClick={() => handleGenerateInvoice(selectedJob.id)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {generatingInvoice ? 'Generating Invoice...' : 'Issue Formal Tax Invoice'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-white">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" /> Log Part or Labor
            </h3>
            <form onSubmit={handleAddItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Type</label>
                <select
                  value={itemForm.kind}
                  onChange={(e) => setItemForm({ ...itemForm, kind: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="part">Spare Part / Material</option>
                  <option value="labour">Custom Labor / Specialist Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bosch Spark Plugs Set, 1hr Sensor Calibration"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="450.00"
                    value={itemForm.unit_price}
                    onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
