import { useState } from 'react';
import { Link } from 'react-router';
import { Check, ArrowLeft, Calendar, Clock, MapPin, Home, Package, Truck, User, Phone, Mail, FileText, ChevronRight, MessageCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Booking() {
  const { booking, updateBooking, resetBooking } = useStore();
  const [confirmed, setConfirmed] = useState(false);
  const [serviceMode, setServiceMode] = useState<'pickup' | 'dropoff' | 'courier'>('dropoff');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const handleSubmit = () => {
    updateBooking({
      serviceMode,
      date: selectedDate,
      timeSlot: selectedSlot,
      customerName,
      customerPhone,
      customerEmail,
      address,
      notes,
    });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-neutral-50">
        <div className="container-main max-w-lg">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-h-xl text-neutral-950 mb-2">Booking Confirmed!</h1>
            <p className="text-b-sm text-neutral-500 mb-6">
              Your repair has been scheduled. We&apos;ll send you a confirmation shortly.
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 text-left mb-6 space-y-2">
              <p className="text-b-sm"><span className="text-neutral-500">Device:</span> {booking.model || 'Not specified'}</p>
              <p className="text-b-sm"><span className="text-neutral-500">Service:</span> {booking.issue || 'Not specified'}</p>
              <p className="text-b-sm"><span className="text-neutral-500">Date:</span> {selectedDate} at {selectedSlot}</p>
              <p className="text-b-sm"><span className="text-neutral-500">Mode:</span> {serviceMode}</p>
              <p className="text-b-sm"><span className="text-neutral-500">Price:</span> {booking.priceLabel || 'Quote on inspection'}</p>
            </div>
            <div className="space-y-3">
              <Link
                to="/track-repair"
                className="block w-full py-3 bg-neutral-950 text-white rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Track Your Repair
              </Link>
              <button
                onClick={() => {
                  resetBooking();
                  setConfirmed(false);
                }}
                className="block w-full py-3 border border-neutral-300 text-neutral-700 rounded-lg text-b-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Book Another Repair
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-neutral-50">
      <div className="container-main max-w-2xl">
        <Link to="/repair" className="inline-flex items-center gap-1 text-b-sm text-neutral-500 hover:text-neutral-950 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-h-xxl text-neutral-950 mb-2">Complete Booking</h1>
        <p className="text-b-sm text-neutral-500 mb-8">Fill in your details to schedule the repair</p>

        <div className="space-y-6">
          {/* Service Mode */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-h-sm text-neutral-950 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Service Mode
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'dropoff' as const, label: 'Drop-off', icon: Home },
                { key: 'pickup' as const, label: 'Pickup', icon: Truck },
                { key: 'courier' as const, label: 'Courier', icon: Package },
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

          {/* Date & Time */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-h-sm text-neutral-950 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Select Date & Time
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              {next7Days.map((d) => {
                const dateStr = d.toISOString().split('T')[0];
                const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`shrink-0 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                      selectedDate === dateStr ? 'border-neutral-950 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <span className="text-b-xs text-neutral-500 block">{label.split(' ')[0]}</span>
                    <span className="text-b-sm font-medium">{label.split(' ')[1]} {label.split(' ')[2]}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 rounded-lg border text-b-xs transition-all ${
                    selectedSlot === slot ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {slot}
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
              {(serviceMode === 'pickup' || serviceMode === 'courier') && (
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full address"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information about the issue..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedSlot || !customerName || !customerPhone || ((serviceMode === 'pickup' || serviceMode === 'courier') && !address)}
            className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3.5 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Booking
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
