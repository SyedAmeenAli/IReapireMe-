import { Routes, Route, useLocation, Link } from 'react-router';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginModal from '@/components/shared/LoginModal';
import CartDrawer from '@/components/shared/CartDrawer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import QueryWidget from '@/components/shared/QueryWidget';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Devices from '@/pages/Devices';
import Repair from '@/pages/Repair';
import Shop from '@/pages/Shop';
import Booking from '@/pages/Booking';
import SparePartsCheckout from '@/pages/SparePartsCheckout';
import TrackRepair from '@/pages/TrackRepair';
import MyAccount from '@/pages/MyAccount';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import FAQPage from '@/pages/FAQPage';
import Blog from '@/pages/Blog';
import Learn from '@/pages/Learn';
import Legal from '@/pages/Legal';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isRepair = location.pathname === '/repair';

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Full navbar — hidden on /admin and /repair */}
      {!isAdmin && !isRepair && <Header />}
      {/* Minimal logo-only bar on /repair */}
      {isRepair && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
          <div className="container-main">
            <div className="flex items-center h-[72px]">
              <Link to="/" className="flex items-center gap-2 shrink-0 bg-white px-2.5 py-1 rounded-xl shadow-sm border border-neutral-200/50">
                <img src="/images/logo.png" alt="iRepairMe Logo" className="h-11 w-auto object-contain" />
              </Link>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:serviceSlug" element={<Services />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:brandSlug" element={<Devices />} />
          <Route path="/devices/:brandSlug/:modelSlug" element={<Devices />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<Shop />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking/confirmation" element={<Booking />} />
          <Route path="/checkout" element={<SparePartsCheckout />} />
          <Route path="/track-repair" element={<TrackRepair />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/terms" element={<Legal />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="/refund-policy" element={<Legal />} />
          <Route path="/repair-warranty" element={<Legal />} />
          <Route path="/pickup-delivery-policy" element={<Legal />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {/* Footer & WhatsApp — hidden on /admin and /repair */}
      {!isAdmin && !isRepair && <Footer />}
      <LoginModal />
      <CartDrawer />
      {!isAdmin && !isRepair && <WhatsAppButton />}
      {!isAdmin && !isRepair && <QueryWidget />}
    </div>
  );
}
