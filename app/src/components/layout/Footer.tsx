import { Link } from 'react-router';
import { Mail, Phone, MapPin } from 'lucide-react';

const serviceLinks = [
  { label: 'iPhone Repair', href: '/services/screen-repair' },
  { label: 'MacBook Repair', href: '/services/motherboard' },
  { label: 'Android Repair', href: '/services/screen-repair' },
  { label: 'iPad Repair', href: '/services/screen-repair' },
  { label: 'Apple Watch Repair', href: '/services/battery-replacement' },
  { label: 'Water Damage', href: '/services/water-damage' },
];

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/contact' },
];

const supportLinks = [
  { label: 'Order Tracking', href: '/track-repair' },
  { label: 'Warranty Policy', href: '/repair-warranty' },
  { label: 'Privacy Hub', href: '/privacy' },
];

const legalLinks = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Quality Assurance', href: '/repair-warranty' },
  { label: 'Refund Policy', href: '/refund-policy' },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      <div className="container-main py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link to="/" className="inline-flex mb-4 bg-white px-2.5 py-1 rounded-xl shadow-sm border border-neutral-200/50 hover:opacity-90 transition-opacity">
              <img src="/images/logo.png" alt="iRepairMe Logo" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-b-sm text-neutral-400 mb-4 max-w-xs">
              Professional device restoration with certified precision. 90-day warranty on all repairs.
            </p>
            <div className="space-y-2">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-b-sm text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </a>
              <a href="mailto:support@irepairme.in" className="flex items-center gap-2 text-b-sm text-neutral-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                support@irepairme.in
              </a>
              <div className="flex items-start gap-2 text-b-sm text-neutral-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>42, MG Road, Bangalore - 560001</span>
              </div>
            </div>
          </div>

          {/* Service */}
          <div>
            <h4 className="text-b-sm font-semibold text-white mb-4">Service</h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-b-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-b-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-b-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-b-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-b-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-b-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-b-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-b-xs text-neutral-500">
            &copy; 2026 iRepairMe. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-b-xs text-neutral-500 hover:text-white transition-colors">
              WhatsApp
            </a>
            <a href="#" className="text-b-xs text-neutral-500 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="#" className="text-b-xs text-neutral-500 hover:text-white transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
