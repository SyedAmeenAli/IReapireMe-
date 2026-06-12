export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  brand: string;
  compatibleModels: string[];
  quality: 'oem' | 'high-tier' | 'genuine';
  image: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  features: string[];
}

export const products: Product[] = [
  // iPhone Screens
  {
    id: 'sp1', slug: 'iphone-15-pro-oled-screen', name: 'iPhone 15 Pro OLED Display Assembly', description: 'Complete OLED display with digitizer, front camera bracket, and proximity sensor bracket pre-installed. OEM-grade quality with True Tone support.', price: 16999, originalPrice: 19999, category: 'spare-parts', subcategory: 'screens', brand: 'apple', compatibleModels: ['iPhone 15 Pro'], quality: 'oem', image: '/images/brand-iphone.jpg', inStock: true, stockCount: 24, rating: 4.9, reviewCount: 128, features: ['OLED technology', 'True Tone support', 'Digitizer included', '90-day warranty'],
  },
  {
    id: 'sp2', slug: 'iphone-15-pro-screen-compatible', name: 'iPhone 15 Pro Display (High-Tier)', description: 'High-quality compatible LCD display assembly for iPhone 15 Pro. Excellent color accuracy and touch response at a competitive price.', price: 9999, originalPrice: 11999, category: 'spare-parts', subcategory: 'screens', brand: 'apple', compatibleModels: ['iPhone 15 Pro'], quality: 'high-tier', image: '/images/brand-iphone.jpg', inStock: true, stockCount: 45, rating: 4.7, reviewCount: 89, features: ['High-quality LCD', 'Touch included', 'Color calibrated', '90-day warranty'],
  },
  {
    id: 'sp3', slug: 'iphone-13-screen-oem', name: 'iPhone 13 OLED Display Assembly', description: 'OEM-grade OLED display for iPhone 13. Complete assembly with all brackets and sensors.', price: 7999, originalPrice: 9499, category: 'spare-parts', subcategory: 'screens', brand: 'apple', compatibleModels: ['iPhone 13', 'iPhone 13 Pro'], quality: 'oem', image: '/images/brand-iphone.jpg', inStock: true, stockCount: 18, rating: 4.8, reviewCount: 256, features: ['Super Retina XDR', 'Digitizer included', 'FaceID compatible', '90-day warranty'],
  },
  // iPhone Batteries
  {
    id: 'sp4', slug: 'iphone-15-pro-max-battery', name: 'iPhone 15 Pro Max Battery', description: 'High-capacity replacement battery for iPhone 15 Pro Max. 4422mAh capacity with adhesive strips.', price: 3499, originalPrice: 4299, category: 'spare-parts', subcategory: 'batteries', brand: 'apple', compatibleModels: ['iPhone 15 Pro Max'], quality: 'oem', image: '/images/service-battery.jpg', inStock: true, stockCount: 32, rating: 4.8, reviewCount: 67, features: ['4422mAh capacity', 'Adhesive included', 'Zero-cycle', '90-day warranty'],
  },
  {
    id: 'sp5', slug: 'iphone-13-battery', name: 'iPhone 13 Battery Replacement', description: 'Premium battery cell for iPhone 13. 3227mAh with complete adhesive kit.', price: 1999, originalPrice: 2499, category: 'spare-parts', subcategory: 'batteries', brand: 'apple', compatibleModels: ['iPhone 13'], quality: 'high-tier', image: '/images/service-battery.jpg', inStock: true, stockCount: 56, rating: 4.6, reviewCount: 189, features: ['3227mAh', 'Complete kit', 'Pre-tested', '90-day warranty'],
  },
  // Samsung Screens
  {
    id: 'sp6', slug: 's24-ultra-screen-oem', name: 'Galaxy S24 Ultra AMOLED Display', description: 'Original AMOLED display assembly for Samsung Galaxy S24 Ultra. Includes frame and digitizer.', price: 18999, originalPrice: 22999, category: 'spare-parts', subcategory: 'screens', brand: 'samsung', compatibleModels: ['Galaxy S24 Ultra'], quality: 'oem', image: '/images/brand-samsung.jpg', inStock: true, stockCount: 8, rating: 4.9, reviewCount: 34, features: ['Dynamic AMOLED 2X', '120Hz', 'Frame included', '90-day warranty'],
  },
  {
    id: 'sp7', slug: 's23-screen', name: 'Galaxy S23 AMOLED Display', description: 'High-quality AMOLED display for Galaxy S23. Complete assembly.', price: 7999, originalPrice: 9999, category: 'spare-parts', subcategory: 'screens', brand: 'samsung', compatibleModels: ['Galaxy S23'], quality: 'high-tier', image: '/images/brand-samsung.jpg', inStock: true, stockCount: 15, rating: 4.7, reviewCount: 78, features: ['AMOLED', 'Touch included', 'Pre-tested', '90-day warranty'],
  },
  // Charging Ports
  {
    id: 'sp8', slug: 'iphone-15-charging-flex', name: 'iPhone 15 Charging Port Flex Cable', description: 'USB-C charging port flex cable assembly for iPhone 15. Includes microphone.', price: 1499, originalPrice: 1799, category: 'spare-parts', subcategory: 'charging', brand: 'apple', compatibleModels: ['iPhone 15', 'iPhone 15 Plus'], quality: 'oem', image: '/images/service-screen.jpg', inStock: true, stockCount: 42, rating: 4.5, reviewCount: 156, features: ['USB-C port', 'Mic included', 'Flex cable', '90-day warranty'],
  },
  // Accessories
  {
    id: 'acc1', slug: 'precision-screwdriver-kit', name: 'Precision Screwdriver Set (25-in-1)', description: 'Professional-grade screwdriver set with magnetic bits for all smartphone models. Includes pentalobe, tri-wing, and Y-type bits.', price: 799, originalPrice: 999, category: 'accessories', subcategory: 'tools', brand: 'generic', compatibleModels: ['All devices'], quality: 'genuine', image: '/images/service-screen.jpg', inStock: true, stockCount: 100, rating: 4.8, reviewCount: 423, features: ['25 precision bits', 'Magnetic handle', 'Aluminium case', 'Anti-static'],
  },
  {
    id: 'acc2', slug: 'suction-cup-toolkit', name: 'Screen Opening Toolkit', description: 'Complete toolkit for safe screen removal. Includes suction cups, prying tools, and spudgers.', price: 499, originalPrice: 599, category: 'accessories', subcategory: 'tools', brand: 'generic', compatibleModels: ['All devices'], quality: 'genuine', image: '/images/service-battery.jpg', inStock: true, stockCount: 85, rating: 4.6, reviewCount: 198, features: ['Suction cups', 'Pry tools', 'Spudgers', 'Tweezers'],
  },
  {
    id: 'acc3', slug: 'uv-glue-loca', name: 'UV LOCA Glue (5ml)', description: 'Professional-grade LOCA (Liquid Optically Clear Adhesive) for screen bonding. UV curable.', price: 299, originalPrice: 399, category: 'accessories', subcategory: 'adhesives', brand: 'generic', compatibleModels: ['All devices'], quality: 'genuine', image: '/images/service-screen.jpg', inStock: true, stockCount: 200, rating: 4.4, reviewCount: 312, features: ['UV curable', '5ml bottle', 'Bubble-free', 'High clarity'],
  },
  {
    id: 'acc4', slug: 'screen-protector-iphone-15', name: 'iPhone 15 Pro Tempered Glass (2-Pack)', description: '9H hardness tempered glass screen protector with oleophobic coating. Edge-to-edge coverage.', price: 399, originalPrice: 599, category: 'accessories', subcategory: 'protection', brand: 'apple', compatibleModels: ['iPhone 15 Pro'], quality: 'genuine', image: '/images/brand-iphone.jpg', inStock: true, stockCount: 150, rating: 4.7, reviewCount: 892, features: ['9H hardness', '2-pack', 'Easy install', 'Case friendly'],
  },
];

export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const getProductsByCategory = (category: string) => products.filter((p) => p.category === category);
