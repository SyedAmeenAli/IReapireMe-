import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Phone, User, ShoppingCart } from 'lucide-react';
import { useStore } from '@/store/useStore';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Devices', href: '/devices' },
  { label: 'Spares', href: '/shop' },
  { label: 'Learn', href: '/learn' },
  { label: 'Track Order', href: '/track-repair' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { cart, setCartOpen, isLoggedIn, setLoginModalOpen } = useStore();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isTransparent = isHome && !scrolled && !mobileOpen;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? 'bg-transparent border-b border-white/10'
            : 'bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-nav'
        }`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 bg-white px-2.5 py-1 rounded-xl shadow-sm border border-neutral-200/50">
              <img src="/images/logo.png" alt="iRepairMe Logo" className="h-8 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 rounded-md text-b-sm font-medium transition-colors ${
                    isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                  } ${location.pathname === link.href ? (isTransparent ? 'text-white' : 'text-neutral-950') : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <a
                href="tel:+919876543210"
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-md text-b-sm font-medium transition-colors ${
                  isTransparent ? 'text-white/80 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className="hidden xl:inline">+91 98765 43210</span>
              </a>

              <button
                onClick={() => setCartOpen(true)}
                className={`relative p-2 rounded-md transition-colors ${
                  isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <Link
                to="/my-account"
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-md text-b-sm font-medium transition-colors ${
                  isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Account</span>
              </Link>

              {/* Repair CTA — always visible, right of navbar */}
              <Link
                to="/repair"
                className={`repair-nav-btn ${isTransparent ? 'repair-nav-btn-transparent' : ''}`}
              >
                Repair
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2 rounded-md transition-colors ${
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-[72px] left-0 right-0 bg-white border-b border-neutral-200 shadow-lg p-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-3 rounded-lg text-b-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'bg-neutral-100 text-neutral-950'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-neutral-200 mt-2 pt-2">
                <Link
                  onClick={() => setMobileOpen(false)}
                  to="/my-account"
                  className="block w-full text-left px-4 py-3 rounded-lg text-b-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  My Account
                </Link>
                <a href="tel:+919876543210" className="flex items-center gap-2 px-4 py-3 rounded-lg text-b-sm font-medium text-neutral-600 hover:bg-neutral-50">
                  <Phone className="w-4 h-4" />
                  +91 98765 43210
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
