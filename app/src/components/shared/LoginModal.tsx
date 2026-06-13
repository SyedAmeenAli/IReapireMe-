import { useState } from 'react';
import { X, Smartphone, ArrowRight, Check, Mail, Lock, User as UserIcon, MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';
import api from '@/lib/api';

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, login } = useStore();
  
  // Method toggles
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  
  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Email state
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  // Error state
  const [error, setError] = useState('');

  if (!loginModalOpen) return null;

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
        login({
          phone: response.data.user?.phone || phone,
          name: response.data.user?.name || 'Customer',
          token: response.data.token,
          isAdmin: response.data.user?.role === 'ADMIN',
          userId: response.data.user?.id
        });
        setLoginModalOpen(false);
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
          login({
            email: response.data.user.email,
            phone: response.data.user.phone,
            name: response.data.user.name,
            token: response.data.token,
            isAdmin: response.data.user.role === 'ADMIN',
            userId: response.data.user.id
          });
          setLoginModalOpen(false);
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
          login({
            email: loginResponse.data.user.email,
            phone: loginResponse.data.user.phone,
            name: loginResponse.data.user.name,
            token: loginResponse.data.token,
            isAdmin: loginResponse.data.user.role === 'ADMIN',
            userId: loginResponse.data.user.id
          });
          setLoginModalOpen(false);
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

  const closeModal = () => {
    setLoginModalOpen(false);
    setError('');
    setPhone('');
    setOtp('');
    setStep('phone');
    setEmail('');
    setPassword('');
    setName('');
    setSignupPhone('');
    setAddress('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-neutral-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-neutral-500" />
        </button>

        {/* Method Selector Tabs */}
        <div className="flex border-b border-neutral-200 mb-6">
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
        </div>

        {method === 'phone' ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-neutral-700" />
              </div>
              <h3 className="text-h-md text-neutral-950 mb-1">
                {step === 'phone' ? 'Login with OTP' : 'Enter OTP'}
              </h3>
              <p className="text-b-sm text-neutral-500">
                {step === 'phone'
                  ? 'Enter your phone number to receive a one-time password'
                  : `We've sent a 4-digit code to +91 ${phone}`}
              </p>
            </div>

            {step === 'phone' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1.5">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <span className="text-b-sm text-neutral-500 font-medium">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      maxLength={10}
                    />
                  </div>
                  {error && <p className="text-b-xs text-red-500 mt-1">{error}</p>}
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : 'Send OTP'}
                  {!isSending && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1.5">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4-digit OTP"
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-center tracking-[0.5em] font-mono"
                    maxLength={4}
                  />
                  {error && <p className="text-b-xs text-red-500 mt-1">{error}</p>}
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-neutral-700" />
              </div>
              <h3 className="text-h-md text-neutral-950 mb-1">
                {emailMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h3>
              <p className="text-b-sm text-neutral-500">
                {emailMode === 'login'
                  ? 'Sign in to access your repairs and details'
                  : 'Register to start tracking your devices'}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-b-xs text-center font-medium animate-shake">
                  {error}
                </div>
              )}

              {emailMode === 'register' && (
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-b-xs font-medium text-neutral-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {emailMode === 'register' && (
                <>
                  <div>
                    <label className="block text-b-xs font-medium text-neutral-700 mb-1">Phone Number (Optional)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-b-sm text-neutral-500 font-medium">+91</span>
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-b-xs font-medium text-neutral-700 mb-1">Address (Optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Street Name"
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isEmailSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isEmailSubmitting ? 'Processing...' : (emailMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>

              <p className="text-center text-b-xs text-neutral-500 mt-4">
                {emailMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode(emailMode === 'login' ? 'register' : 'login');
                    setError('');
                  }}
                  className="text-neutral-950 font-semibold hover:underline"
                >
                  {emailMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </form>
          </div>
        )}

        <p className="text-b-xs text-neutral-400 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
