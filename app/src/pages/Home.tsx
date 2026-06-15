import { Link } from 'react-router';
import { ArrowRight, Shield, Clock, Award, Star, ChevronRight, Monitor, Battery, Droplets, Cpu, Camera, Smartphone, Code, Tablet, Laptop, Watch, Headphones, MapPin, Phone } from 'lucide-react';
import { testimonials } from '@/data/testimonials';
import { faqItems } from '@/data/faq';
import { services } from '@/data/services';
import { brands } from '@/data/brands';

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-neutral-950">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/videos/whatsapp-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/30" />
      </div>

      <div className="container-main relative z-10 pt-24 pb-16">
        <div className="max-w-2xl">
          <p className="text-b-xs font-medium text-neutral-400 tracking-widest uppercase mb-4">
            Professional Device Restoration
          </p>
          <h1 className="text-display text-white mb-4 leading-tight">
            Fix Your Device,<br />Restore Your Life
          </h1>
          <p className="text-b-lg text-neutral-400 mb-8 max-w-lg">
            Expert repairs for 2,500+ models across all major brands. 
            Certified technicians, OEM-grade parts, 90-day warranty.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              to="/repair"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-neutral-950 rounded-lg text-b-sm font-semibold hover:bg-neutral-100 transition-colors"
            >
              Start Repair
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 text-white rounded-lg text-b-sm font-medium hover:bg-white/10 transition-colors"
            >
              Shop Spare Parts
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Shield, label: '90-Day Warranty' },
              { icon: Clock, label: 'Same-Day Service' },
              { icon: Award, label: 'Certified Technicians' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-neutral-400" />
                <span className="text-b-xs text-neutral-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Device Categories ─── */
function DeviceCategories() {
  const categories = [
    { icon: Smartphone, label: 'iPhone', href: '/devices/apple', image: '/images/category-iphone.jpg' },
    { icon: Tablet, label: 'Android', href: '/devices', image: '/images/category-android.jpg' },
    { icon: Tablet, label: 'iPad', href: '/devices/apple', image: '/images/category-iphone.jpg' },
    { icon: Laptop, label: 'MacBook', href: '/devices/apple', image: '/images/category-macbook.jpg' },
    { icon: Watch, label: 'Watch', href: '/devices/apple', image: '/images/brand-iphone.jpg' },
    { icon: Headphones, label: 'AirPods', href: '/devices/apple', image: '/images/brand-samsung.jpg' },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">What We Fix</p>
          <h2 className="text-h-xxl text-neutral-950">Choose Your Device</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ icon: Icon, label, href, image }) => (
            <Link
              key={label}
              to={href}
              className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-neutral-100"
            >
              <img
                src={image}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Icon className="w-6 h-6 text-white/80 mb-2" />
                <h3 className="text-h-sm text-white">{label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Popular Services ─── */
function PopularServices() {
  const iconMap: Record<string, React.ElementType> = {
    'screen-repair': Monitor,
    'battery-replacement': Battery,
    'water-damage': Droplets,
    'motherboard': Cpu,
    'camera-repair': Camera,
    'charging-port': Smartphone,
    'software': Code,
    'back-glass': Smartphone,
  };

  return (
    <section className="section-padding bg-neutral-50">
      <div className="container-main">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Our Services</p>
            <h2 className="text-h-xxl text-neutral-950">Popular Repairs</h2>
          </div>
          <Link to="/services" className="hidden md:flex items-center gap-1 text-b-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.slice(0, 8).map((service) => {
            const Icon = iconMap[service.slug] || Smartphone;
            return (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="group bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-card-hover transition-all"
              >
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-neutral-900 transition-colors">
                  <Icon className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-h-sm text-neutral-950 mb-1">{service.shortTitle}</h3>
                <p className="text-b-sm text-neutral-500 line-clamp-2 mb-3">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-b-xs text-neutral-400">From &#8377;{service.priceFrom.toLocaleString()}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Select Device', desc: 'Choose your device brand and model from our comprehensive catalog.' },
    { num: '02', title: 'Describe Issue', desc: 'Tell us what\'s wrong or select from common problems for your device.' },
    { num: '03', title: 'Get Quote', desc: 'Receive an instant transparent quote with part quality options.' },
    { num: '04', title: 'Book Repair', desc: 'Schedule a pickup, drop-off, or courier service at your convenience.' },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Simple Process</p>
          <h2 className="text-h-xxl text-neutral-950">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <span className="text-5xl font-bold text-neutral-100 select-none">{step.num}</span>
              <h3 className="text-h-md text-neutral-950 mt-2 mb-2">{step.title}</h3>
              <p className="text-b-sm text-neutral-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Brand Matrix ─── */
function BrandMatrix() {
  const matrixBrands = [
    {
      id: 'samsung',
      name: 'Samsung',
      href: '/devices/samsung',
      image: '/images/brand-matrix-samsung.png',
      btnText: 'Start a Samsung repair'
    },
    {
      id: 'apple',
      name: 'Apple',
      href: '/devices/apple',
      image: '/images/brand-matrix-apple.png',
      btnText: 'Start an Apple repair'
    },
    {
      id: 'google',
      name: 'Google',
      href: '/devices/google',
      image: '/images/brand-matrix-google.png',
      btnText: 'Start a Google repair'
    },
    {
      id: 'ps5',
      name: 'PS5',
      href: '/repair',
      image: '/images/brand-matrix-ps5.png',
      btnText: 'Start a PS5 repair'
    },
    {
      id: 'laptop',
      name: 'Laptop',
      href: '/repair',
      image: '/images/brand-matrix-laptop.png',
      btnText: 'Start a laptop repair'
    }
  ];

  return (
    <section className="py-20 bg-neutral-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-30" />
      <div className="container-main relative z-10">
        <div className="mb-12 max-w-3xl">
          <h2 className="text-h-xxl text-white mb-3 font-bold">The brand other brands trust</h2>
          <p className="text-b-lg text-neutral-400">
            iRepairMe is a trusted repair provider for the world's top tech brands. Cue the mic drop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {matrixBrands.map((brand) => (
            <Link
              key={brand.id}
              to={brand.href}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-card-hover transition-all duration-300"
            >
              <div className="aspect-[1.5] w-full overflow-hidden bg-neutral-50 relative border-b border-neutral-100">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              </div>
              <div className="bg-white p-5 flex flex-col justify-between flex-1 text-left">
                <span className="text-b-base sm:text-b-lg font-bold text-neutral-950 group-hover:text-neutral-800 transition-colors leading-tight">
                  {brand.btnText}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Spare Parts CTA ─── */
function SparePartsCTA() {
  return (
    <section className="py-20 bg-neutral-900">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">DIY Repairs</p>
            <h2 className="text-h-xxl text-white mb-4">IN-STOCK</h2>
            <p className="text-b-lg text-neutral-400 mb-6">
              Genuine and high-quality compatible spare parts for all your smart devices with technical precision.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-neutral-950 rounded-lg text-b-sm font-semibold hover:bg-neutral-100 transition-colors"
            >
              Shop Spare Parts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center gap-4 bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
            <Award className="w-12 h-12 text-yellow-400 shrink-0" />
            <div>
              <p className="text-h-sm text-white font-semibold">90-Day Hardware Warranty</p>
              <p className="text-b-sm text-neutral-400">Post-repair certification on all spare parts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Reviews</p>
          <h2 className="text-h-xxl text-neutral-950">What Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                ))}
              </div>
              <p className="text-b-sm text-neutral-700 mb-4">{t.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-b-sm font-medium text-neutral-950">{t.name}</p>
                  <p className="text-b-xs text-neutral-500">{t.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-b-xs text-neutral-500">{t.device}</p>
                  <p className="text-b-xs text-neutral-400">{t.service}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ Preview ─── */
function FAQPreview() {
  const previewFaq = faqItems.slice(0, 5);

  return (
    <section className="section-padding bg-neutral-50">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12">
          <div className="lg:w-1/3 lg:sticky lg:top-28">
            <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">FAQ</p>
            <h2 className="text-h-xxl text-neutral-950 mb-4">Common Questions</h2>
            <p className="text-b-sm text-neutral-500 mb-6">
              Find answers to frequently asked questions about our repair services, warranty, and process.
            </p>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-b-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
            >
              View All FAQs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="lg:w-2/3 space-y-3">
            {previewFaq.map((faq) => (
              <details key={faq.id} className="group bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-neutral-50 transition-colors">
                  <span className="text-b-sm font-medium text-neutral-950 pr-4">{faq.question}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-b-sm text-neutral-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Admin Dashboard Preview ─── */
function AdminPreview() {
  const stats = [
    { label: 'Repairs Today', value: '12', sub: '5 enquiries' },
    { label: 'Revenue This Week', value: '₹84,500', sub: '48 pending' },
    { label: 'In Diagnosis', value: '8', sub: 'Overdue: 2' },
  ];

  const stages = [
    { label: 'Order Initiation', status: 'completed' },
    { label: 'Device Receipt', status: 'completed' },
    { label: 'External Inspection', status: 'completed' },
    { label: 'Internal Diagnostics', status: 'completed' },
    { label: 'Assembly', status: 'completed' },
    { label: 'Repair Summary', status: 'active' },
  ];

  return (
    <section className="py-20 bg-neutral-100">
      <div className="container-main">
        <div className="text-center mb-10">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">For Technicians</p>
          <h2 className="text-h-xxl text-neutral-950">Control Panel Preview</h2>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden max-w-5xl mx-auto">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-h-sm text-neutral-950">iRepairMe | Control Panel & Live Price Manager</h3>
            <span className="text-b-xs text-neutral-500">Live</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {stats.map((s) => (
                <div key={s.label} className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                  <p className="text-b-xs text-neutral-500 mb-1">{s.label}</p>
                  <p className="text-h-lg text-neutral-950">{s.value}</p>
                  <p className="text-b-xs text-neutral-400">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-b-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 px-3 text-b-xs font-medium text-neutral-500">Device</th>
                    <th className="text-left py-2 px-3 text-b-xs font-medium text-neutral-500">Service</th>
                    <th className="text-left py-2 px-3 text-b-xs font-medium text-neutral-500">OEM Price</th>
                    <th className="text-left py-2 px-3 text-b-xs font-medium text-neutral-500">High-Tier</th>
                    <th className="text-left py-2 px-3 text-b-xs font-medium text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 px-3 text-neutral-950">iPhone 13</td>
                    <td className="py-2 px-3 text-neutral-600">Screen Replacement</td>
                    <td className="py-2 px-3 text-neutral-950 font-medium">&#8377;7,999</td>
                    <td className="py-2 px-3 text-neutral-950 font-medium">&#8377;4,999</td>
                    <td className="py-2 px-3"><span className="text-b-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">In Stock</span></td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 px-3 text-neutral-950">Galaxy S24 Ultra</td>
                    <td className="py-2 px-3 text-neutral-600">Screen Replacement</td>
                    <td className="py-2 px-3 text-neutral-950 font-medium">&#8377;18,999</td>
                    <td className="py-2 px-3 text-neutral-950 font-medium">&#8377;10,999</td>
                    <td className="py-2 px-3"><span className="text-b-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Low Stock</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-b-xs font-medium text-neutral-500 mb-3">Repair Pipeline</p>
              <div className="flex flex-wrap gap-2">
                {stages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.status === 'completed' ? 'bg-green-500' : stage.status === 'active' ? 'bg-blue-500 animate-pulse-dot' : 'bg-neutral-300'}`} />
                    <span className="text-b-xs text-neutral-600">{stage.label}</span>
                    {i < stages.length - 1 && <ChevronRight className="w-3 h-3 text-neutral-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Store Location ─── */
function StoreLocation() {
  return (
    <section className="section-padding bg-white border-t border-neutral-100">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Our Store</p>
          <h2 className="text-h-xxl text-neutral-950 font-bold">Visit iRepairMe</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map Container */}
          <div className="lg:col-span-7 relative min-h-[350px] lg:min-h-[450px] rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.2419758442516!2d78.41227177493498!3d17.400171383489187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9784d8bcbce7%3A0x62aee93416c61f82!2siRepairMe%20-%20Service%20Center!5e0!3m2!1sen!2sin!4v1781268696731!5m2!1sen!2sin" 
              className="w-full h-full border-0 absolute inset-0" 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="iRepairMe Store Location Map"
            />
          </div>

          {/* Details Card */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-neutral-50 border border-neutral-200 rounded-2xl p-6 lg:p-8 animate-fade-in">
            <div>
              <h3 className="text-h-sm text-neutral-950 mb-6 font-semibold">iRepairMe - Service Center</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-neutral-200 shadow-sm">
                    <MapPin className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Store Address</h4>
                    <p className="text-b-sm text-neutral-950 mt-1 leading-relaxed">
                      Shop No 203, 2nd Floor, Podium Mall,<br />
                      Daulat Gulshan Colony, Janaki Nagar Colony, Toli Chowki,<br />
                      Hyderabad, Telangana 500008
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-neutral-200 shadow-sm">
                    <Clock className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Operating Hours</h4>
                    <p className="text-b-sm text-neutral-950 mt-1">
                      Mon - Sat: 10:00 AM - 8:00 PM<br />
                      Sunday: 11:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-neutral-200 shadow-sm">
                    <Phone className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="text-b-xs font-semibold text-neutral-500 uppercase tracking-wider">Contact Info</h4>
                    <p className="text-b-sm text-neutral-950 mt-1">
                      Phone: <a href="tel:+918919076275" className="hover:text-neutral-600 transition-colors font-medium">+91 89190 76275</a>
                    </p>
                    <p className="text-b-sm text-neutral-950">
                      Email: <a href="mailto:support@irepairme.in" className="hover:text-neutral-600 transition-colors font-medium">support@irepairme.in</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a 
                href="https://maps.google.com/?q=iRepairMe+-+Service+Center+Toli+Chowki" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-neutral-950 text-white rounded-xl text-b-sm font-semibold hover:bg-neutral-800 transition-all text-center flex-1 shadow-sm"
              >
                Get Directions
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link 
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-neutral-300 bg-white text-neutral-700 rounded-xl text-b-sm font-medium hover:bg-neutral-50 hover:text-neutral-950 transition-all text-center flex-1"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Home Page ─── */
export default function Home() {
  return (
    <>
      <HeroSection />
      <DeviceCategories />
      <PopularServices />
      <HowItWorks />
      <BrandMatrix />
      <SparePartsCTA />
      <Testimonials />
      <FAQPreview />
      <StoreLocation />
    </>
  );
}
