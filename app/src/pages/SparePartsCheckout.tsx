import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, ArrowLeft, MapPin, Home, Package as PackageIcon, Truck, User } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function SparePartsCheckout() {
  const { cart, clearCart } = useStore();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [serviceMode, setServiceMode] = useState<'pickup' | 'dropoff' | 'courier'>('courier');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const ticketId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();

      await addDoc(collection(db, "tickets"), {
        ticketId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || 'no-email@provided.com',
        deviceType: 'unknown', // Critical for Admin.tsx SpareParts filter
        brand: 'unknown',
        deviceModel: 'unknown',
        issueDescription: 'Spare Parts Order',
        estimatedCost: cartPrice,
        serviceMode,
        address,
        notes,
        cart: cart,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      setConfirmed(true);
      clearCart();
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !confirmed) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-b-lg text-neutral-500 mb-4">Your cart is empty.</p>
          <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-neutral-950 text-white rounded-lg">Go to Shop</button>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-neutral-50">
        <div className="container-main max-w-lg">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-h-xl text-neutral-950 mb-2">Order Confirmed!</h1>
            <p className="text-b-sm text-neutral-500 mb-6">
              Your spare parts order has been placed. We'll send you an update shortly.
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 text-left mb-6 space-y-2">
              <p className="text-b-sm"><span className="text-neutral-500">Total Price:</span> ₹{cartPrice.toLocaleString()}</p>
              <p className="text-b-sm"><span className="text-neutral-500">Delivery Mode:</span> <span className="capitalize">{serviceMode}</span></p>
            </div>
            <div className="space-y-3">
              <Link
                to="/shop"
                className="block w-full py-3 bg-neutral-950 text-white rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                to="/my-account"
                className="block w-full py-3 border border-neutral-300 text-neutral-700 rounded-lg text-b-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Go to My Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-neutral-50">
      <div className="container-main max-w-2xl">
        <Link to="/shop" className="inline-flex items-center gap-1 text-b-sm text-neutral-500 hover:text-neutral-950 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <h1 className="text-h-xxl text-neutral-950 mb-2">Checkout</h1>
        <p className="text-b-sm text-neutral-500 mb-8">Fill in your details to place the order for your spare parts.</p>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-h-sm text-neutral-950 mb-4 flex items-center gap-2">
              <PackageIcon className="w-5 h-5" /> Order Summary
            </h3>
            <ul className="space-y-3 mb-4">
              {cart.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-b-sm">
                  <span>{item.name} <span className="text-neutral-500">(x{item.quantity})</span></span>
                  <span className="font-medium text-neutral-950">₹{(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-200 pt-3 flex justify-between items-center text-b-sm font-bold text-neutral-950">
              <span>Total</span>
              <span>₹{cartPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Mode */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-h-sm text-neutral-950 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Delivery Mode
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'dropoff' as const, label: 'Drop-off', icon: Home },
                { key: 'pickup' as const, label: 'Store Pickup', icon: Truck },
                { key: 'courier' as const, label: 'Courier', icon: PackageIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setServiceMode(key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    serviceMode === key ? 'border-neutral-950 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <Icon className="w-5 h-5 text-neutral-600" />
                  <span className="text-b-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-h-sm text-neutral-950 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Your Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="optional"
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
              {(serviceMode === 'courier' || serviceMode === 'pickup') && (
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Delivery Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Additional Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for delivery..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!customerName || !customerPhone || ((serviceMode === 'courier' || serviceMode === 'pickup') && !address) || isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3.5 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Confirming...' : 'Place Order'}
            {!isSubmitting && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
