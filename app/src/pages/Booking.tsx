import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Check, ArrowLeft, Calendar, Clock, MapPin, Home, Package, Truck, User, Phone, Mail, FileText, ChevronRight, MessageCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import api from '@/lib/api';

export default function Booking() {
  const { booking, updateBooking, resetBooking, cart, clearCart, userName, userPhone, userEmail } = useStore();
  const [confirmed, setConfirmed] = useState(false);
  const [serviceMode, setServiceMode] = useState<'walkin' | 'courier'>('walkin');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('India');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [pinCode, setPinCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryQuote, setDeliveryQuote] = useState<{ fee: number; expiresAt: number; quoteToken: string; dropLat: number; dropLng: number } | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const bookingPrice = parseInt(booking.priceLabel?.replace(/[^0-9]/g, '') || '0') || 0;
  const cartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCost = bookingPrice + cartPrice + (deliveryQuote?.fee || 0);

  useEffect(() => {
    if (serviceMode !== 'courier') {
      setDeliveryQuote(null);
      return;
    }

    if (!streetAddress || !city || !pinCode) return;

    const handler = setTimeout(async () => {
      setIsQuoting(true);
      try {
        const mockLat = 17.3850 + (Math.random() * 0.1 - 0.05);
        const mockLng = 78.4867 + (Math.random() * 0.1 - 0.05);

        const res = await api.post('/delivery/quote', {
          dropLat: mockLat,
          dropLng: mockLng,
          type: 'repair'
        });

        if (res.data.success) {
          setDeliveryQuote({
            fee: res.data.fee,
            expiresAt: res.data.expiresAt,
            quoteToken: res.data.quoteToken,
            dropLat: res.data.lat,
            dropLng: res.data.lng
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch delivery quote:', err);
        setDeliveryQuote(null);
      } finally {
        setIsQuoting(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [streetAddress, city, pinCode, serviceMode]);

  useEffect(() => {
    if (userName) {
      const parts = userName.split(' ');
      setFirstName(parts[0]);
      if (parts.length > 1) setLastName(parts.slice(1).join(' '));
    }
    if (userPhone) setPhone(userPhone.replace(/\D/g, '').slice(-10));
    if (userEmail && !userEmail.endsWith('@irepairme.temp')) setEmail(userEmail);
  }, [userName, userPhone, userEmail]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      const fullAddress = serviceMode === 'walkin' ? 'Walk-in' : `${companyName ? companyName + ', ' : ''}${streetAddress}, ${apartment ? apartment + ', ' : ''}${city}, ${state}, ${country} - ${pinCode}`;
      const fullName = `${firstName} ${lastName}`.trim();

      const response = await api.post('/repairs/book', {
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email || 'no-email@provided.com',
        deviceType: booking.deviceType || 'unknown',
        brand: booking.brand || 'unknown',
        deviceModel: booking.model || 'unknown',
        issueDescription: booking.issue || 'unknown',
        estimatedCost: bookingPrice + cartPrice,
        serviceMode,
        address: fullAddress,
        expectedDeliveryFee: deliveryQuote?.fee,
        expiresAt: deliveryQuote?.expiresAt,
        quoteToken: deliveryQuote?.quoteToken,
        dropLat: deliveryQuote?.dropLat,
        dropLng: deliveryQuote?.dropLng,
        scheduledDate: selectedDate,
        scheduledSlot: selectedSlot
      });

      const { orderId, amount, currency, keyId, isMock } = response.data;

      if (isMock) {
        console.warn('Backend is running in mock mode. Simulating successful Razorpay payment...');
        const verifyRes = await api.post('/payment/verify', {
          razorpay_order_id: orderId,
          razorpay_payment_id: 'pay_MOCK_' + Math.random().toString(36).substr(2, 9),
          razorpay_signature: 'mock_signature_bypass' // Note: This will fail backend signature verification unless the backend also supports a mock signature bypass
        });
        
        if (verifyRes.data.success) {
          setConfirmed(true);
          clearCart();
          updateBooking({
            serviceMode,
            date: selectedDate,
            timeSlot: selectedSlot,
            customerName: fullName,
            customerPhone: phone,
            customerEmail: email,
            address: fullAddress,
            notes,
          });
        } else {
          alert('Mock payment verification failed.');
        }
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'iRepairMe',
        description: 'Repair Booking',
        order_id: orderId,
        handler: async (paymentResponse: any) => {
          setIsSubmitting(true);
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });

            if (verifyRes.data.success) {
              setConfirmed(true);
              clearCart();
              updateBooking({
                serviceMode,
                date: selectedDate,
                timeSlot: selectedSlot,
                customerName: fullName,
                customerPhone: phone,
                customerEmail: email,
                address: fullAddress,
                notes,
              });
            } else {
              alert('Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Failed to verify payment. If money was debited, please contact support.');
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone
        },
        theme: { color: '#1abc9c' },
        modal: { ondismiss: () => setIsSubmitting(false) }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error('Checkout initialization failed:', error);
      if (error.response?.status === 409 && error.response?.data?.error === 'STALE_QUOTE') {
        alert('Delivery fee has been updated due to surge pricing. Please review the new total before proceeding.');
        setDeliveryQuote(prev => prev ? { ...prev, fee: error.response.data.newFee } : null);
      } else {
        alert(error.response?.data?.message || 'Failed to book repair. Please try again.');
      }
      setIsSubmitting(false);
    }
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
              {cart && cart.length > 0 && (
                <div className="text-b-sm pt-2 border-t border-neutral-200 mt-2">
                  <span className="text-neutral-500 block mb-1">Spare Parts/Items:</span>
                  <ul className="list-disc list-inside">
                    {cart.map((item, idx) => (
                      <li key={idx}>{item.name} (x{item.quantity}) - ₹{item.price * item.quantity}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-b-sm border-t border-neutral-200 pt-2 mt-2"><span className="text-neutral-500">Date:</span> {selectedDate} at {selectedSlot}</p>
              <p className="text-b-sm"><span className="text-neutral-500">Mode:</span> {serviceMode}</p>
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
          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-h-sm text-neutral-950 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" /> Order Summary
            </h3>
            <ul className="space-y-3 mb-4">
              <li className="flex justify-between items-center text-b-sm">
                <span>{booking.model || 'Device Repair'} <span className="text-neutral-500">({booking.issue || 'Service'})</span></span>
                <span className="font-medium text-neutral-950">₹{bookingPrice.toLocaleString()}</span>
              </li>
              {cart.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-b-sm">
                  <span>{item.name} <span className="text-neutral-500">(x{item.quantity})</span></span>
                  <span className="font-medium text-neutral-950">₹{(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            {serviceMode === 'courier' && (
              <div className="flex justify-between items-center text-b-sm mb-3">
                <span className="text-neutral-500">Delivery Fee {isQuoting && <span className="text-xs animate-pulse text-blue-500 ml-1">(fetching...)</span>}</span>
                <span className="font-medium text-neutral-950">
                  {deliveryQuote ? `₹${deliveryQuote.fee.toLocaleString()}` : '...'}
                </span>
              </div>
            )}
            <div className="border-t border-neutral-200 pt-3 flex justify-between items-center text-b-sm font-bold text-neutral-950">
              <span>Total</span>
              <span>₹{totalCost.toLocaleString()}</span>
            </div>
          </div>
          {/* Service Mode */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-h-sm text-neutral-950 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Service Mode
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'walkin' as const, label: 'Walk-in', icon: Home },
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
          {serviceMode === 'courier' && (
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
          )}

          {/* Customer Details */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-h-sm text-neutral-950 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Billing details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">First name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Last name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Company name (optional)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {serviceMode === 'courier' && (
                <>
                  <div>
                    <label className="block text-b-xs font-medium text-neutral-700 mb-1">Country / Region *</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-b-xs font-medium text-neutral-700 mb-1">Street address *</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House number and street name"
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 mb-3"
                    />
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-b-xs font-medium text-neutral-700 mb-1">Town / City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-b-xs font-medium text-neutral-700 mb-1">State *</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                      >
                        <option value="Telangana">Telangana</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-b-xs font-medium text-neutral-700 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Email address (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Order notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={(serviceMode === 'courier' && (!selectedDate || !selectedSlot || !streetAddress || !city || !state || !pinCode)) || !firstName || !lastName || !phone || isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3.5 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
            {!isSubmitting && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
