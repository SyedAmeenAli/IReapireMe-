import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { LayoutDashboard, List, DollarSign, Settings, Search, Download, ChevronRight, BarChart3, Users, Clock, CheckCircle, XCircle, Plus, Trash2, Package } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { pricingData } from '@/data/pricing';
import { services as availableServices } from '@/data/services';

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'submissions', label: 'Submissions', icon: List },
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
    if (email.trim().toLowerCase() === 'amanziyan2004@gmail.com') {
      sessionStorage.setItem('firebaseAdminToken', 'authenticated');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Access Denied. Incorrect email address.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('firebaseAdminToken');
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
              <nav className="p-2">
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
            {activeTab === 'submissions' && <SubmissionsTab />}
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
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const ticketsData = querySnapshot.docs.map(doc => doc.data());
        setSubmissions(ticketsData);
      } catch (e) {
        console.error("Firebase Error:", e);
      }
    };
    fetchStats();
  }, []);

  const total = submissions.length;
  const newToday = submissions.filter((s) => s.status === 'PENDING').length;
  const repairing = submissions.filter((s) => s.status === 'IN_PROGRESS').length;
  const ready = submissions.filter((s) => s.status === 'COMPLETED').length;
  const delivered = submissions.filter((s) => s.status === 'DELIVERED').length;

  const stats = [
    { label: 'Total Tickets', value: total, icon: BarChart3, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending', value: newToday, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'In Progress', value: repairing, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Ready', value: ready, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
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

function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const fetchSubmissions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tickets"));
      const ticketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(ticketsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "tickets", id), { status: newStatus });
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
      const isRepair = s.deviceType !== 'unknown';
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
            {filtered.map((s) => (
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
            ))}
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
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Estimated Cost</p>
                <p className="text-b-sm font-semibold text-neutral-950">₹{selectedSubmission.estimatedCost}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PricingTab() {
  const [localPrices, setLocalPrices] = useState<any[]>([]);
  const [newDeviceType, setNewDeviceType] = useState('iphone');
  const [newBrandSelect, setNewBrandSelect] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [newDeviceSelect, setNewDeviceSelect] = useState('');
  const [customDevice, setCustomDevice] = useState('');
  const [newService, setNewService] = useState(availableServices[0]?.title || '');
  const [newPrice, setNewPrice] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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
    const fetchAndSeedData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        let servicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Seed or migrate database if empty OR if old data exists without deviceType OR if we just added new default items
        const needsMigration = servicesData.length === 0 || servicesData.length < pricingData.length;
        
        if (needsMigration) {
          console.log("Seeding or migrating pricing data to Firestore...");
          for (const item of pricingData) {
            await setDoc(doc(db, "services", item.id), item);
          }
          // Fetch again after seeding
          const newSnapshot = await getDocs(collection(db, "services"));
          servicesData = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        setLocalPrices(servicesData);
      } catch (e) {
        console.error("Error fetching/seeding pricing:", e);
      }
    };
    fetchAndSeedData();
  }, []);

  const handlePriceChange = async (id: string, price: number) => {
    try {
      await updateDoc(doc(db, "services", id), { price });
      setLocalPrices(localPrices.map(p => p.id === id ? { ...p, price } : p));
    } catch (e) {
      alert('Error updating price');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const docRef = await addDoc(collection(db, "services"), {
        deviceType: newDeviceType,
        brand: finalBrand,
        deviceModel: finalDevice,
        service: newService,
        price: Number(newPrice)
      });
      setLocalPrices([{ id: docRef.id, deviceType: newDeviceType, brand: finalBrand, deviceModel: finalDevice, service: newService, price: Number(newPrice) }, ...localPrices]);
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
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "services", id));
      setLocalPrices(localPrices.filter(p => p.id !== id));
    } catch (e) {
      alert("Error deleting item");
    }
  };

  const handleDeleteBrand = async (brandName: string) => {
    if (!window.confirm(`Are you SURE you want to delete ALL pricing entries for ${brandName}? This will instantly remove the brand from the booking flow.`)) return;
    try {
      const itemsToDelete = localPrices.filter(p => p.brand === brandName);
      for (const item of itemsToDelete) {
        await deleteDoc(doc(db, "services", item.id));
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
      <h2 className="text-h-lg text-neutral-950 mb-6">Live Price Manager</h2>

      {/* Add New Item Form */}
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
            {localPrices.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-4">Loading services...</td></tr>
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
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Item">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        <p className="text-b-xs text-neutral-500 mb-4">Deleting a brand will remove all associated devices and services.</p>
        <div className="flex flex-wrap gap-3">
          {availableBrands.length === 0 && <span className="text-b-sm text-neutral-500">No brands found.</span>}
          {availableBrands.map(brand => (
            <div key={brand} className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
              <span className="text-b-sm font-medium text-neutral-950">{brand}</span>
              <button 
                onClick={() => handleDeleteBrand(brand)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                title={`Delete all ${brand} items`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
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
        const querySnapshot = await getDocs(collection(db, "users"));
        const data = querySnapshot.docs.map(doc => doc.data());
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tickets"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const spareOrders = data.filter(d => d.cart && d.cart.length > 0 && d.deviceType === 'unknown');
      spareOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(spareOrders);
    } catch (e) {
      console.error("Error fetching spare parts orders:", e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "tickets", id), { status: newStatus });
      fetchOrders();
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
              <th className="text-left py-3 px-4 text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Ticket ID</th>
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
                  <td className="py-3 px-4 text-b-xs font-mono text-neutral-600">{o.ticketId}</td>
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
                <p className="text-b-xs text-neutral-500 mb-1">Ticket ID</p>
                <p className="text-b-sm font-mono text-neutral-950">{selectedOrder.ticketId}</p>
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
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Parts Requested</p>
                <ul className="list-disc list-inside text-b-sm text-neutral-950">
                  {selectedOrder.cart.map((item: any, idx: number) => (
                    <li key={idx}>{item.name} <span className="text-neutral-500">(x{item.quantity})</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-b-xs text-neutral-500 mb-1">Estimated Cost</p>
                <p className="text-b-sm font-semibold text-neutral-950">₹{selectedOrder.estimatedCost}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
