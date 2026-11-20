import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Tag, Plus, Clock, Sparkles, CheckCircle2, AlertCircle, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ServicesTab({ onSelectServiceForBooking }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    estimated_hours: '1.5',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/');
      setServices(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load service packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/services/', formData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        base_price: '',
        estimated_hours: '1.5',
        is_active: true,
      });
      setSuccess('Service package created and added to live catalog!');
      setTimeout(() => setSuccess(null), 4000);
      fetchServices();
    } catch (err) {
      console.error(err);
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to add service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Tag className="w-6 h-6" />
            </div>
            Workshop Service Packages & Rates
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standard OEM maintenance packages, diagnostic scans, and scheduled overhaul rates
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => { setShowModal(true); setError(null); }}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Service Package
          </button>
        )}
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-sm">
          Loading catalog packages...
        </div>
      ) : services.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center">
          <Wrench className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No services published yet</h3>
          <p className="text-xs text-slate-400 mt-1">Create service packages from the admin portal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => {
            const isFeatured = idx === 0;
            return (
              <div
                key={s.id}
                className={`rounded-3xl p-7 flex flex-col justify-between transition duration-300 relative overflow-hidden group ${
                  isFeatured
                    ? 'glass-panel border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/10'
                    : 'glass-panel border border-white/10 hover:border-white/20'
                }`}
              >
                {isFeatured && (
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    ★ Popular Choice
                  </span>
                )}

                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                    PKG #{s.id}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed min-h-[48px]">
                    {s.description || 'Comprehensive multi-point vehicle inspection and service.'}
                  </p>

                  <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Certified Multi-point Inspection</span>
                    </div>
                    {s.estimated_hours && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Estimated Bay Time: {s.estimated_hours} hrs</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-xs text-slate-400 font-medium">Standard Base Rate:</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ₹{parseFloat(s.base_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {onSelectServiceForBooking && (
                    <button
                      onClick={() => onSelectServiceForBooking(s)}
                      className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                        isFeatured
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                      }`}
                    >
                      <span>Choose Service</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl shadow-2xl max-w-lg w-full p-7 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-400" /> Create Service Package
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Define service specifications, base pricing, and bay duration
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage 2 Performance Tuning & Decarb"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed breakdown of maintenance checks, fluid replacements, and labor included..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Base Labor / Service (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2500.00"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Bay Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="2.0"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
