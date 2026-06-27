import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { LayoutDashboard, List, ClipboardList, DollarSign, Settings, Search, Download, ChevronRight, BarChart3, Users, Clock, CheckCircle, XCircle, Plus, Trash2, Package, X } from 'lucide-react';
import api from '@/lib/api';
import { pricingData } from '@/data/pricing';
import { services as availableServices } from '@/data/services';

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'leads', label: 'Leads', icon: ClipboardList },
  { key: 'tickets', label: 'Repair Tickets', icon: List },
  { key: 'spare-parts', label: 'Spare Parts', icon: Package },
  { key: 'pricing', label: 'Pricing', icon: DollarSign },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  DIAGNOSING: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  WAITING_FOR_PARTS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('firebaseAdminToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email: email.trim(), password });
      const { token, user } = response.data;
      
      if (user.role === 'ADMIN') {
        sessionStorage.setItem('firebaseAdminToken', 'authenticated');
        
        // Retrieve and update Zustand storage structure to persist the admin JWT token
        const storageStr = localStorage.getItem('irepairme-storage');
        let state = {};
        if (storageStr) {
          try {
            const parsed = JSON.parse(storageStr);
            state = parsed.state || {};
          } catch (err) {}
        }
        
        localStorage.setItem('irepairme-storage', JSON.stringify({
          state: {
            ...state,
            isLoggedIn: true,
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            isAdmin: true,
            token: token
          },
          version: 0
        }));
        
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Access Denied. You do not have administrator privileges.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('firebaseAdminToken');
    localStorage.removeItem('irepairme-storage');
    setIsAuthenticated(false);
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
                <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg text-b-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800">
              Sign In
            </button>
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
                <button onClick={handleLogout} className="text-b-xs text-red-500 hover:underline">Log out</button>
              </div>
              {/* Dropdown navigation for mobile/tablet */}
              <div className="p-3 block lg:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white text-neutral-800"
                >
                  {tabs.map((tab) => (
                    <option key={tab.key} value={tab.key}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sidebar navigation for desktop */}
              <nav className="p-2 hidden lg:block">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-b-sm transition-colors ${activeTab === tab.key ? 'bg-neutral-100 text-neutral-950 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
                    >
                      <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'leads' && <LeadsTab />}
            {activeTab === 'tickets' && <RepairTicketsTab />}
            {activeTab === 'spare-parts' && <SparePartsTab />}
            {activeTab === 'pricing' && <PricingTab />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/repairs/admin");
        setSubmissions(response.data);
      } catch (e) {
        console.error("Fetch Stats Error:", e);
      }
    };
    fetchStats();
  }, []);

  const totalLeads = submissions.filter((s) => s.deviceType !== 'unknown' && s.status === 'PENDING').length;
  const activeTickets = submissions.filter((s) => s.deviceType !== 'unknown' && s.status !== 'PENDING').length;
  const sparePartsOrders = submissions.filter((s) => s.deviceType === 'unknown' && s.cart && s.cart.length > 0).length;
  const completedRepairs = submissions.filter((s) => s.deviceType !== 'unknown' && s.status === 'COMPLETED').length;
  const deliveredRepairs = submissions.filter((s) => s.deviceType !== 'unknown' && s.status === 'DELIVERED').length;

  const stats = [
    { label: 'Pending Leads', value: totalLeads, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Active Repairs', value: activeTickets, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Spare Parts Orders', value: sparePartsOrders, icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Completed Repairs', value: completedRepairs, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Delivered Repairs', value: deliveredRepairs, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
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
    </div>
  );
}

function RepairTicketsTab() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get("/repairs/admin");
      setSubmissions(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/repairs/admin/${id}`, { status: newStatus });
      fetchSubmissions(); // refresh
      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const isRepair = s.deviceType !== 'unknown' && s.status !== 'PENDING';
      const matchesSearch = !search || s.customerName?.toLowerCase().includes(search.toLowerCase()) || s.ticketId?.toLowerCase().includes(search.toLowerCase());
      return isRepair && matchesSearch;
    });
  }, [search, submissions]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h-lg text-neutral-950">Repair Tickets</h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or Ticket ID..."
          className="w-full max-w-md pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Ticket ID</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Customer</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Device</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-b-sm text-neutral-500">
                  No repair tickets found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} onClick={() => setSelectedSubmission(s)} className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer">
                  <td className="py-3 px-4 text-b-xs font-mono text-neutral-600">{s.ticketId}</td>
                  <td className="py-3 px-4">
                    <p className="text-b-sm text-neutral-950">{s.customerName}</p>
                  </td>
                  <td className="py-3 px-4 text-b-sm text-neutral-700">{s.deviceModel}</td>
                  <td className="py-3 px-4">
                    <span className={`text-b-xs px-2 py-0.5 rounded-full ${statusColors[s.status] || 'bg-gray-100 text-gray-800'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedSubmission(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-h-sm text-neutral-950">Ticket Details</h3>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-neutral-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Ticket ID</p>
                <p className="text-b-sm font-mono text-neutral-950">{selectedSubmission.ticketId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Customer</p>
                  <p className="text-b-sm text-neutral-950">{selectedSubmission.customerName}</p>
                  <p className="text-b-xs text-neutral-500">{selectedSubmission.customerPhone}</p>
                  <p className="text-b-xs text-neutral-500">{selectedSubmission.customerEmail}</p>
                </div>
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Update Status</p>
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => updateStatus(selectedSubmission.id, e.target.value)}
                    className="w-full text-b-xs border rounded p-1"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="DIAGNOSING">DIAGNOSING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="WAITING_FOR_PARTS">WAITING_FOR_PARTS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Device</p>
                <p className="text-b-sm text-neutral-950">{selectedSubmission.brand} {selectedSubmission.deviceModel}</p>
                <p className="text-b-xs text-neutral-500">{selectedSubmission.issueDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Service Mode</p>
                  <p className="text-b-sm capitalize text-neutral-950">{selectedSubmission.serviceMode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Estimated Cost</p>
                  <p className="text-b-sm font-semibold text-neutral-950">₹{selectedSubmission.estimatedCost}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadsTab() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  // Manual lead creation states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('iphone');
  const [newBrand, setNewBrand] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newServiceMode, setNewServiceMode] = useState<'walkin' | 'courier'>('walkin');
  const [newAddress, setNewAddress] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState('');

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewDeviceType('iphone');
    setNewBrand('');
    setNewDeviceModel('');
    setNewIssue('');
    setNewCost('');
    setNewServiceMode('walkin');
    setNewAddress('');
    setLeadError('');
  };

  const handleAddLeadSubmit = async (e: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    setLeadError('');
    setIsSubmittingLead(true);

    try {
      await api.post('/repairs/admin/create-lead', {
        customerName: newName,
        customerPhone: newPhone,
        customerEmail: newEmail,
        deviceType: newDeviceType,
        brand: newBrand,
        deviceModel: newDeviceModel,
        issueDescription: newIssue,
        estimatedCost: newCost ? Number(newCost) : 0,
        serviceMode: newServiceMode,
        address: newServiceMode === 'courier' ? newAddress : undefined,
        force
      });
      
      closeAddModal();
      fetchLeads();
    } catch (err: any) {
      if (err.response?.status === 409) {
        const confirm = window.confirm(
          `A pending lead already exists for this customer and device (ID: ${err.response.data.existingTicketId}). Do you want to create it anyway?`
        );
        if (confirm) {
          await handleAddLeadSubmit(e, true);
        }
      } else {
        setLeadError(err.response?.data?.message || 'Failed to create lead.');
      }
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await api.get("/repairs/admin");
      setSubmissions(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const convertToTicket = async (id: string) => {
    try {
      await api.put(`/repairs/admin/${id}`, { status: "DIAGNOSING" });
      fetchLeads();
      setSelectedLead(null);
    } catch (e) {
      alert('Error converting lead to ticket');
    }
  };

  const dismissLead = async (id: string) => {
    if (!window.confirm("Are you sure you want to dismiss (delete) this lead?")) return;
    try {
      await api.delete(`/repairs/admin/${id}`);
      fetchLeads();
      setSelectedLead(null);
    } catch (e) {
      alert('Error dismissing lead');
    }
  };

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const isLead = s.deviceType !== 'unknown' && s.status === 'PENDING';
      const matchesSearch = !search || s.customerName?.toLowerCase().includes(search.toLowerCase()) || s.ticketId?.toLowerCase().includes(search.toLowerCase());
      return isLead && matchesSearch;
    });
  }, [search, submissions]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h-lg text-neutral-950">Leads</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-b-sm bg-neutral-950 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Add New Lead
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or Lead ID..."
          className="w-full max-w-md pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Lead ID</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Customer</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Device</th>
              <th className="text-left py-3 px-4 text-b-xs font-medium text-neutral-500">Date</th>
              <th className="text-right py-3 px-4 text-b-xs font-medium text-neutral-500 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-b-sm text-neutral-500">
                  No pending leads found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} onClick={() => setSelectedLead(s)} className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer">
                  <td className="py-3 px-4">
                    <span className="font-mono text-neutral-600 block text-b-xs mb-1">{s.ticketId}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide ${
                      s.source === 'website_booking' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      s.source === 'admin_manual' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      s.source === 'query_widget' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                      s.source === 'repairshopr_import' || s.source === 'repairshopr_pull' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {s.source === 'website_booking' ? 'Website' :
                       s.source === 'admin_manual' ? 'Manual' :
                       s.source === 'query_widget' ? 'Query' :
                       'RepairShopr'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-b-sm text-neutral-950">{s.customerName}</p>
                    <p className="text-b-xs text-neutral-500">{s.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4 text-b-sm text-neutral-700">{s.deviceModel}</td>
                  <td className="py-3 px-4 text-b-xs text-neutral-500">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => convertToTicket(s.id)}
                        className="px-2.5 py-1 text-b-xs bg-neutral-950 text-white font-medium rounded hover:bg-neutral-800 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => dismissLead(s.id)}
                        className="px-2.5 py-1 text-b-xs border border-red-200 text-red-600 font-medium rounded hover:bg-red-50 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedLead(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-h-sm text-neutral-950">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-neutral-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Lead ID</p>
                <p className="text-b-sm font-mono text-neutral-950">{selectedLead.ticketId}</p>
              </div>
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Customer</p>
                <p className="text-b-sm text-neutral-950">{selectedLead.customerName}</p>
                <p className="text-b-xs text-neutral-500">Phone: {selectedLead.customerPhone}</p>
                <p className="text-b-xs text-neutral-500">Email: {selectedLead.customerEmail}</p>
              </div>
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Device Details</p>
                <p className="text-b-sm text-neutral-950">{selectedLead.brand} {selectedLead.deviceModel}</p>
                <p className="text-b-xs text-neutral-500">Issue: {selectedLead.issueDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Service Mode</p>
                  <p className="text-b-sm capitalize text-neutral-950">{selectedLead.serviceMode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Estimated Cost</p>
                  <p className="text-b-sm font-semibold text-neutral-950">₹{selectedLead.estimatedCost}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-150 flex gap-3">
                <button
                  onClick={() => convertToTicket(selectedLead.id)}
                  className="flex-1 py-2 text-b-sm bg-neutral-950 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Convert to Repair Ticket
                </button>
                <button
                  onClick={() => dismissLead(selectedLead.id)}
                  className="px-4 py-2 text-b-sm border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Dismiss Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeAddModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-right z-10 text-left">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-h-sm text-neutral-950 font-bold">Add New Lead</h3>
              <button onClick={closeAddModal} className="p-1 hover:bg-neutral-100 rounded">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <form onSubmit={(e) => handleAddLeadSubmit(e)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {leadError && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-b-xs">
                  {leadError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Customer Name *</label>
                  <input
                    type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Phone (10-digit) *</label>
                  <input
                    type="tel" required value={newPhone} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Email Address *</label>
                <input
                  type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Device Type *</label>
                  <select
                    value={newDeviceType} onChange={(e) => setNewDeviceType(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  >
                    <option value="iphone">iPhone</option>
                    <option value="android">Android</option>
                    <option value="ipad">iPad</option>
                    <option value="macbook">MacBook</option>
                    <option value="laptop">Laptop</option>
                    <option value="watch">Watch</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Brand *</label>
                  <input
                    type="text" required value={newBrand} onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Apple"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Model *</label>
                  <input
                    type="text" required value={newDeviceModel} onChange={(e) => setNewDeviceModel(e.target.value)}
                    placeholder="iPhone 15"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Explain Issue *</label>
                  <span className={`text-[10px] ${newIssue.length > 500 ? 'text-red-500' : 'text-neutral-400'}`}>
                    {newIssue.length}/500
                  </span>
                </div>
                <textarea
                  required value={newIssue} onChange={(e) => setNewIssue(e.target.value.slice(0, 500))}
                  placeholder="Describe what is wrong with the device"
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Estimated Cost (₹) <span className="text-neutral-400 font-normal">(Optional)</span></label>
                  <input
                    type="number" value={newCost} onChange={(e) => setNewCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Service Mode</label>
                  <select
                    value={newServiceMode} onChange={(e) => setNewServiceMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  >
                    <option value="walkin">Walk-in</option>
                    <option value="courier">Courier</option>
                  </select>
                </div>
              </div>

              {newServiceMode === 'courier' && (
                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Address *</label>
                  <textarea
                    required={newServiceMode === 'courier'}
                    value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter pickup/delivery address"
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-neutral-200 flex gap-3">
                <button
                  type="button" onClick={closeAddModal}
                  className="flex-1 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-b-sm font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSubmittingLead || newPhone.length !== 10}
                  className="flex-1 py-2 bg-neutral-950 text-white rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {isSubmittingLead ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PricingTab() {
  const [localPrices, setLocalPrices] = useState<any[]>([]);
  const [isAirtable, setIsAirtable] = useState(false);
  const [isAirtableMode, setIsAirtableMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newDeviceType, setNewDeviceType] = useState('iphone');
  const [newBrandSelect, setNewBrandSelect] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [newDeviceSelect, setNewDeviceSelect] = useState('');
  const [customDevice, setCustomDevice] = useState('');
  const [newService, setNewService] = useState(availableServices[0]?.title || '');
  const [newPrice, setNewPrice] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    toUpdate: any[];
    toAdd: any[];
    toDelete: any[];
  } | null>(null);

  const availableBrands = useMemo(() => Array.from(new Set(localPrices.map(p => p.brand))).filter(Boolean) as string[], [localPrices]);
  const availableModels = useMemo(() => {
    const brandToMatch = newBrandSelect === 'ADD_NEW' ? customBrand : newBrandSelect;
    return Array.from(new Set(
      localPrices
        .filter(p => p.deviceType === newDeviceType && p.brand === brandToMatch)
        .map(p => p.deviceModel)
    )).filter(Boolean) as string[];
  }, [localPrices, newDeviceType, newBrandSelect, customBrand]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [servicesRes, healthRes] = await Promise.all([
          api.get("/services"),
          api.get("/health").catch(e => ({ data: null }))
        ]);
        setLocalPrices(servicesRes.data || []);
        if (healthRes.data?.airtable?.useAirtable) {
          // Enable all UI controls (CSV imports, deletions, adding items, direct price inputs) by forcing isAirtable to false
          setIsAirtable(false);
          setIsAirtableMode(true);
        }
      } catch (e) {
        console.error("Error fetching pricing or health status:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportToCSV = () => {
    const headers = ["ID", "Device Type", "Brand", "Device Model", "Service", "Price (₹)"];
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...localPrices.map(p => [
        p.id,
        p.deviceType,
        p.brand,
        p.deviceModel,
        p.service,
        p.price
      ].map(escapeCSV).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `irepairme_pricing_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines: string[][] = [];
    let row: string[] = [""];
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i+1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push("");
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(row.map(cell => cell.trim()));
        row = [""];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(row.map(cell => cell.trim()));
    }
    return lines;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAirtable) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length < 2) {
          alert("CSV file is empty or invalid.");
          return;
        }

        const headers = parsed[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        
        // Find indices of columns
        const idIndex = headers.indexOf('id');
        const typeIndex = headers.findIndex(h => h.includes('type'));
        const brandIndex = headers.indexOf('brand');
        const modelIndex = headers.findIndex(h => h.includes('model'));
        const serviceIndex = headers.indexOf('service');
        const priceIndex = headers.findIndex(h => h.includes('price'));

        if (typeIndex === -1 || brandIndex === -1 || modelIndex === -1 || serviceIndex === -1 || priceIndex === -1) {
          alert("Required headers not found. Your CSV must have columns for: Device Type, Brand, Device Model, Service, and Price.");
          return;
        }

        const toUpdate: any[] = [];
        const toAdd: any[] = [];
        
        // Build map of current items for matching
        const existingById = new Map<string, any>();
        const existingByKey = new Map<string, any>();
        localPrices.forEach(item => {
          if (item.id) existingById.set(item.id, item);
          const key = `${item.brand.toLowerCase()}|${item.deviceModel.toLowerCase()}|${item.service.toLowerCase()}`;
          existingByKey.set(key, item);
        });

        const seenInCSVKeys = new Set<string>();

        // Parse data rows
        for (let idx = 1; idx < parsed.length; idx++) {
          const row = parsed[idx];
          if (row.length <= 1 && row[0] === '') continue;

          const rowId = idIndex !== -1 ? row[idIndex] : '';
          const deviceType = row[typeIndex];
          const brand = row[brandIndex];
          const deviceModel = row[modelIndex];
          const service = row[serviceIndex];
          const priceStr = row[priceIndex];

          if (!deviceType || !brand || !deviceModel || !service || !priceStr) {
            alert(`Row ${idx + 1} has missing required values.`);
            return;
          }

          const price = Number(priceStr.replace(/[^0-9.-]/g, ''));
          if (isNaN(price) || price < 0) {
            alert(`Row ${idx + 1} has an invalid price: "${priceStr}". Price must be a non-negative number.`);
            return;
          }

          const validTypes = ['iphone', 'android', 'ipad', 'macbook', 'laptop', 'watch', 'other'];
          if (!validTypes.includes(deviceType.toLowerCase())) {
            alert(`Row ${idx + 1} has an invalid device type: "${deviceType}". Must be one of: ${validTypes.join(', ')}.`);
            return;
          }

          const compositeKey = `${brand.toLowerCase()}|${deviceModel.toLowerCase()}|${service.toLowerCase()}`;
          
          if (seenInCSVKeys.has(compositeKey)) {
            continue;
          }
          seenInCSVKeys.add(compositeKey);

          let existingItem = null;
          if (rowId && existingById.has(rowId)) {
            existingItem = existingById.get(rowId);
          } else if (existingByKey.has(compositeKey)) {
            existingItem = existingByKey.get(compositeKey);
          }

          const itemData = {
            deviceType: deviceType.toLowerCase(),
            brand,
            deviceModel,
            service,
            price
          };

          if (existingItem) {
            if (existingItem.price !== price) {
              toUpdate.push({
                id: existingItem.id,
                ...itemData,
                estimatedTime: existingItem.estimatedTime || '30 min',
                warrantyDays: existingItem.warrantyDays || 90,
                inStock: existingItem.inStock !== undefined ? existingItem.inStock : true
              });
            }
            existingById.delete(existingItem.id); // Prevent duplicate matches
          } else {
            toAdd.push({
              ...itemData,
              estimatedTime: '30 min',
              warrantyDays: 90,
              inStock: true
            });
          }
        }

        // Build list of items to delete (items currently in localPrices but not matched by brand/model/service combination in CSV)
        const parsedCompositeKeys = new Set(
          [...toUpdate, ...toAdd].map(item => `${item.brand.toLowerCase()}|${item.deviceModel.toLowerCase()}|${item.service.toLowerCase()}`)
        );
        // Also keep items that matched but didn't have their price updated
        localPrices.forEach(item => {
          const key = `${item.brand.toLowerCase()}|${item.deviceModel.toLowerCase()}|${item.service.toLowerCase()}`;
          if (seenInCSVKeys.has(key)) {
            parsedCompositeKeys.add(key);
          }
        });

        const toDelete = localPrices.filter(item => {
          const key = `${item.brand.toLowerCase()}|${item.deviceModel.toLowerCase()}|${item.service.toLowerCase()}`;
          return !parsedCompositeKeys.has(key);
        });

        setImportPreview({
          toUpdate,
          toAdd,
          toDelete
        });

      } catch (err: any) {
        alert("Error reading or parsing CSV file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!importPreview) return;
    setIsImporting(true);

    try {
      if (isAirtableMode) {
        // ONLY perform price updates in Airtable mode (CRUD additions/deletions bypassed)
        for (const item of importPreview.toUpdate) {
          await api.put(`/services/${item.id}`, { price: item.price });
        }
      } else {
        for (const item of importPreview.toDelete) {
          await api.delete(`/services/${item.id}`);
        }

        for (const item of importPreview.toUpdate) {
          await api.put(`/services/${item.id}`, { price: item.price });
        }

        for (const item of importPreview.toAdd) {
          await api.post(`/services`, item);
        }
      }

      const response = await api.get("/services");
      setLocalPrices(response.data);
      
      alert("Pricing catalog imported successfully!");
      setImportPreview(null);
    } catch (err: any) {
      alert("Error importing prices: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handlePriceChange = async (id: string, price: number) => {
    try {
      await api.put(`/services/${id}`, { price });
      setLocalPrices(localPrices.map(p => p.id === id ? { ...p, price } : p));
    } catch (e) {
      alert('Error updating price');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAirtableMode) return;
    
    if (newBrandSelect === 'ADD_NEW') {
      const existingBrand = availableBrands.find(b => b.toLowerCase() === customBrand.toLowerCase().trim());
      if (existingBrand) {
        alert(`The brand "${existingBrand}" already exists! Please select it from the dropdown instead.`);
        return;
      }
    }
    
    const finalBrand = newBrandSelect === 'ADD_NEW' ? customBrand.trim() : newBrandSelect;
    
    if (newDeviceSelect === 'ADD_NEW') {
      const existingModel = availableModels.find(m => m.toLowerCase() === customDevice.toLowerCase().trim());
      if (existingModel) {
        alert(`The model "${existingModel}" already exists for this brand! Please select it from the dropdown instead.`);
        return;
      }
    }
    
    const finalDevice = newDeviceSelect === 'ADD_NEW' ? customDevice.trim() : newDeviceSelect;
    if (!finalDevice || !newService || !newPrice || !finalBrand) return;
    setIsAdding(true);
    try {
      const response = await api.post("/services", {
        deviceType: newDeviceType,
        brand: finalBrand,
        deviceModel: finalDevice,
        service: newService,
        price: Number(newPrice)
      });
      const newCreated = response.data;
      setLocalPrices([newCreated, ...localPrices]);
      setNewPrice('');
      if (newBrandSelect === 'ADD_NEW') {
        setNewBrandSelect(finalBrand);
        setCustomBrand('');
      }
      if (newDeviceSelect === 'ADD_NEW') {
        setNewDeviceSelect(finalDevice);
        setCustomDevice('');
      }
    } catch (e) {
      alert("Error adding item");
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (isAirtableMode) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/services/${id}`);
      setLocalPrices(localPrices.filter(p => p.id !== id));
    } catch (e) {
      alert("Error deleting item");
    }
  };

  const handleDeleteBrand = async (brandName: string) => {
    if (isAirtableMode) return;
    if (!window.confirm(`Are you SURE you want to delete ALL pricing entries for ${brandName}? This will instantly remove the brand from the booking flow.`)) return;
    try {
      const itemsToDelete = localPrices.filter(p => p.brand === brandName);
      for (const item of itemsToDelete) {
        await api.delete(`/services/${item.id}`);
      }
      setLocalPrices(localPrices.filter(p => p.brand !== brandName));
          alert(`Deleted ${itemsToDelete.length} items for ${brandName}.`);
      if (newBrandSelect === brandName) setNewBrandSelect('');
    } catch (e) {
      alert("Error deleting brand");
    }
  };

    return (
      <div>
        {isAirtableMode && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-neutral-600">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="text-b-sm font-semibold text-neutral-950">Airtable Catalog Mode Active</p>
              <p className="text-b-xs text-neutral-500 mt-0.5">
                Brands, devices, models, and service structures are managed directly via Airtable. 
                Direct price editing and CSV price imports are enabled. Additions and deletions from this dashboard are disabled.
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-h-lg text-neutral-950">Live Price Manager</h2>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-b-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

      {/* Add New Item Form */}
      {isAirtableMode ? (
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 mb-6 text-center text-neutral-500 text-b-sm font-medium">
          ℹ️ Adding and deleting devices, brands, and models is managed directly inside your Airtable Catalog Base. Prices can be edited directly in the catalog below.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6">
          <h3 className="text-b-sm font-semibold text-neutral-950 mb-4">Add New Item</h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/4">
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Type</label>
                <select value={newDeviceType} onChange={(e) => setNewDeviceType(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white">
                  <option value="iphone">iPhone</option>
                  <option value="android">Android</option>
                  <option value="ipad">iPad</option>
                  <option value="macbook">MacBook</option>
                  <option value="laptop">Laptop</option>
                  <option value="watch">Apple Watch</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="w-full md:w-1/4">
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Brand</label>
                {newBrandSelect === 'ADD_NEW' ? (
                  <div className="flex gap-2">
                    <input type="text" required placeholder="e.g. Motorola" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    <button type="button" onClick={() => setNewBrandSelect(availableBrands[0] || '')} className="text-neutral-500 hover:text-neutral-950 p-2">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <select value={newBrandSelect} onChange={(e) => setNewBrandSelect(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white" required>
                    <option value="" disabled>Select Brand</option>
                    {availableBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="ADD_NEW" className="font-semibold text-neutral-950">+ Add New Brand...</option>
                  </select>
                )}
              </div>
              <div className="flex-1 w-full">
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Device Model</label>
                {newDeviceSelect === 'ADD_NEW' ? (
                  <div className="flex gap-2">
                    <input type="text" required placeholder="e.g. Galaxy S24 Ultra" value={customDevice} onChange={(e) => setCustomDevice(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    <button type="button" onClick={() => setNewDeviceSelect(availableModels[0] || '')} className="text-neutral-500 hover:text-neutral-950 p-2">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <select value={newDeviceSelect} onChange={(e) => setNewDeviceSelect(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white" required>
                    <option value="" disabled>Select Model</option>
                    {availableModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="ADD_NEW" className="font-semibold text-neutral-950">+ Add New Model...</option>
                  </select>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Service / Part</label>
                <select required value={newService} onChange={(e) => setNewService(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white">
                  {availableServices.map(s => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-1/4">
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Price (₹)</label>
                <input type="number" required placeholder="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>
              <button type="submit" disabled={isAdding} className="w-full md:w-auto px-6 py-2 bg-neutral-950 text-white rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50">
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Device</th>
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Service</th>
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider w-40">Price (₹)</th>
              <th className="text-right py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center p-4">Loading services...</td></tr>
            ) : localPrices.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-4 text-neutral-500">No services found in Airtable catalog. Please populate pricing columns in your base.</td></tr>
            ) : (
              localPrices.map((p) => (
                <tr key={p.id} className="border-b border-neutral-50">
                  <td className="py-3 px-4 text-b-sm text-neutral-950">{p.brand} {p.deviceModel}</td>
                  <td className="py-3 px-4 text-b-sm text-neutral-700">{p.service}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number" defaultValue={p.price}
                      onBlur={(e) => handlePriceChange(p.id, Number(e.target.value))}
                      className="w-32 px-2 py-1.5 border border-neutral-200 rounded-lg text-b-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!isAirtableMode && (
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manage Brands Section */}
      <div className="mt-8 bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-b-sm font-semibold text-neutral-950 mb-4">Manage Brands</h3>
        <p className="text-b-xs text-neutral-500 mb-4">
          {isAirtableMode ? "Brands and models are managed directly via Airtable." : "Deleting a brand will remove all associated devices and services."}
        </p>
        <div className="flex flex-wrap gap-3">
          {availableBrands.length === 0 && <span className="text-b-sm text-neutral-500">No brands found.</span>}
          {availableBrands.map(brand => (
            <div key={brand} className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
              <span className="text-b-sm font-medium text-neutral-950">{brand}</span>
              {!isAirtableMode && (
                <button 
                  onClick={() => handleDeleteBrand(brand)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                  title={`Delete all ${brand} items`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSV Import Preview Modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isImporting && setImportPreview(null)} />
          <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-md w-full relative z-10 shadow-xl space-y-4">
            <h3 className="text-h-sm text-neutral-950 font-bold">Confirm Pricing Import</h3>
            <p className="text-b-xs text-neutral-500">
              Please review the changes that will be applied to your live pricing catalog:
            </p>
            
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 divide-y divide-neutral-200">
              {isAirtableMode ? (
                <>
                  <div className="flex justify-between py-2">
                    <span className="text-b-xs text-neutral-600 font-semibold">Updates:</span>
                    <span className="text-b-xs text-blue-600 font-bold">{importPreview.toUpdate.length} prices updated</span>
                  </div>
                  <div className="py-2 text-b-xs text-neutral-500 text-center font-medium">
                    Note: Additions ({importPreview.toAdd.length}) and deletions ({importPreview.toDelete.length}) are ignored in Airtable Mode.
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-2">
                    <span className="text-b-xs text-neutral-600 font-semibold">Updates:</span>
                    <span className="text-b-xs text-blue-600 font-bold">{importPreview.toUpdate.length} prices updated</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-b-xs text-neutral-600 font-semibold">Additions:</span>
                    <span className="text-b-xs text-emerald-600 font-bold">+{importPreview.toAdd.length} new items</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-b-xs text-neutral-600 font-semibold">Deletions:</span>
                    <span className="text-b-xs text-red-600 font-bold">-{importPreview.toDelete.length} items removed</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-b-xs text-neutral-500 font-medium">
              {isAirtableMode 
                ? "Confirming will apply updated prices to Airtable." 
                : "Warning: Deletions will permanently remove items from the live database."}
            </p>

            <div className="flex gap-3">
              <button
                disabled={isImporting}
                onClick={handleImport}
                className="flex-1 py-2 bg-neutral-950 text-white rounded-lg text-b-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {isImporting ? "Applying Changes..." : "Confirm & Import"}
              </button>
              <button
                disabled={isImporting}
                onClick={() => setImportPreview(null)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-b-sm font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  return (
    <div>
      <h2 className="text-h-lg text-neutral-950 mb-6">Settings</h2>
      <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-lg space-y-4">
        <div>
          <label className="block text-b-xs font-medium text-neutral-700 mb-1">Business Name</label>
          <input type="text" defaultValue="iRepairMe" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
      </div>
    </div>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/auth/admin/users");
        const data = response.data;
        data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCustomers(data);
      } catch (e) {
        console.error("Error fetching customers:", e);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div>
      <h2 className="text-h-lg text-neutral-950 mb-6">Registered Customers</h2>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50">
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Email Address</th>
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Account ID</th>
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={3} className="text-center p-4">No registered customers yet</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.uid} className="border-b border-neutral-50">
                  <td className="py-3 px-4 text-b-sm font-semibold text-neutral-950">{c.email}</td>
                  <td className="py-3 px-4 text-b-xs font-mono text-neutral-500">{c.uid}</td>
                  <td className="py-3 px-4 text-b-sm text-neutral-700">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SparePartsTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrdersAndProducts = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/shop/admin/orders"),
        api.get("/shop/products").catch(() => ({ data: [] }))
      ]);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (e) {
      console.error("Error fetching spare parts orders:", e);
    }
  };

  useEffect(() => {
    fetchOrdersAndProducts();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/shop/admin/orders/${id}/status`, { status: newStatus });
      fetchOrdersAndProducts();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  return (
    <div>
      <h2 className="text-h-lg text-neutral-950 mb-6">Spare Parts Orders</h2>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50">
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Order ID</th>
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Mode</th>
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-4 text-b-sm text-neutral-500">No spare parts orders yet</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} onClick={() => setSelectedOrder(o)} className="border-b border-neutral-50 align-top hover:bg-neutral-50 cursor-pointer">
                  <td className="py-3 px-4 text-b-xs font-mono text-neutral-600">{o.orderId}</td>
                  <td className="py-3 px-4">
                    <p className="text-b-sm font-semibold text-neutral-950">{o.customerName}</p>
                    <p className="text-b-xs text-neutral-500">{o.customerEmail}</p>
                  </td>
                  <td className="py-3 px-4 text-b-sm capitalize text-neutral-700">{o.serviceMode || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-b-xs px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-gray-100 text-gray-800'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-h-sm text-neutral-950">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-neutral-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Order ID</p>
                <p className="text-b-sm font-mono text-neutral-950">{selectedOrder.orderId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Customer</p>
                  <p className="text-b-sm text-neutral-950">{selectedOrder.customerName}</p>
                  <p className="text-b-xs text-neutral-500">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Update Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    className="w-full text-b-xs border rounded p-1"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Parts Requested</p>
                <ul className="list-disc list-inside text-b-sm text-neutral-950">
                  {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => {
                    const prod = products.find(p => p.id === item.productId || p._id === item.productId);
                    const name = prod ? prod.name : `Product (${item.productId})`;
                    return (
                      <li key={idx}>{name} <span className="text-neutral-500">(x{item.quantity})</span></li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Total Cost</p>
                <p className="text-b-sm font-semibold text-neutral-950">₹{selectedOrder.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
