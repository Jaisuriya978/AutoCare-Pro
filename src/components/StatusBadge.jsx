import React from 'react';
import { CheckCircle2, Clock, Wrench, AlertCircle, Sparkles, Check, Car } from 'lucide-react';

export const JobStatusBadge = ({ status }) => {
  const configs = {
    booked: {
      label: 'Booked',
      bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      icon: Clock,
    },
    inspection: {
      label: 'Diagnostics & Inspection',
      bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      dot: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]',
      icon: Sparkles,
    },
    in_progress: {
      label: 'Under Active Repair',
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400 animate-ping',
      icon: Wrench,
    },
    waiting_parts: {
      label: 'Awaiting Spare Parts',
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400',
      icon: AlertCircle,
    },
    completed: {
      label: 'Service Completed',
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      icon: CheckCircle2,
    },
    delivered: {
      label: 'Delivered to Owner',
      bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
      dot: 'bg-slate-400',
      icon: Car,
    },
  };

  const cfg = configs[status] || {
    label: status,
    bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
    icon: Clock,
  };

  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition ${cfg.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      <Icon className="w-3.5 h-3.5 opacity-90" />
      <span>{cfg.label}</span>
    </span>
  );
};

export const InvoiceStatusBadge = ({ status }) => {
  const isPaid = status === 'paid';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider backdrop-blur-md ${
        isPaid
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPaid ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
      ></span>
      {isPaid ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      <span>{status}</span>
    </span>
  );
};
