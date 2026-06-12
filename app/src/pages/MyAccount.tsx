import { User, Phone, Mail, Calendar, Wrench, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Link } from 'react-router';

const mockOrders = [
  { id: 'SUB-240612-001', device: 'iPhone 14 Pro', service: 'Screen Replacement', status: 'In Progress', date: '2024-12-12', price: '₹12,499' },
  { id: 'SUB-240612-005', device: 'OnePlus 11', service: 'Back Glass', status: 'Delivered', date: '2024-12-11', price: '₹2,499' },
  { id: 'SUB-240611-003', device: 'iPhone 13', service: 'Battery Replacement', status: 'Delivered', date: '2024-12-05', price: '₹1,999' },
];

export default function MyAccount() {
  const { isLoggedIn, userName, userPhone, logout } = useStore();

  if (!isLoggedIn) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-h-xl text-neutral-950 mb-2">Please Login</h2>
          <p className="text-b-sm text-neutral-500 mb-6">Login to view your account and repair history</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-950 text-white rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container-main max-w-3xl">
        <h1 className="text-h-xxl text-neutral-950 mb-8">My Account</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-neutral-600" />
              </div>
              <div>
                <h2 className="text-h-sm text-neutral-950">{userName || 'Customer'}</h2>
                <div className="flex items-center gap-3 text-b-xs text-neutral-500 mt-1">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +91 {userPhone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-b-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Repair History */}
        <h3 className="text-h-md text-neutral-950 mb-4">My Repairs</h3>
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <Link
              key={order.id}
              to="/track-repair"
              className="flex items-center justify-between bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-b-xs font-mono text-neutral-500">{order.id}</span>
                  <span className={`text-b-xs px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-b-sm font-medium text-neutral-950">{order.device} &middot; {order.service}</p>
                <p className="text-b-xs text-neutral-500">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-b-sm font-semibold text-neutral-950">{order.price}</p>
                <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
