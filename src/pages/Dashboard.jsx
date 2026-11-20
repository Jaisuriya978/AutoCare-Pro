import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Calendar,
  ClipboardList,
  FileText,
  Wrench,
  Shield,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  Gauge,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vehicles: 0,
    jobs: 0,
    invoices: 0,
    services: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [vRes, jRes, iRes, sRes] = await Promise.allSettled([
          api.get('/vehicles/'),
          api.get('/jobs/'),
          api.get('/invoices/'),
          api.get('/services/'),
        ]);

        setStats({
          vehicles: vRes.status === 'fulfilled' ? (vRes.value.data.count ?? vRes.value.data.length ?? 0) : 0,
          jobs: jRes.status === 'fulfilled' ? (jRes.value.data.count ?? jRes.value.data.length ?? 0) : 0,
          invoices: iRes.status === 'fulfilled' ? (iRes.value.data.count ?? iRes.value.data.length ?? 0) : 0,
          services: sRes.status === 'fulfilled' ? (sRes.value.data.count ?? sRes.value.data.length ?? 0) : 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const isCustomer = user?.role === 'customer';
  const isMechanic = user?.role === 'mechanic';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Executive Ambient Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-10 shadow-2xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-300 font-medium tracking-wide mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Intelligent Workshop Management • Live Fleet Synchronization</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {user?.first_name || user?.username || 'Executive'}
            </span>
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            {isCustomer
              ? 'Effortlessly oversee your vehicle maintenance schedule, monitor workshop repair stages with live milestone tracking, and review transparent digital invoices.'
              : 'Command center for garage floor diagnostics, job card allocations, live parts inventory logging, and GST tax billing.'}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 mt-8">
            {isCustomer ? (
              <>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book Service Appointment
                </button>
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs uppercase tracking-wider border border-white/15 backdrop-blur-md transition cursor-pointer flex items-center gap-2"
                >
                  <Car className="w-4 h-4" /> Register Vehicle
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" /> Open Active Job Cards
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs uppercase tracking-wider border border-white/15 backdrop-blur-md transition cursor-pointer flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Review Invoices
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('services')}
              className="px-4 py-3 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/5 transition cursor-pointer flex items-center gap-1.5"
            >
              Services Catalog <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Decorative Gauge Silhouette */}
        <div className="absolute right-6 -bottom-12 opacity-10 pointer-events-none hidden md:block">
          <Gauge className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Vehicles */}
        <div
          onClick={() => setActiveTab('vehicles')}
          className="group relative p-6 rounded-2xl glass-panel border border-white/10 hover:border-blue-500/50 hover:bg-slate-800/80 transition duration-300 cursor-pointer overflow-hidden shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isCustomer ? 'My Registered Vehicles' : 'Fleet Total'}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition duration-300">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-mono">
            {loading ? '-' : stats.vehicles}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Active Garage
            </span>
            <span className="text-slate-400 group-hover:text-blue-400 transition flex items-center gap-1 font-medium">
              Manage →
            </span>
          </div>
        </div>

        {/* Card 2: Active Services / Jobs */}
        <div
          onClick={() => setActiveTab('jobs')}
          className="group relative p-6 rounded-2xl glass-panel border border-white/10 hover:border-indigo-500/50 hover:bg-slate-800/80 transition duration-300 cursor-pointer overflow-hidden shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isCustomer ? 'Active Service Cards' : 'Workshop Floor Jobs'}
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition duration-300">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-mono">
            {loading ? '-' : stats.jobs}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs">
            <span className="text-indigo-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Milestone Track
            </span>
            <span className="text-slate-400 group-hover:text-indigo-400 transition flex items-center gap-1 font-medium">
              Inspect →
            </span>
          </div>
        </div>

        {/* Card 3: Invoices */}
        <div
          onClick={() => setActiveTab('invoices')}
          className="group relative p-6 rounded-2xl glass-panel border border-white/10 hover:border-emerald-500/50 hover:bg-slate-800/80 transition duration-300 cursor-pointer overflow-hidden shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isCustomer ? 'Billing Invoices' : 'Tax Invoices Issued'}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition duration-300">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-mono">
            {loading ? '-' : stats.invoices}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> GST 18% Compliant
            </span>
            <span className="text-slate-400 group-hover:text-emerald-400 transition flex items-center gap-1 font-medium">
              View Bills →
            </span>
          </div>
        </div>

        {/* Card 4: Services Packages */}
        <div
          onClick={() => setActiveTab('services')}
          className="group relative p-6 rounded-2xl glass-panel border border-white/10 hover:border-purple-500/50 hover:bg-slate-800/80 transition duration-300 cursor-pointer overflow-hidden shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Service Packages
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition duration-300">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-mono">
            {loading ? '-' : stats.services}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs">
            <span className="text-purple-400 font-semibold flex items-center gap-1">
              Standard Rates
            </span>
            <span className="text-slate-400 group-hover:text-purple-400 transition flex items-center gap-1 font-medium">
              Explore →
            </span>
          </div>
        </div>
      </div>

      {/* Workshop Lifecycle Stepper Bar */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-400" />
              Automated Workshop Lifecycle
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Seamless end-to-end status pipeline from appointment booking to final gate delivery
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xs font-mono font-bold mb-3">
              01
            </div>
            <h4 className="font-bold text-white text-sm">Vehicle Registration & Booking</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Customer registers vehicle specs & schedules a maintenance slot with preferred package.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center text-xs font-mono font-bold mb-3">
              02
            </div>
            <h4 className="font-bold text-white text-sm">Instant Job Card Creation</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Appointment triggers automated job card generation for mechanic bay assignment.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs font-mono font-bold mb-3">
              03
            </div>
            <h4 className="font-bold text-white text-sm">Parts & Labor Allocation</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Mechanics log parts used & labor charges with real-time subtotal tracking.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold mb-3">
              04
            </div>
            <h4 className="font-bold text-white text-sm">Tax Invoice & Delivery</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Automatic GST computation, printable digital tax invoice, and handover release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
