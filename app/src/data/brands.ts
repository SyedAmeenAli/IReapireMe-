export interface BrandData {
  id: string;
  name: string;
  slug: string;
  deviceTypes: string[];
  logo?: string;
  popularModels: string[];
  description: string;
}

export const brands: BrandData[] = [
  {
    id: 'apple',
    name: 'Apple',
    slug: 'apple',
    deviceTypes: ['iphone', 'ipad', 'macbook', 'watch', 'airpods', 'imac'],
    popularModels: ['iPhone 15 Pro', 'iPhone 14', 'iPhone 13', 'iPad Pro', 'MacBook Pro', 'Apple Watch Series 9'],
    description: 'Complete repair services for all Apple devices using OEM-grade parts and certified procedures.',
  },
  {
    id: 'samsung',
    name: 'Samsung',
    slug: 'samsung',
    deviceTypes: ['android', 'android-tablet'],
    popularModels: ['Galaxy S24 Ultra', 'Galaxy S23', 'Galaxy Z Fold 5', 'Galaxy Tab S9', 'Galaxy A54'],
    description: 'Expert Samsung repairs from Galaxy S series to Z Fold/Flip and tablets.',
  },
  {
    id: 'redmi',
    name: 'Redmi',
    slug: 'redmi',
    deviceTypes: ['android'],
    popularModels: ['Redmi Note 13 Pro', 'Redmi Note 12', 'Redmi 13C', 'Redmi K70', 'Redmi 12'],
    description: 'Affordable, high-quality repairs for all Redmi smartphone models.',
  },
  {
    id: 'oneplus',
    name: 'OnePlus',
    slug: 'oneplus',
    deviceTypes: ['android'],
    popularModels: ['OnePlus 12', 'OnePlus 11', 'OnePlus Nord 3', 'OnePlus 10 Pro'],
    description: 'Premium repair services for OnePlus devices with genuine components.',
  },
  {
    id: 'google',
    name: 'Google Pixel',
    slug: 'google',
    deviceTypes: ['android'],
    popularModels: ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel Fold'],
    description: 'Specialized Pixel repair including camera modules and Tensor chip diagnostics.',
  },
  {
    id: 'nothing',
    name: 'Nothing',
    slug: 'nothing',
    deviceTypes: ['android'],
    popularModels: ['Nothing Phone 2', 'Nothing Phone 1', 'Nothing Phone 2a'],
    description: 'Unique Glyph interface repairs and transparent back panel restoration.',
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi',
    slug: 'xiaomi',
    deviceTypes: ['android', 'android-tablet'],
    popularModels: ['Xiaomi 14', 'Xiaomi 13T Pro', 'Xiaomi Pad 6', 'POCO F6'],
    description: 'Full Xiaomi and POCO repair services with rapid turnaround.',
  },
  {
    id: 'oppo',
    name: 'OPPO',
    slug: 'oppo',
    deviceTypes: ['android'],
    popularModels: ['Find X7 Ultra', 'Reno 11 Pro', 'A78', 'F25 Pro'],
    description: 'OPPO and Realme device repairs with VOOC charging port expertise.',
  },
  {
    id: 'vivo',
    name: 'Vivo',
    slug: 'vivo',
    deviceTypes: ['android'],
    popularModels: ['V30 Pro', 'X100', 'V29', 'Y200'],
    description: 'Vivo and iQOO repairs including Zeiss camera module restoration.',
  },
  {
    id: 'motorola',
    name: 'Motorola',
    slug: 'motorola',
    deviceTypes: ['android'],
    popularModels: ['Edge 40', 'moto g84', 'Razr 40 Ultra', 'Edge 30 Fusion'],
    description: 'Motorola and Lenovo phone repairs with foldable screen expertise.',
  },
  {
    id: 'asus',
    name: 'Asus',
    slug: 'asus',
    deviceTypes: ['android', 'laptop'],
    popularModels: ['ROG Phone 8', 'Zenfone 10', 'ROG Phone 7'],
    description: 'Gaming phone and ROG device specialists.',
  },
  {
    id: 'other',
    name: 'Other Brands',
    slug: 'other',
    deviceTypes: ['android', 'ipad', 'laptop', 'other'],
    popularModels: ['Nokia', 'Sony', 'LG', 'Huawei', 'Honor', 'Infinix'],
    description: 'We repair devices from all manufacturers. Contact us for your specific model.',
  },
];

export const getBrandBySlug = (slug: string) => brands.find((b) => b.slug === slug);
