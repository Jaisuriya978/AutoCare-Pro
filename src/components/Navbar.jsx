import React from 'react';
import { Wrench, Car, LogOut, User as UserIcon, Shield, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-purple-500/20 text-purple-300 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Shield className="w-3 h-3 text-purple-400" /> Admin
          </span>
        );
      case 'mechanic':
        return (
          <span className="bg-amber-500/20 text-amber-300 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Wrench className="w-3 h-3 text-amber-400" /> Mechanic
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-300 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <Car className="w-3 h-3 text-blue-400" /> Customer
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          {/* Brand */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition duration-300">
                <Wrench className="w-5 h-5 text-white transform group-hover:rotate-45 transition duration-500" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition">
                  AutoCare<span className="text-blue-500">PRO</span>
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block tracking-wide">
                Next-Gen Garage & Fleet Management
              </span>
            </div>
          </div>

          {/* System status pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-400">API Live: 127.0.0.1:8000</span>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2.5 bg-slate-800/80 border border-white/10 px-3.5 py-1.5 rounded-xl shadow-inner">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                    {user.username.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-200 block leading-tight">
                      {user.first_name || user.username}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{user.email || user.username}</span>
                  </div>
                  <div className="ml-2 pl-2 border-l border-slate-700">
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 px-3 py-2 rounded-xl transition duration-200 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Exit</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setActiveTab('auth')}
                  className="relative group overflow-hidden rounded-xl p-[1px] cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl transition-all duration-300 group-hover:scale-105"></span>
                  <span className="relative block px-4 py-2 bg-slate-900 rounded-[11px] text-xs font-bold text-white group-hover:bg-opacity-80 transition">
                    Sign In / Launch Portal →
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
