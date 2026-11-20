import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Car,
  Plus,
  Trash2,
  Fuel,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Search,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VEHICLE_PRESETS = [
  { make: 'Tata', model: 'Nexon EV', year: 2024, reg: 'MH02EV8899', fuel: 'electric' },
  { make: 'Hyundai', model: 'Creta SX', year: 2023, reg: 'DL01AB4567', fuel: 'petrol' },
  { make: 'Toyota', model: 'Innova Crysta', year: 2022, reg: 'KA03MN9900', fuel: 'diesel' },
  { make: 'Honda', model: 'City Hybrid', year: 2024, reg: 'TN09XY1234', fuel: 'hybrid' },
];

export default function VehiclesTab({ onSelectVehicleForBooking }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    reg_number: '',
    fuel_type: 'petrol',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles/');
      setVehicles(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load fleet vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/vehicles/', formData);
      setShowModal(false);
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        reg_number: '',
        fuel_type: 'petrol',
      });
      setSuccess('Vehicle successfully registered to your garage!');
      setTimeout(() => setSuccess(null), 4000);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      make: preset.make,
      model: preset.model,
      year: preset.year,
      reg_number: preset.reg,
      fuel_type: preset.fuel,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle from your garage?')) return;
    try {
      await api.delete(`/vehicles/${id}/`);
      fetchVehicles();
    } catch (err) {
      alert('Could not delete vehicle. It may have existing appointments or open job cards.');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.reg_number.toLowerCase().includes(q)
    );
  });

  const getFuelBadge = (fuel) => {
    switch (fuel) {
      case 'electric':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> Electric
          </span>
        );
      case 'diesel':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
            <Fuel className="w-3 h-3" /> Diesel
          </span>
        );
      case 'hybrid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Hybrid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            <Fuel className="w-3 h-3" /> Petrol
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Car className="w-6 h-6" />
            </div>
            {user?.role === 'admin' ? 'Fleet Registry • All Vehicles' : 'My Personal Garage'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {user?.role === 'admin'
              ? 'Comprehensive registry of customer vehicles managed across all workshop service bays'
              : 'Add your cars and bikes to track service schedules, maintenance history, and digital invoices'}
          </p>
        </div>

        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Register Vehicle
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by make, model, or license plate..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
      </div>

      {/* Vehicle Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-sm">
          Fetching garage registry...
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center">
          <Car className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No vehicles found in garage</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            {searchQuery ? `No vehicles matched "${searchQuery}"` : 'Register your first vehicle to schedule services.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Vehicle Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl hover:border-blue-500/40 hover:bg-slate-800/60 transition duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">
                      {v.make}
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5 tracking-tight">
                      {v.model}
                    </h3>
                  </div>
                  {getFuelBadge(v.fuel_type)}
                </div>

                {/* Embossed License Plate */}
                <div className="mt-4 pt-3 flex items-center justify-between">
                  <div className="license-plate px-2.5 py-1 text-xs">
                    {v.reg_number}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{v.year}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                {onSelectVehicleForBooking && (
                  <button
                    onClick={() => onSelectVehicleForBooking(v)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
                  >
                    <span>Schedule Maintenance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition ml-auto cursor-pointer"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl shadow-2xl max-w-lg w-full p-7 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-400" /> Register Vehicle
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Add vehicle registration details to link with job cards
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Demo Presets */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl mb-5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                ⚡ 1-Click Test Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {VEHICLE_PRESETS.map((p) => (
                  <button
                    key={p.model}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[11px] font-semibold bg-slate-800 hover:bg-blue-600/30 text-slate-200 hover:text-blue-300 border border-white/10 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    {p.make} {p.model} ({p.fuel})
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Make / Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maruti, Honda"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swift, City"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2020 })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Powertrain / Fuel</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="petrol">Petrol (Gasoline)</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric Vehicle (EV)</option>
                    <option value="hybrid">Strong Hybrid</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">License Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH12AB1234"
                  value={formData.reg_number}
                  onChange={(e) => setFormData({ ...formData, reg_number: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-blue-500"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/30 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Save to Garage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
