import { useState, useEffect } from 'react';
import { User, Phone, Mail, ChevronRight, LogOut, Package, Copy } from 'lucide-react';
import { Link } from 'react-router';
import { useStore } from '@/store/useStore';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { statusColors, statusLabels } from './TrackRepair';

export default function MyAccount() {
  const { clearCart, login: storeLogin, logout: storeLogout } = useStore();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login form state
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data state
  const [myTickets, setMyTickets] = useState<any[]>([]);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    alert('Ticket ID copied to clipboard: ' + text);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        fetchMyTickets(currentUser.email);
        storeLogin(currentUser.email || '');
      } else {
        storeLogout();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMyTickets = async (emailToSearch: string | null) => {
    if (!emailToSearch) return;
    try {
      const q = query(collection(db, 'tickets'), where('customerEmail', '==', emailToSearch));
      const querySnapshot = await getDocs(q);
      const tickets = querySnapshot.docs.map(doc => doc.data());
      // Sort by latest first (assuming createdAt exists)
      tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyTickets(tickets);
    } catch (e) {
      console.error("Error fetching tickets:", e);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset link sent! Check your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save user to Firestore 'users' collection
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    storeLogout();
    clearCart();
    setMyTickets([]);
  };

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white p-8 border border-neutral-200 rounded-2xl shadow-sm">
          <div className="text-center mb-6">
            <User className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-h-sm text-neutral-950 font-bold">
              {isForgotPasswordView ? 'Reset Password' : (isLoginView ? 'Welcome Back' : 'Create an Account')}
            </h2>
            <p className="text-b-xs text-neutral-500 mt-1">
              {isForgotPasswordView ? 'Enter your email to receive a reset link' : 'Sign in to view your repair history and track orders'}
            </p>
          </div>
          
          {isForgotPasswordView ? (
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-b-xs text-center font-medium">
                  {error}
                </div>
              )}
              {resetMessage && (
                <div className="bg-green-50 text-green-600 border border-green-200 rounded-xl p-3 text-b-xs text-center font-medium">
                  {resetMessage}
                </div>
              )}
              <div>
                <label className="block text-b-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <button
                type="submit" disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 rounded-lg text-b-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="text-center text-b-xs text-neutral-500 mt-4">
                Remember your password?{' '}
                <button type="button" onClick={() => { setIsForgotPasswordView(false); setError(''); setResetMessage(''); }} className="text-neutral-950 font-medium hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleAuth}>
              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-b-xs text-center font-medium">
                  {error}
                </div>
              )}
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
                {isLoginView && (
                  <div className="text-right mt-1">
                    <button type="button" onClick={() => { setIsForgotPasswordView(true); setError(''); }} className="text-b-xs text-neutral-500 hover:text-neutral-950 hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit" disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 rounded-lg text-b-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
              </button>
              <p className="text-center text-b-xs text-neutral-500 mt-4">
                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="text-neutral-950 font-medium hover:underline">
                  {isLoginView ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </form>
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
                <h2 className="text-h-sm text-neutral-950 font-semibold">{user.email}</h2>
                <div className="flex items-center gap-3 text-b-xs text-neutral-500 mt-1">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Registered Customer</span>
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
              <p className="text-b-sm text-neutral-500">You haven't booked any repairs yet with this email.</p>
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
