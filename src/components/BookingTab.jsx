import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Calendar,
  Car,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

const TIME_SLOTS = ['09:30 AM', '11:00 AM', '01:30 PM', '03:30 PM', '05:00 PM'];

export default function BookingTab({ preselectedVehicle, preselectedService, onBookingSuccess }) {
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehicle?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedService?.id || '');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vRes, sRes] = await Promise.all([
          api.get('/vehicles/'),
          api.get('/services/'),
        ]);
        const vList = vRes.data.results || vRes.data || [];
        const sList = sRes.data.results || sRes.data || [];
        setVehicles(vList);
        setServices(sList);
        if (!selectedVehicleId && vList.length > 0) setSelectedVehicleId(vList[0].id);
        if (!selectedServiceId && sList.length > 0) setSelectedServiceId(sList[0].id);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch garage options.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeVehicle = vehicles.find((v) => v.id === parseInt(selectedVehicleId));
  const activeService = services.find((s) => s.id === parseInt(selectedServiceId));

  const basePrice = activeService ? parseFloat(activeService.base_price) : 0;
  const estimatedTax = basePrice * 0.18;
  const estimatedTotal = basePrice + estimatedTax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedServiceId) {
      setError('Please select both a vehicle and a service package.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // combine date + slot
      const [hours, minutesPart] = selectedSlot.split(':');
      const minutes = minutesPart.slice(0, 2);
      const isPM = selectedSlot.includes('PM');
      let h = parseInt(hours);
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;

      const scheduledDateObj = new Date(bookingDate);
      scheduledDateObj.setHours(h, parseInt(minutes), 0, 0);

      const payload = {
        vehicle: parseInt(selectedVehicleId),
        service: parseInt(selectedServiceId),
        scheduled_at: scheduledDateObj.toISOString(),
        notes: notes || undefined,
      };

      const res = await api.post('/appointments/', payload);
      setSuccessData(res.data);
      if (onBookingSuccess) onBookingSuccess(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to schedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-xl mx-auto glass-panel rounded-3xl border border-emerald-500/40 p-8 sm:p-10 text-center shadow-2xl my-8 animate-fade-in relative overflow-hidden">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight">
          Appointment Confirmed!
        </h2>
        <p className="text-slate-300 text-sm mt-2">
          Your workshop booking has been officially logged and a live <strong>Job Card</strong> has been created.
        </p>

        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 my-6 text-left text-xs space-y-2.5 text-slate-300">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">Booking Reference:</span>
            <span className="font-mono font-bold text-white">#APPT-{successData.id}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">Vehicle:</span>
            <span className="font-semibold text-white">
              {activeVehicle?.make} {activeVehicle?.model} ({activeVehicle?.reg_number})
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">Scheduled Time:</span>
            <span className="font-medium text-blue-400">
              {new Date(successData.scheduled_at).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Workshop Stage:</span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider">
              {successData.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => { setSuccessData(null); }}
            className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs uppercase tracking-wider border border-white/10 transition cursor-pointer"
          >
            Book Another Vehicle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
        <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Calendar className="w-6 h-6" />
          </div>
          Schedule Workshop Appointment
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Select vehicle, choose customized service package, and book an authorized maintenance bay
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-500 font-mono text-sm">
          Loading booking configuration...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center">
          <Car className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No vehicles found in your garage</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            You need to register at least one vehicle before booking a service bay.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main selection columns (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Select Vehicle */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-lg">
              <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-widest block mb-1">
                Step 01
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-blue-400" /> Select Registered Vehicle
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {vehicles.map((v) => {
                  const isSelected = parseInt(selectedVehicleId) === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-4 rounded-2xl border transition duration-200 cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                      )}
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">
                        {v.make}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{v.model}</h4>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="license-plate text-[10px] px-2 py-0.5">{v.reg_number}</span>
                        <span className="text-[11px] text-slate-400 font-medium capitalize">
                          {v.fuel_type} • {v.year}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Service Package */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-lg">
              <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-widest block mb-1">
                Step 02
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-purple-400" /> Choose Service Package
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {services.map((s) => {
                  const isSelected = parseInt(selectedServiceId) === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`p-4 rounded-2xl border transition duration-200 cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-purple-600/15 border-purple-500 shadow-lg shadow-purple-500/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                      )}
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-white">{s.name}</h4>
                        <span className="text-xs font-mono font-bold text-purple-300 ml-2">
                          ₹{parseFloat(s.base_price).toFixed(0)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Date & Preferred Slot */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-lg">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-1">
                Step 03
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" /> Date & Time Slot
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Appointment Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Available Bay Slots
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold font-mono transition cursor-pointer border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                              : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Notes for Mechanic (Optional)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Specific symptoms (e.g. vibrations over 60 km/h, brake squeal)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Summary & Checkout Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass-panel p-6 sm:p-7 rounded-3xl border border-white/15 shadow-2xl space-y-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider pb-3 border-b border-white/10">
                Booking Summary
              </h3>

              <div className="space-y-4 text-xs">
                {activeVehicle ? (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Vehicle</span>
                    <p className="font-bold text-white text-sm">
                      {activeVehicle.make} {activeVehicle.model}
                    </p>
                    <span className="license-plate text-[10px] px-2 py-0.5">{activeVehicle.reg_number}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl text-slate-500 italic">No vehicle chosen</div>
                )}

                {activeService ? (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Service Package</span>
                    <p className="font-bold text-white text-sm">{activeService.name}</p>
                    <span className="text-slate-400 font-mono">₹{basePrice.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl text-slate-500 italic">No package chosen</div>
                )}

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Scheduled Window</span>
                  <p className="font-bold text-white text-sm">{bookingDate}</p>
                  <span className="text-emerald-400 font-mono font-semibold">{selectedSlot}</span>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Labor / Service:</span>
                    <span className="font-mono text-white">₹{basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% Estimated):</span>
                    <span className="font-mono text-white">₹{estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                    <span>Est. Total Due:</span>
                    <span className="font-mono text-blue-400">₹{estimatedTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/30 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Allocating Bay...' : 'Confirm Bay Booking'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                🛡️ Backed by AutoCare Pro 100% Genuine Spares & Master Certified Mechanics.
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
