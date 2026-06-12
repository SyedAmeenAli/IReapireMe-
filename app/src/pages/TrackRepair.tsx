import { useState } from 'react';
import { Search, Smartphone, Package, CheckCircle2, Clock, AlertCircle, ChevronRight, ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { submissions, statusLabels, statusColors } from '@/data/submissions';

const pipelineStages = [
  { key: 'new', label: 'Order Placed' },
  { key: 'received', label: 'Device Received' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'repairing', label: 'Repairing' },
  { key: 'testing', label: 'Quality Check' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
];

export default function TrackRepair() {
  const [searchPhone, setSearchPhone] = useState('');
  const [searchId, setSearchId] = useState('');
  const [activeTab, setActiveTab] = useState<'phone' | 'id'>('phone');
  const [result, setResult] = useState<typeof submissions[0] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    if (activeTab === 'phone') {
      const found = submissions.find((s) => s.customer.phone.includes(searchPhone));
      setResult(found || null);
    } else {
      const found = submissions.find((s) => s.id.toLowerCase().includes(searchId.toLowerCase()));
      setResult(found || null);
    }
  };

  const currentStageIndex = result ? pipelineStages.findIndex((s) => s.key === result.status) : -1;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-neutral-50">
      <div className="container-main max-w-2xl">
        <div className="text-center mb-10">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Order Status</p>
          <h1 className="text-h-xxl text-neutral-950 mb-2">Track Your Repair</h1>
          <p className="text-b-sm text-neutral-500">Enter your phone number or order ID to check the status</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setActiveTab('phone'); setSearched(false); setResult(null); }}
            className={`flex-1 py-2.5 rounded-md text-b-sm font-medium transition-colors ${activeTab === 'phone' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Phone Number
          </button>
          <button
            onClick={() => { setActiveTab('id'); setSearched(false); setResult(null); }}
            className={`flex-1 py-2.5 rounded-md text-b-sm font-medium transition-colors ${activeTab === 'id' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Order ID
          </button>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6">
          {activeTab === 'phone' ? (
            <div>
              <label className="block text-b-xs font-medium text-neutral-700 mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Track
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-b-xs font-medium text-neutral-700 mb-1.5">Order ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g., SUB-240612-001"
                  className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Track
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {searched && !result && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-b-sm text-neutral-500">No order found with the provided details.</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Order ID</p>
                  <p className="text-b-sm font-semibold text-neutral-950">{result.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-b-xs font-medium ${statusColors[result.status]}`}>
                  {statusLabels[result.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Device</p>
                  <p className="text-b-sm font-medium text-neutral-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    {result.device.brand} {result.device.model}
                  </p>
                </div>
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Issue</p>
                  <p className="text-b-sm text-neutral-700">{result.device.issue}</p>
                </div>
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Customer</p>
                  <p className="text-b-sm text-neutral-700">{result.customer.name}</p>
                </div>
                <div>
                  <p className="text-b-xs text-neutral-500 mb-1">Service Mode</p>
                  <p className="text-b-sm text-neutral-700 capitalize">{result.appointment.serviceMethod}</p>
                </div>
              </div>
              {result.quotedPriceLabel && (
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <span className="text-b-xs text-neutral-500">Quoted Price</span>
                  <span className="text-b-sm font-semibold text-neutral-950">{result.quotedPriceLabel}</span>
                </div>
              )}
            </div>

            {/* Pipeline */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h3 className="text-h-sm text-neutral-950 mb-4">Repair Progress</h3>
              <div className="relative">
                {pipelineStages.map((stage, i) => {
                  const isCompleted = i <= currentStageIndex;
                  const isCurrent = i === currentStageIndex;
                  return (
                    <div key={stage.key} className="flex items-start gap-4 pb-6 last:pb-0">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted ? 'bg-green-500 text-white' : 'bg-neutral-200 text-neutral-400'
                        } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        {i < pipelineStages.length - 1 && (
                          <div className={`w-0.5 h-full mt-1 ${isCompleted && i < currentStageIndex ? 'bg-green-500' : 'bg-neutral-200'}`} />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className={`text-b-sm font-medium ${isCompleted ? 'text-neutral-950' : 'text-neutral-400'}`}>
                          {stage.label}
                        </p>
                        {isCurrent && result.internalNotes && (
                          <p className="text-b-xs text-neutral-500 mt-1">{result.internalNotes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact */}
            <div className="flex gap-3">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 border border-neutral-300 text-neutral-700 py-3 rounded-lg text-b-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="tel:+919876543210"
                className="flex-1 flex items-center justify-center gap-2 border border-neutral-300 text-neutral-700 py-3 rounded-lg text-b-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
