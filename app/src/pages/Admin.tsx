import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { LayoutDashboard, List, DollarSign, Settings, Search, Download, ChevronLeft, ChevronRight, Filter, BarChart3, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { submissions, statusLabels, statusColors } from '@/data/submissions';
import { pricingData } from '@/data/pricing';
import type { Submission } from '@/data/submissions';

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'submissions', label: 'Submissions', icon: List },
  { key: 'pricing', label: 'Pricing', icon: DollarSign },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === 'amelio123ali@gmail.com') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Access Denied. Only amelio123ali@gmail.com is authorized.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 border border-neutral-200 rounded-2xl shadow-sm">
          <div className="text-center">
            <h2 className="text-h-sm text-neutral-950 font-bold mb-2">Admin Control Center</h2>
            <p className="text-b-xs text-neutral-500">Sign in to manage repair submissions and catalog pricing.</p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3.5 text-b-xs text-center font-medium">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-b-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-950 transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          {/* Sidebar */}
          <div className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-28 bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="text-h-sm text-neutral-950">Admin Panel</h2>
                <p className="text-b-xs text-neutral-500">iRepairMe Control Center</p>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-b-sm transition-colors ${
                        activeTab === tab.key ? 'bg-neutral-100 text-neutral-950 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'submissions' && <SubmissionsTab />}
            {activeTab === 'pricing' && <PricingTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab() {
  const total = submissions.length;
  const newToday = submissions.filter((s) => s.status === 'new').length;
  const repairing = submissions.filter((s) => s.status === 'repairing').length;
  const ready = submissions.filter((s) => s.status === 'ready').length;
  const delivered = submissions.filter((s) => s.status === 'delivered').length;
  const cancelled = submissions.filter((s) => s.status === 'cancelled').length;

  const stats = [
    { label: 'Total Submissions', value: total, icon: BarChart3, color: 'bg-blue-50 text-blue-600' },
    { label: 'New Today', value: newToday, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'In Progress', value: repairing, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Ready', value: ready, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div>
      <h2 className="text-h-lg text-neutral-950 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className={`w-9 h-9 ${s.color.split(' ')[0]} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${s.color.split(' ')[1]}`} />
              </div>
              <p className="text-2xl font-bold text-neutral-950 mb-0.5">{s.value}</p>
              <p className="text-b-xs text-neutral-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Submissions */}
      <h3 className="text-h-sm text-neutral-950 mb-4">Recent Submissions</h3>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">ID</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Customer</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Device</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {submissions.slice(0, 5).map((s) => (
              <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="py-3 px-4 text-b-xs font-mono text-neutral-600">{s.id}</td>
                <td className="py-3 px-4 text-b-sm text-neutral-950">{s.customer.name}</td>
                <td className="py-3 px-4 text-b-xs text-neutral-500">{s.device.model}</td>
                <td className="py-3 px-4">
                  <span className={`text-b-xs px-2 py-0.5 rounded-full ${statusColors[s.status]}`}>
                    {statusLabels[s.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Submissions Tab ─── */
function SubmissionsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch = !search || s.customer.name.toLowerCase().includes(search.toLowerCase()) || s.customer.phone.includes(search) || s.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h-lg text-neutral-950">Submissions</h2>
        <button className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg text-b-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or ID..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="all">All Statuses</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">ID</th>
                <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Customer</th>
                <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Device</th>
                <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Issue</th>
                <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Price</th>
                <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedSubmission(s)}
                  className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer"
                >
                  <td className="py-3 px-4 text-b-xs font-mono text-neutral-600">{s.id}</td>
                  <td className="py-3 px-4">
                    <p className="text-b-sm text-neutral-950">{s.customer.name}</p>
                    <p className="text-b-xs text-neutral-500">{s.customer.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-b-sm text-neutral-700">{s.device.brand} {s.device.model}</td>
                  <td className="py-3 px-4 text-b-xs text-neutral-500 max-w-[150px] truncate">{s.device.issue}</td>
                  <td className="py-3 px-4 text-b-sm text-neutral-950">{s.quotedPriceLabel || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-b-xs px-2 py-0.5 rounded-full ${statusColors[s.status]}`}>
                      {statusLabels[s.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedSubmission(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-h-sm text-neutral-950">Submission Detail</h3>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-neutral-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Order ID</p>
                <p className="text-b-sm font-mono text-neutral-950">{selectedSubmission.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Customer</p>
                  <p className="text-b-sm text-neutral-950">{selectedSubmission.customer.name}</p>
                  <p className="text-b-xs text-neutral-500">{selectedSubmission.customer.phone}</p>
                </div>
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Status</p>
                  <span className={`text-b-xs px-2 py-0.5 rounded-full ${statusColors[selectedSubmission.status]}`}>
                    {statusLabels[selectedSubmission.status]}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Device</p>
                <p className="text-b-sm text-neutral-950">{selectedSubmission.device.brand} {selectedSubmission.device.model}</p>
                <p className="text-b-xs text-neutral-500">{selectedSubmission.device.issue}</p>
              </div>
              {selectedSubmission.quotedPriceLabel && (
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Quoted Price</p>
                  <p className="text-b-sm font-semibold text-neutral-950">{selectedSubmission.quotedPriceLabel}</p>
                </div>
              )}
              {selectedSubmission.internalNotes && (
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <p className="text-b-xs text-neutral-500 mb-1">Internal Notes</p>
                  <p className="text-b-sm text-neutral-700">{selectedSubmission.internalNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Pricing Tab ─── */
function PricingTab() {
  const [search, setSearch] = useState('');
  const [localPrices, setLocalPrices] = useState([...pricingData]);

  const handlePriceChange = (id: string, field: 'price' | 'estimatedTime' | 'inStock', value: any) => {
    // 1. Update in-memory array item so other pages see it
    const item = pricingData.find((p) => p.id === id);
    if (item) {
      if (field === 'price') {
        item[field] = Number(value);
      } else {
        item[field] = value;
      }
    }
    
    // 2. Update local state to trigger re-render
    setLocalPrices([...pricingData]);
  };

  const filtered = useMemo(() => {
    return localPrices.filter((p) => {
      const matchesSearch = !search || 
        p.deviceModel.toLowerCase().includes(search.toLowerCase()) ||
        p.service.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [search, localPrices]);

  return (
    <div>
      <h2 className="text-h-lg text-neutral-950 mb-6">Live Price Manager</h2>
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by device or service..."
          className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
        />
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50">
                <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Device</th>
                <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Service</th>
                <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider w-40">Price (₹)</th>
                <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider w-32">Time</th>
                <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider w-32">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-4 text-b-sm text-neutral-950 font-medium">{p.deviceModel}</td>
                  <td className="py-3 px-4 text-b-sm text-neutral-700">{p.service}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => handlePriceChange(p.id, 'price', e.target.value)}
                      className="w-32 px-2 py-1.5 border border-neutral-200 rounded-lg text-b-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={p.estimatedTime}
                      onChange={(e) => handlePriceChange(p.id, 'estimatedTime', e.target.value)}
                      className="w-24 px-2 py-1.5 border border-neutral-200 rounded-lg text-b-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={p.inStock ? 'true' : 'false'}
                      onChange={(e) => handlePriceChange(p.id, 'inStock', e.target.value === 'true')}
                      className="px-2 py-1.5 border border-neutral-200 rounded-lg text-b-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Settings Tab ─── */
function SettingsTab() {
  return (
    <div>
      <h2 className="text-h-lg text-neutral-950 mb-6">Settings</h2>
      <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-lg space-y-4">
        <div>
          <label className="block text-b-xs font-medium text-neutral-700 mb-1">Business Name</label>
          <input type="text" defaultValue="iRepairMe" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
        <div>
          <label className="block text-b-xs font-medium text-neutral-700 mb-1">WhatsApp Number</label>
          <input type="text" defaultValue="+91 98765 43210" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
        <div>
          <label className="block text-b-xs font-medium text-neutral-700 mb-1">Store Address</label>
          <textarea defaultValue="42, MG Road, Bangalore - 560001" rows={2} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
        </div>
        <div>
          <label className="block text-b-xs font-medium text-neutral-700 mb-1">Working Hours</label>
          <input type="text" defaultValue="Mon-Sat: 10AM-8PM, Sun: 11AM-5PM" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
        <button className="px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
