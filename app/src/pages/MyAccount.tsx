import { useState, useEffect } from 'react';
import { User, Phone, Mail, ChevronRight, LogOut, Package, Copy, Smartphone, ArrowRight, Check, Lock, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { useStore } from '@/store/useStore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { statusColors, statusLabels } from './TrackRepair';
import api from '@/lib/api';

export default function MyAccount() {
  const { clearCart, login: storeLogin, logout: storeLogout, isLoggedIn, userPhone, userEmail, userName } = useStore();

  // Login method toggle: 'email' or 'phone'
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  // Email form state
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Shared error/status state
  const [error, setError] = useState('');

  // Data state
  const [myTickets, setMyTickets] = useState<any[]>([]);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    alert('Ticket ID copied to clipboard: ' + text);
  };

  // Fetch tickets matching user's email or phone number
  const fetchMyTickets = async (emailToSearch: string | null, phoneToSearch: string | null) => {
    try {
      const ticketsMap = new Map<string, any>();

      // Query 1: by Email (if email exists and is not temp)
      if (emailToSearch && !emailToSearch.endsWith('@irepairme.temp')) {
        const qEmail = query(collection(db, 'tickets'), where('customerEmail', '==', emailToSearch));
        const querySnapshotEmail = await getDocs(qEmail);
        querySnapshotEmail.docs.forEach(doc => {
          const data = doc.data();
          ticketsMap.set(data.ticketId, data);
        });
      }

      // Query 2: by Phone (if phone exists)
      if (phoneToSearch) {
        const cleanedPhone = phoneToSearch.replace(/\D/g, '').slice(-10);
        if (cleanedPhone.length === 10) {
          const qPhone = query(collection(db, 'tickets'), where('customerPhone', '==', cleanedPhone));
          const querySnapshotPhone = await getDocs(qPhone);
          querySnapshotPhone.docs.forEach(doc => {
            const data = doc.data();
            ticketsMap.set(data.ticketId, data);
          });
        }
      }

      const tickets = Array.from(ticketsMap.values());
      // Sort by latest first (assuming createdAt exists)
      tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyTickets(tickets);
    } catch (e) {
      console.error("Error fetching tickets:", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyTickets(userEmail, userPhone);
    } else {
      setMyTickets([]);
    }
  }, [isLoggedIn, userEmail, userPhone]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setIsSending(true);

    try {
      const response = await api.post('/auth/send-otp', { phone });
      setIsSending(false);
      if (response.data.success) {
        setStep('otp');
      } else {
        setError(response.data.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setIsSending(false);
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setIsVerifying(true);

    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      setIsVerifying(false);
      if (response.data.success) {
        storeLogin({
          phone: response.data.user?.phone || phone,
          name: response.data.user?.name || 'Customer',
          token: response.data.token,
          isAdmin: response.data.user?.role === 'ADMIN',
          userId: response.data.user?.id
        });
        setPhone('');
        setOtp('');
        setStep('phone');
      } else {
        setError(response.data.message || 'Incorrect OTP. Please try again.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || 'Incorrect OTP. Please try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsEmailSubmitting(true);
    try {
      if (emailMode === 'login') {
        const response = await api.post('/auth/login', { email, password });
        setIsEmailSubmitting(false);
        if (response.data.token) {
          storeLogin({
            email: response.data.user.email,
            phone: response.data.user.phone,
            name: response.data.user.name,
            token: response.data.token,
            isAdmin: response.data.user.role === 'ADMIN',
            userId: response.data.user.id
          });
          setEmail('');
          setPassword('');
        } else {
          setError('Failed to login. Missing token.');
        }
      } else {
        if (!name) {
          setError('Please enter your name');
          setIsEmailSubmitting(false);
          return;
        }

        // Register user
        await api.post('/auth/register', {
          name,
          email,
          password,
          phone: signupPhone ? `+91${signupPhone}` : undefined,
          address: address || undefined
        });

        // Automatically log in
        const loginResponse = await api.post('/auth/login', { email, password });
        setIsEmailSubmitting(false);
        if (loginResponse.data.token) {
          storeLogin({
            email: loginResponse.data.user.email,
            phone: loginResponse.data.user.phone,
            name: loginResponse.data.user.name,
            token: loginResponse.data.token,
            isAdmin: loginResponse.data.user.role === 'ADMIN',
            userId: loginResponse.data.user.id
          });
          setEmail('');
          setPassword('');
          setName('');
          setSignupPhone('');
          setAddress('');
        } else {
          setError('Registered successfully. Please login manually.');
          setEmailMode('login');
        }
      }
    } catch (err: any) {
      setIsEmailSubmitting(false);
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || 'Authentication failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    storeLogout();
    clearCart();
    setMyTickets([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white p-8 border border-neutral-200 rounded-2xl shadow-sm">
          {/* Method Selector Tabs */}
          <div className="flex border-b border-neutral-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setMethod('email');
                setError('');
              }}
              className={`flex-1 pb-3 text-b-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                method === 'email'
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('phone');
                setError('');
              }}
              className={`flex-1 pb-3 text-b-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                method === 'phone'
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Phone OTP
            </button>
          </div>

          {method === 'email' ? (
            <div>
              <div className="text-center mb-6">
                <User className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-h-sm text-neutral-950 font-bold">
                  {emailMode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="text-b-xs text-neutral-500 mt-1">
                  {emailMode === 'login'
                    ? 'Sign in to view your repair history and track orders'
                    : 'Register to start tracking your repairs'}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleEmailAuth}>
                {error && (
                  <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-b-xs text-center font-medium">
                    {error}
                  </div>
                )}

                {emailMode === 'register' && (
                  <div>
                    <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      placeholder="John Doe"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    placeholder="••••••••"
                  />
                </div>

                {emailMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Phone Number (Optional)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-b-sm text-neutral-500 font-medium">+91</span>
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                          placeholder="98765 43210"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Address (Optional)</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                        placeholder="123 Street Name"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isEmailSubmitting}
                  className="w-full flex justify-center py-3 px-4 rounded-lg text-b-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isEmailSubmitting ? 'Processing...' : (emailMode === 'login' ? 'Sign In' : 'Sign Up')}
                </button>

                <p className="text-center text-b-xs text-neutral-500 mt-4">
                  {emailMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode(emailMode === 'login' ? 'register' : 'login');
                      setError('');
                    }}
                    className="text-neutral-950 font-medium hover:underline"
                  >
                    {emailMode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </form>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <Smartphone className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-h-sm text-neutral-950 font-bold">
                  {step === 'phone' ? 'Login with OTP' : 'Enter OTP'}
                </h2>
                <p className="text-b-xs text-neutral-500 mt-1">
                  {step === 'phone'
                    ? 'Enter your phone number to receive a one-time password'
                    : `We've sent a 4-digit code to +91 ${phone}`}
                </p>
              </div>

              {step === 'phone' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <span className="text-b-sm text-neutral-500 font-medium">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                        maxLength={10}
                      />
                    </div>
                    {error && <p className="text-b-xs text-red-500 mt-1">{error}</p>}
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={isSending}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? 'Sending...' : 'Send OTP'}
                    {!isSending && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">OTP Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Enter 4-digit OTP"
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 text-center tracking-[0.5em] font-mono"
                      maxLength={4}
                    />
                    {error && <p className="text-b-xs text-red-500 mt-1">{error}</p>}
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      'Verifying...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Verify & Login
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                      setError('');
                    }}
                    className="w-full text-center text-b-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Change phone number
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-neutral-50">
      <div className="container-main max-w-3xl">
        <h1 className="text-h-xxl text-neutral-950 mb-8">My Account</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-neutral-600" />
              </div>
              <div>
                <h2 className="text-h-sm text-neutral-950 font-semibold">{userName || userEmail || userPhone}</h2>
                <div className="flex flex-col text-b-xs text-neutral-500 mt-1 gap-1">
                  {userEmail && !userEmail.endsWith('@irepairme.temp') && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {userEmail}</span>
                  )}
                  {userPhone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {userPhone}</span>
                  )}
                  <span className="text-neutral-400">Registered Customer</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-b-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Repair History */}
        <h3 className="text-h-md text-neutral-950 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" /> My Repairs
        </h3>
        
        <div className="space-y-4">
          {myTickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
              <p className="text-b-sm text-neutral-500">You haven't booked any repairs yet.</p>
              <Link to="/booking" className="mt-4 inline-block text-b-sm font-medium text-neutral-950 hover:underline">Book a Repair</Link>
            </div>
          ) : (
            myTickets.map((ticket) => (
              <Link
                key={ticket.ticketId}
                to="/track-repair"
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-neutral-100 pl-2 pr-1 py-0.5 rounded-md border border-neutral-200">
                      <span className="text-b-xs font-mono font-medium text-neutral-600">{ticket.ticketId}</span>
                      <button
                        onClick={(e) => handleCopy(e, ticket.ticketId)}
                        className="p-1 hover:bg-neutral-200 rounded text-neutral-500 transition-colors"
                        title="Copy Ticket ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <span className={`text-b-xs px-2.5 py-0.5 rounded-full ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[ticket.status] || ticket.status}
                    </span>
                  </div>
                  <p className="text-b-sm font-semibold text-neutral-950">{ticket.brand} {ticket.deviceModel}</p>
                  <p className="text-b-xs text-neutral-500 mt-0.5">{ticket.issueDescription}</p>
                  <p className="text-b-xs text-neutral-400 mt-2">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0 flex items-center sm:block">
                  <p className="text-b-sm font-bold text-neutral-950 flex-1">₹{ticket.estimatedCost}</p>
                  <ChevronRight className="w-5 h-5 text-neutral-400 ml-auto" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
