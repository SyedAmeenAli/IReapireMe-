import { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function QueryWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('WhatsApp');
  const [explainYourIssue, setExplainYourIssue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const charLimit = 500;

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setPreferredContactMethod('WhatsApp');
    setExplainYourIssue('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowTeaser(false);
    resetForm();
  };

  const handleTeaserClick = () => {
    setShowTeaser(false);
    setIsOpen(true);
  };

  const handleTeaserDismiss = () => {
    setShowTeaser(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!customerPhone || !preferredContactMethod || !explainYourIssue) {
      setError('Please fill in all required fields.');
      return;
    }

    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(customerPhone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (explainYourIssue.length > charLimit) {
      setError(`Issue description cannot exceed ${charLimit} characters.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/repairs/query', {
        customerName: customerName.trim(),
        customerPhone,
        preferredContactMethod,
        explainYourIssue: explainYourIssue.trim()
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('You already have a pending query. We will contact you soon.');
      } else {
        setError(err.response?.data?.message || 'Failed to submit query. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Minimized Floating Toggle Button */}
      {!isOpen && !showTeaser && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg transition-all hover:scale-105 duration-200"
          aria-label="Get a Repair Quote"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Floating Teaser Card (sits next to WhatsApp button) */}
      {showTeaser && !isOpen && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-[88px] md:bottom-6 z-40 w-auto md:w-72 bg-white border border-neutral-200 rounded-2xl shadow-xl p-6 text-center animate-slide-in-right">
          <h3 className="font-bold text-neutral-900 text-b-lg mb-4 leading-tight">Get Instant Quote!</h3>
          <button
            onClick={handleTeaserClick}
            className="w-full py-3 bg-[#eaeaea] hover:bg-neutral-200 text-neutral-900 rounded-full font-semibold transition-colors mb-3.5 text-b-sm"
          >
            Click Here
          </button>
          <button
            onClick={handleTeaserDismiss}
            className="text-sky-700 hover:text-sky-800 hover:underline text-b-xs transition-colors font-medium"
          >
            No! I am just browsing!
          </button>
        </div>
      )}

      {/* Expanded Widget Card */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-[88px] md:bottom-6 z-50 w-auto md:w-full md:max-w-sm bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-slide-in-right">
          {/* Card Header */}
          <div className="bg-neutral-950 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-b-base">Quick Quote Request</h3>
              <p className="text-xs text-neutral-400">Tell us your issue and we will get back to you</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-neutral-400 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-5 max-h-[75vh] overflow-y-auto">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="w-12 h-12 text-teal-500 mb-3" />
                <h4 className="font-bold text-neutral-950 text-b-base mb-1">Request Submitted!</h4>
                <p className="text-b-xs text-neutral-500">Thanks! We&apos;ll contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-b-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Your Name <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Preferred Contact Method *
                  </label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e) => setPreferredContactMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-neutral-800"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone Call">Phone Call</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Explain Your Issue *
                    </label>
                    <span className={`text-[10px] ${explainYourIssue.length > charLimit ? 'text-red-500' : 'text-neutral-400'}`}>
                      {explainYourIssue.length}/{charLimit}
                    </span>
                  </div>
                  <textarea
                    required
                    value={explainYourIssue}
                    onChange={(e) => setExplainYourIssue(e.target.value.slice(0, charLimit))}
                    placeholder="Describe what is wrong with your device..."
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || explainYourIssue.length === 0 || customerPhone.length !== 10}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-b-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
