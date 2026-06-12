export interface PricingEntry {
  id: string;
  deviceModel: string;
  service: string;
  price: number;
  estimatedTime: string;
  warrantyDays: number;
  inStock: boolean;
}

export const pricingData: PricingEntry[] = [
  // iPhone 15 Pro Max
  { id: 'p1', deviceModel: 'iPhone 15 Pro Max', service: 'Screen Replacement', price: 18999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  { id: 'p2', deviceModel: 'iPhone 15 Pro Max', service: 'Battery Replacement', price: 5499, estimatedTime: '30 min', warrantyDays: 90, inStock: true },
  { id: 'p3', deviceModel: 'iPhone 15 Pro Max', service: 'Charging Port', price: 3499, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  { id: 'p4', deviceModel: 'iPhone 15 Pro Max', service: 'Back Glass', price: 7999, estimatedTime: '2 hours', warrantyDays: 90, inStock: true },
  { id: 'p5', deviceModel: 'iPhone 15 Pro Max', service: 'Camera Repair', price: 5999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  // iPhone 15 Pro
  { id: 'p6', deviceModel: 'iPhone 15 Pro', service: 'Screen Replacement', price: 16999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  { id: 'p7', deviceModel: 'iPhone 15 Pro', service: 'Battery Replacement', price: 4999, estimatedTime: '30 min', warrantyDays: 90, inStock: true },
  { id: 'p8', deviceModel: 'iPhone 15 Pro', service: 'Charging Port', price: 2999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  { id: 'p9', deviceModel: 'iPhone 15 Pro', service: 'Back Glass', price: 6999, estimatedTime: '2 hours', warrantyDays: 90, inStock: true },
  // iPhone 14 Pro Max
  { id: 'p10', deviceModel: 'iPhone 14 Pro Max', service: 'Screen Replacement', price: 14999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  { id: 'p11', deviceModel: 'iPhone 14 Pro Max', service: 'Battery Replacement', price: 4499, estimatedTime: '30 min', warrantyDays: 90, inStock: true },
  { id: 'p12', deviceModel: 'iPhone 14 Pro Max', service: 'Charging Port', price: 2799, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  // iPhone 13
  { id: 'p13', deviceModel: 'iPhone 13', service: 'Screen Replacement', price: 7999, estimatedTime: '30 min', warrantyDays: 90, inStock: true },
  { id: 'p14', deviceModel: 'iPhone 13', service: 'Battery Replacement', price: 3499, estimatedTime: '20 min', warrantyDays: 90, inStock: true },
  { id: 'p15', deviceModel: 'iPhone 13', service: 'Charging Port', price: 2499, estimatedTime: '30 min', warrantyDays: 90, inStock: true },
  { id: 'p16', deviceModel: 'iPhone 13', service: 'Back Glass', price: 4999, estimatedTime: '1.5 hours', warrantyDays: 90, inStock: true },
  // Samsung S24 Ultra
  { id: 'p17', deviceModel: 'Galaxy S24 Ultra', service: 'Screen Replacement', price: 18999, estimatedTime: '1 hour', warrantyDays: 90, inStock: true },
  { id: 'p18', deviceModel: 'Galaxy S24 Ultra', service: 'Battery Replacement', price: 3999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  // Samsung S23
  { id: 'p19', deviceModel: 'Galaxy S23', service: 'Screen Replacement', price: 12999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  { id: 'p20', deviceModel: 'Galaxy S23', service: 'Battery Replacement', price: 2999, estimatedTime: '30 min', warrantyDays: 90, inStock: true },
  // OnePlus 12
  { id: 'p21', deviceModel: 'OnePlus 12', service: 'Screen Replacement', price: 9999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  { id: 'p22', deviceModel: 'OnePlus 12', service: 'Battery Replacement', price: 2999, estimatedTime: '30 min', warrantyDays: 90, inStock: true },
  // Google Pixel 8 Pro
  { id: 'p23', deviceModel: 'Pixel 8 Pro', service: 'Screen Replacement', price: 14999, estimatedTime: '45 min', warrantyDays: 90, inStock: true },
  { id: 'p24', deviceModel: 'Pixel 8 Pro', service: 'Battery Replacement', price: 3499, estimatedTime: '30 min', warrantyDays: 90, inStock: true },
  // MacBook Pro 16
  { id: 'p25', deviceModel: 'MacBook Pro 16" (M3)', service: 'Screen Replacement', price: 34999, estimatedTime: '1-2 days', warrantyDays: 90, inStock: false },
  { id: 'p26', deviceModel: 'MacBook Pro 16" (M3)', service: 'Battery Replacement', price: 12999, estimatedTime: '2-3 hours', warrantyDays: 90, inStock: true },
  { id: 'p27', deviceModel: 'MacBook Pro 16" (M3)', service: 'Water Damage', price: 0, estimatedTime: '2-5 days', warrantyDays: 30, inStock: true },
  { id: 'p28', deviceModel: 'MacBook Pro 16" (M3)', service: 'Motherboard Repair', price: 18999, estimatedTime: '3-5 days', warrantyDays: 90, inStock: true },
];

export const getPricingForModel = (modelName: string) => pricingData.filter((p) => p.deviceModel === modelName);
