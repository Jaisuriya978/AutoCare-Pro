import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import VehiclesTab from './components/VehiclesTab';
import ServicesTab from './components/ServicesTab';
import BookingTab from './components/BookingTab';
import JobCardsTab from './components/JobCardsTab';
import InvoicesTab from './components/InvoicesTab';
import AuthPage from './pages/AuthPage';
import { LayoutDashboard, Car, Calendar, ClipboardList, FileText, Tag, Sparkles } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [preselectedVehicle, setPreselectedVehicle] = useState(null);
  const [preselectedService, setPreselectedService] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] text-slate-400 font-mono text-sm gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Initializing AutoCare Pro Engine...</span>
      </div>
    );
  }

  const handleSelectVehicleForBooking = (vehicle) => {
    setPreselectedVehicle(vehicle);
    setActiveTab('booking');
  };

  const handleSelectServiceForBooking = (service) => {
    setPreselectedService(service);
    setActiveTab('booking');
  };

  const handleBookingSuccess = () => {
    setActiveTab('jobs');
  };

  const handleNavigateToInvoices = () => {
    setActiveTab('invoices');
  };

  // Dynamic Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: user?.role === 'admin' ? 'Fleet Registry' : 'My Garage', icon: Car, authRequired: true },
    ...(user?.role === 'customer'
      ? [{ id: 'booking', label: 'Schedule Service', icon: Calendar, authRequired: true }]
      : []),
    { id: 'jobs', label: user?.role === 'customer' ? 'Live Repairs' : 'Workshop Jobs', icon: ClipboardList, authRequired: true },
    { id: 'invoices', label: 'Tax Invoices', icon: FileText, authRequired: true },
    { id: 'services', label: 'Service Rates', icon: Tag, authRequired: false },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Sleek Floating Navigation Bar */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-2 py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.authRequired && !user) {
                    setActiveTab('auth');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-lg shadow-blue-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'auth' && <AuthPage onSuccess={() => setActiveTab('dashboard')} />}

        {activeTab === 'dashboard' && (
          user ? (
            <Dashboard setActiveTab={setActiveTab} />
          ) : (
            <div className="space-y-8">
              <Dashboard setActiveTab={setActiveTab} />
              <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-blue-500/30 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-xl mx-auto">
                  <span className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6" />
                  </span>
                  <h3 className="text-2xl font-black text-white">Access Full Workshop Workspace</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
                    Sign in to register your vehicles, track repair stages with live milestone telemetry, or manage workshop job cards as technician.
                  </p>
                  <button
                    onClick={() => setActiveTab('auth')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Sign In / Register Customer
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'vehicles' && (
          user ? (
            <VehiclesTab onSelectVehicleForBooking={handleSelectVehicleForBooking} />
          ) : (
            <AuthPage onSuccess={() => setActiveTab('vehicles')} />
          )
        )}

        {activeTab === 'booking' && (
          user ? (
            <BookingTab
              preselectedVehicle={preselectedVehicle}
              preselectedService={preselectedService}
              onBookingSuccess={handleBookingSuccess}
            />
          ) : (
            <AuthPage onSuccess={() => setActiveTab('booking')} />
          )
        )}

        {activeTab === 'jobs' && (
          user ? (
            <JobCardsTab onNavigateToInvoices={handleNavigateToInvoices} />
          ) : (
            <AuthPage onSuccess={() => setActiveTab('jobs')} />
          )
        )}

        {activeTab === 'invoices' && (
          user ? (
            <InvoicesTab />
          ) : (
            <AuthPage onSuccess={() => setActiveTab('invoices')} />
          )
        )}

        {activeTab === 'services' && (
          <ServicesTab onSelectServiceForBooking={handleSelectServiceForBooking} />
        )}
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-white/5 py-8 mt-16 glass-panel-light text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-400">AutoCare Pro</span>
            <span>• Next-Gen Fleet & Workshop Engineering</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>Django 5.2 REST Framework</span>
            <span>React 19 + Tailwind 4</span>
            <span>OpenAPI 3.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
