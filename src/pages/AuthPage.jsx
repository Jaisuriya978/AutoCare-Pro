import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, Phone, Wrench, Shield, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function AuthPage({ onSuccess }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login(formData.username, formData.password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join('\n');
        setError(messages || 'Authentication failed. Please verify credentials.');
      } else {
        setError('Network error or invalid login credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(`Quick sign-in failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 glass-panel rounded-3xl border border-white/15 shadow-2xl overflow-hidden relative animate-fade-in">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner */}
      <div className="p-8 text-center border-b border-white/10 relative z-10">
        <div className="w-14 h-14 mx-auto mb-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Wrench className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">AutoCare Pro Portal</h2>
        <p className="text-xs text-slate-400 mt-1">
          {isRegister ? 'Register your account to access garage services' : 'Sign in to access your authorized workspace'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-white/10 bg-slate-900/60 p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => { setIsRegister(false); setError(null); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            !isRegister
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsRegister(true); setError(null); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            isRegister
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Register Customer
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-8 space-y-4 relative z-10">
        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="whitespace-pre-line leading-relaxed">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Username
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. admin or cust"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {isRegister && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Rahul"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-mono"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{loading ? 'Authenticating...' : isRegister ? 'Create Customer Account' : 'Sign In to Portal'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* 1-Click Demo Login Shortcuts */}
        <div className="pt-5 border-t border-white/10 mt-5 text-center">
          <p className="text-[11px] text-slate-400 font-semibold mb-2.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            1-Click Instant Demo Access:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => quickLogin('admin', 'admin123')}
              className="text-[11px] font-bold bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => quickLogin('mech', 'Str0ng-pass!')}
              className="text-[11px] font-bold bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              🔧 Mechanic
            </button>
            <button
              type="button"
              onClick={() => quickLogin('cust', 'Str0ng-pass!')}
              className="text-[11px] font-bold bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              🚗 Customer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
