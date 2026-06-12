import { Link, useParams } from 'react-router';
import { Search, ChevronRight, ArrowLeft, Smartphone, Filter } from 'lucide-react';
import { brands, getBrandBySlug } from '@/data/brands';
import { deviceModels, getModelsByBrand, getModelBySlug } from '@/data/devices';
import { pricingData } from '@/data/pricing';
import { services } from '@/data/services';
import { useState, useMemo } from 'react';

export default function Devices() {
  const { brandSlug, modelSlug } = useParams<{ brandSlug?: string; modelSlug?: string }>();

  if (modelSlug && brandSlug) {
    const model = getModelBySlug(modelSlug);
    const brand = getBrandBySlug(brandSlug);
    if (model && brand) return <ModelDetail model={model} brand={brand} />;
  }

  if (brandSlug) {
    const brand = getBrandBySlug(brandSlug);
    if (brand) return <BrandDetail brand={brand} />;
  }

  return <BrandGrid />;
}

/* ─── Brand Grid ─── */
function BrandGrid() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search.trim()) return brands.filter((b) => b.id !== 'other');
    return brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const deviceCategories = [
    { label: 'iPhone', type: 'iphone', image: '/images/category-iphone.jpg' },
    { label: 'Android', type: 'android', image: '/images/category-android.jpg' },
    { label: 'iPad', type: 'ipad', image: '/images/category-iphone.jpg' },
    { label: 'MacBook', type: 'macbook', image: '/images/category-macbook.jpg' },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Device Catalog</p>
          <h1 className="text-h-xxl text-neutral-950 mb-4">Find Your Device</h1>
          <p className="text-b-lg text-neutral-500 max-w-2xl mx-auto">
            Browse our comprehensive catalog of supported devices organized by brand and series.
          </p>
        </div>

        {/* Device Type Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {deviceCategories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSearch(cat.label === 'Android' ? '' : cat.label.toLowerCase())}
              className="relative overflow-hidden rounded-xl aspect-[16/9] group"
            >
              <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <span className="absolute inset-0 flex items-center justify-center text-h-sm text-white font-semibold">
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands (e.g., Apple, Samsung)..."
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((brand) => (
            <Link
              key={brand.id}
              to={`/devices/${brand.slug}`}
              className="group bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-card-hover transition-all"
            >
              <h3 className="text-h-sm text-neutral-950 mb-1">{brand.name}</h3>
              <p className="text-b-xs text-neutral-500 mb-3">{brand.deviceTypes.length} categories</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {brand.popularModels.slice(0, 3).map((m) => (
                  <span key={m} className="text-b-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{m}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-b-xs text-neutral-400 group-hover:text-neutral-950 transition-colors">
                View Models <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Brand Detail ─── */
function BrandDetail({ brand }: { brand: NonNullable<ReturnType<typeof getBrandBySlug>> }) {
  const models = getModelsByBrand(brand.slug);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return models.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || m.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [models, search, typeFilter]);

  const types = [...new Set(models.map((m) => m.type))];

  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <Link to="/devices" className="inline-flex items-center gap-1 text-b-sm text-neutral-500 hover:text-neutral-950 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Brands
        </Link>

        <div className="mb-10">
          <h1 className="text-h-xxl text-neutral-950 mb-2">{brand.name}</h1>
          <p className="text-b-lg text-neutral-500">{brand.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${brand.name} models...`}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="all">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-b-sm text-neutral-500">No models found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((model) => (
              <Link
                key={model.id}
                to={`/devices/${brand.slug}/${model.slug}`}
                className="group bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-h-sm text-neutral-950 group-hover:text-neutral-700 transition-colors">{model.name}</h3>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-950 transition-colors shrink-0" />
                </div>
                <p className="text-b-xs text-neutral-500 mb-3">Released {model.releaseYear}</p>
                <div className="flex flex-wrap gap-1">
                  {model.popularIssues.slice(0, 2).map((issue) => (
                    <span key={issue} className="text-b-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{issue}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Model Detail ─── */
function ModelDetail({ model, brand }: { model: NonNullable<ReturnType<typeof getModelBySlug>>; brand: NonNullable<ReturnType<typeof getBrandBySlug>> }) {
  const pricing = pricingData.filter((p) => p.deviceModel === model.name);
  const availableServices = services.filter((s) => model.services.includes(s.slug));

  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <div className="flex items-center gap-2 text-b-sm text-neutral-500 mb-8">
          <Link to="/devices" className="hover:text-neutral-950 transition-colors">Brands</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/devices/${brand.slug}`} className="hover:text-neutral-950 transition-colors">{brand.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-950">{model.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h1 className="text-h-xxl text-neutral-950 mb-2">{model.name}</h1>
            <p className="text-b-sm text-neutral-500 mb-6">{brand.name} &middot; Released {model.releaseYear}</p>

            {/* Pricing Table */}
            {pricing.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-8">
                <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
                  <h3 className="text-h-sm text-neutral-950">Repair Pricing</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left py-3 px-5 text-b-xs font-medium text-neutral-500">Service</th>
                      <th className="text-left py-3 px-5 text-b-xs font-medium text-neutral-500">Time</th>
                      <th className="text-left py-3 px-5 text-b-xs font-medium text-neutral-500">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.map((p) => (
                      <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                        <td className="py-3 px-5 text-b-sm text-neutral-950">{p.service}</td>
                        <td className="py-3 px-5 text-b-xs text-neutral-500">{p.estimatedTime}</td>
                        <td className="py-3 px-5">
                          <span className="text-b-sm font-semibold text-neutral-950">
                            {p.price > 0 ? `₹${p.price.toLocaleString()}` : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Available Services */}
            <h3 className="text-h-lg text-neutral-950 mb-4">Available Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableServices.map((s) => (
                <Link
                  key={s.id}
                  to={`/services/${s.slug}`}
                  className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                >
                  <span className="text-b-sm text-neutral-950">{s.shortTitle}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
              <h3 className="text-h-sm text-neutral-950 mb-3">Common Issues</h3>
              <ul className="space-y-2">
                {model.popularIssues.map((issue) => (
                  <li key={issue} className="flex items-center gap-2 text-b-sm text-neutral-600">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/repair"
              className="block w-full text-center px-6 py-3.5 bg-neutral-950 text-white rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Book Repair
            </Link>

            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-3.5 border border-neutral-300 text-neutral-700 rounded-lg text-b-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
