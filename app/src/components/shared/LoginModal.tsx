import { useState } from 'react';
import { X, Smartphone, ArrowRight, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, login } = useStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');

  if (!loginModalOpen) return null;

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    login(phone, 'Customer');
    setLoginModalOpen(false);
    setPhone('');
    setOtp('');
    setStep('phone');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => setLoginModalOpen(false)} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-up">
        <button
          onClick={() => setLoginModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5 text-neutral-500" />
        </button>

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
              className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Send OTP
              <ArrowRight className="w-4 h-4" />
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
              className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Check className="w-4 h-4" />
              Verify & Login
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

        <p className="text-b-xs text-neutral-400 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
