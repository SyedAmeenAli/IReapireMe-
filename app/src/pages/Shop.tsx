import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Search, ShoppingCart, Star, Filter, ArrowLeft, Check, X, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import api from '@/lib/api';

export default function Shop() {
  const { slug } = useParams<{ slug?: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchProducts() {
      try {
        const response = await api.get('/shop/products');
        if (active) {
          const mapped = (response.data || []).map((p: any) => ({
            id: p.id || p._id,
            slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            name: p.name,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice,
            category: p.category,
            subcategory: p.subcategory || '',
            brand: p.brand || '',
            compatibleModels: p.compatibleModels || [],
            quality: p.quality || 'oem',
            image: p.imageUrl || p.image || '/images/service-screen.jpg',
            inStock: p.inStock ?? (p.stockQuantity > 0),
            stockCount: p.stockQuantity ?? p.stockCount ?? 0,
            rating: p.rating ?? 5.0,
            reviewCount: p.reviewCount ?? 0,
            features: p.features || [],
          }));
          setProducts(mapped);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to fetch spares products:', err);
        if (active) {
          setError('Failed to load spare parts. Please try again.');
          setLoading(false);
        }
      }
    }
    fetchProducts();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="pt-24 pb-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-4"></div>
        <p className="text-b-sm text-neutral-500">Loading spare parts catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-b-sm text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-neutral-950 text-white rounded-lg text-b-sm hover:bg-neutral-800 transition-colors font-medium">
          Retry
        </button>
      </div>
    );
  }

  const product = slug ? products.find(p => p.slug === slug) : null;

  if (slug && product) return <ProductDetail product={product} />;
  if (slug && !product) {
    return (
      <div className="pt-24 pb-20 text-center">
        <h2 className="text-h-xl text-neutral-950 mb-2">Product Not Found</h2>
        <Link to="/shop" className="text-b-sm text-neutral-500 hover:text-neutral-950">Back to Shop</Link>
      </div>
    );
  }

  return <ShopGrid products={products} />;
}

function ShopGrid({ products }: { products: any[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [quality, setQuality] = useState('all');
  const { addToCart, setCartOpen, isLoggedIn, setLoginModalOpen } = useStore();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || p.category === category;
      const matchesQuality = quality === 'all' || p.quality === quality;
      return matchesSearch && matchesCategory && matchesQuality;
    });
  }, [search, category, quality]);

  const handleAddToCart = (product: typeof products[0]) => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      deviceBrand: product.brand,
      price: product.price,
      priceLabel: `₹${product.price.toLocaleString()}`,
      quality: product.quality,
      image: product.image,
      quantity: 1,
    });
    setCartOpen(true);
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-28">
              <h2 className="text-h-sm text-neutral-950 mb-4">Shop</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-b-xs font-medium text-neutral-700 mb-2">Category</p>
                  <div className="space-y-1">
                    {[
                      { key: 'all', label: 'All Products' },
                      { key: 'spare-parts', label: 'Spare Parts' },
                      { key: 'accessories', label: 'Accessories' },
                    ].map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setCategory(c.key)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-b-sm transition-colors ${
                          category === c.key ? 'bg-neutral-100 text-neutral-950 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-b-xs font-medium text-neutral-700 mb-2">Quality</p>
                  <div className="space-y-1">
                    {[
                      { key: 'all', label: 'All Qualities' },
                      { key: 'oem', label: 'OEM-Grade' },
                      { key: 'high-tier', label: 'High-Tier' },
                      { key: 'genuine', label: 'Genuine' },
                    ].map((q) => (
                      <button
                        key={q.key}
                        onClick={() => setQuality(q.key)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-b-sm transition-colors ${
                          quality === q.key ? 'bg-neutral-100 text-neutral-950 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            <p className="text-b-xs text-neutral-500 mb-4">{filtered.length} products found</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-card-hover transition-all group">
                  <Link to={`/shop/${product.slug}`} className="block aspect-square bg-neutral-100 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                      ))}
                      <span className="text-b-xs text-neutral-500 ml-1">({product.reviewCount})</span>
                    </div>
                    <Link to={`/shop/${product.slug}`}>
                      <h3 className="text-b-sm font-medium text-neutral-950 mb-1 hover:text-neutral-700 line-clamp-2">{product.name}</h3>
                    </Link>
                    <p className="text-b-xs text-neutral-500 mb-3">{product.brand} &middot; <span className="capitalize">{product.quality}</span></p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-b-sm font-bold text-neutral-950">&#8377;{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-b-xs text-neutral-400 line-through ml-1">&#8377;{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product }: { product: any }) {
  const { addToCart, setCartOpen, isLoggedIn, setLoginModalOpen } = useStore();

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      deviceBrand: product.brand,
      price: product.price,
      priceLabel: `₹${product.price.toLocaleString()}`,
      quality: product.quality,
      image: product.image,
      quantity: 1,
    });
    setCartOpen(true);
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container-main max-w-5xl">
        <Link to="/shop" className="inline-flex items-center gap-1 text-b-sm text-neutral-500 hover:text-neutral-950 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-b-xs text-neutral-500 capitalize bg-neutral-100 px-2 py-0.5 rounded">{product.category}</span>
              <span className="text-b-xs text-neutral-500 capitalize bg-neutral-100 px-2 py-0.5 rounded">{product.quality}</span>
            </div>
            <h1 className="text-h-xl text-neutral-950 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
              ))}
              <span className="text-b-sm text-neutral-500">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
            <p className="text-b-sm text-neutral-600 mb-6">{product.description}</p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-neutral-950">&#8377;{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-b-lg text-neutral-400 line-through">&#8377;{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-b-xs font-medium mb-6 ${product.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {product.inStock ? <><Check className="w-3 h-3" /> In Stock ({product.stockCount})</> : 'Out of Stock'}
            </div>

            <div className="mb-6">
              <p className="text-b-xs font-medium text-neutral-700 mb-2">Features</p>
              <ul className="space-y-1.5">
                {product.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-b-sm text-neutral-600">
                    <Check className="w-3 h-3 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-b-xs font-medium text-neutral-700 mb-2">Compatible With</p>
              <div className="flex flex-wrap gap-2">
                {product.compatibleModels.map((m: string) => (
                  <span key={m} className="text-b-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{m}</span>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3.5 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
