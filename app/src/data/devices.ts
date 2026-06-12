export interface DeviceModel {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  image?: string;
  releaseYear: number;
  popularIssues: string[];
  services: string[];
}

export const deviceModels: DeviceModel[] = [
  // Apple iPhone
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', brand: 'apple', type: 'iphone', releaseYear: 2023, popularIssues: ['Screen damage', 'Battery issues'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass', 'water-damage'] },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', slug: 'iphone-15-pro', brand: 'apple', type: 'iphone', releaseYear: 2023, popularIssues: ['Screen damage', 'Battery drain'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass', 'water-damage'] },
  { id: 'iphone-15', name: 'iPhone 15', slug: 'iphone-15', brand: 'apple', type: 'iphone', releaseYear: 2023, popularIssues: ['Screen cracks', 'Charging issues'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass'] },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max', brand: 'apple', type: 'iphone', releaseYear: 2022, popularIssues: ['Display issues', 'Battery health'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass', 'water-damage'] },
  { id: 'iphone-14', name: 'iPhone 14', slug: 'iphone-14', brand: 'apple', type: 'iphone', releaseYear: 2022, popularIssues: ['Screen cracks', 'Battery drain'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass'] },
  { id: 'iphone-13-pro', name: 'iPhone 13 Pro', slug: 'iphone-13-pro', brand: 'apple', type: 'iphone', releaseYear: 2021, popularIssues: ['Screen damage', 'Battery issues'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass', 'water-damage'] },
  { id: 'iphone-13', name: 'iPhone 13', slug: 'iphone-13', brand: 'apple', type: 'iphone', releaseYear: 2021, popularIssues: ['Screen cracks', 'FaceID failure'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass'] },
  { id: 'iphone-12', name: 'iPhone 12', slug: 'iphone-12', brand: 'apple', type: 'iphone', releaseYear: 2020, popularIssues: ['Screen damage', 'Battery health'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair'] },
  { id: 'iphone-11', name: 'iPhone 11', slug: 'iphone-11', brand: 'apple', type: 'iphone', releaseYear: 2019, popularIssues: ['Screen cracks', 'Battery issues'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair'] },
  { id: 'iphone-se-3', name: 'iPhone SE (3rd Gen)', slug: 'iphone-se-3', brand: 'apple', type: 'iphone', releaseYear: 2022, popularIssues: ['Battery drain', 'Home button'], services: ['screen-repair', 'battery-replacement', 'charging-port'] },
  // Samsung
  { id: 's24-ultra', name: 'Galaxy S24 Ultra', slug: 's24-ultra', brand: 'samsung', type: 'android', releaseYear: 2024, popularIssues: ['S Pen issues', 'Screen burn-in'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'water-damage'] },
  { id: 's23-ultra', name: 'Galaxy S23 Ultra', slug: 's23-ultra', brand: 'samsung', type: 'android', releaseYear: 2023, popularIssues: ['Screen cracks', 'Battery drain'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass'] },
  { id: 's23', name: 'Galaxy S23', slug: 's23', brand: 'samsung', type: 'android', releaseYear: 2023, popularIssues: ['Display issues', 'Overheating'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair'] },
  { id: 'z-fold-5', name: 'Galaxy Z Fold 5', slug: 'z-fold-5', brand: 'samsung', type: 'android', releaseYear: 2023, popularIssues: ['Fold crease', 'Hinge issues'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'water-damage'] },
  { id: 'z-flip-5', name: 'Galaxy Z Flip 5', slug: 'z-flip-5', brand: 'samsung', type: 'android', releaseYear: 2023, popularIssues: ['Fold damage', 'Hinge stiffness'], services: ['screen-repair', 'battery-replacement', 'charging-port'] },
  { id: 'a54', name: 'Galaxy A54', slug: 'a54', brand: 'samsung', type: 'android', releaseYear: 2023, popularIssues: ['Screen cracks', 'Slow charging'], services: ['screen-repair', 'battery-replacement', 'charging-port'] },
  // OnePlus
  { id: 'oneplus-12', name: 'OnePlus 12', slug: 'oneplus-12', brand: 'oneplus', type: 'android', releaseYear: 2024, popularIssues: ['Screen damage', 'Battery issues'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass'] },
  { id: 'oneplus-11', name: 'OnePlus 11', slug: 'oneplus-11', brand: 'oneplus', type: 'android', releaseYear: 2023, popularIssues: ['Display cracks', 'Charging port'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair'] },
  // Google
  { id: 'pixel-8-pro', name: 'Pixel 8 Pro', slug: 'pixel-8-pro', brand: 'google', type: 'android', releaseYear: 2023, popularIssues: ['Screen cracks', 'Camera issues'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair', 'back-glass'] },
  { id: 'pixel-8', name: 'Pixel 8', slug: 'pixel-8', brand: 'google', type: 'android', releaseYear: 2023, popularIssues: ['Battery drain', 'Overheating'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair'] },
  // Redmi
  { id: 'redmi-note-13', name: 'Redmi Note 13 Pro', slug: 'redmi-note-13', brand: 'redmi', type: 'android', releaseYear: 2024, popularIssues: ['Screen damage', 'Speaker issues'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'camera-repair'] },
  { id: 'redmi-note-12', name: 'Redmi Note 12', slug: 'redmi-note-12', brand: 'redmi', type: 'android', releaseYear: 2023, popularIssues: ['Display cracks', 'Battery drain'], services: ['screen-repair', 'battery-replacement', 'charging-port'] },
  // Nothing
  { id: 'nothing-phone-2', name: 'Nothing Phone 2', slug: 'nothing-phone-2', brand: 'nothing', type: 'android', releaseYear: 2023, popularIssues: ['Glyph issues', 'Back cracks'], services: ['screen-repair', 'battery-replacement', 'charging-port', 'back-glass'] },
  // iPad
  { id: 'ipad-pro-12-m4', name: 'iPad Pro 12.9" (M4)', slug: 'ipad-pro-12-m4', brand: 'apple', type: 'ipad', releaseYear: 2024, popularIssues: ['Screen cracks', 'Apple Pencil issues'], services: ['screen-repair', 'battery-replacement', 'charging-port'] },
  { id: 'ipad-pro-11-m4', name: 'iPad Pro 11" (M4)', slug: 'ipad-pro-11-m4', brand: 'apple', type: 'ipad', releaseYear: 2024, popularIssues: ['Display damage', 'Battery drain'], services: ['screen-repair', 'battery-replacement', 'charging-port'] },
  { id: 'ipad-air-6', name: 'iPad Air (6th Gen)', slug: 'ipad-air-6', brand: 'apple', type: 'ipad', releaseYear: 2024, popularIssues: ['Screen cracks', 'Charging issues'], services: ['screen-repair', 'battery-replacement', 'charging-port'] },
  // MacBook
  { id: 'macbook-pro-16-m3', name: 'MacBook Pro 16" (M3)', slug: 'macbook-pro-16-m3', brand: 'apple', type: 'macbook', releaseYear: 2023, popularIssues: ['Screen damage', 'Keyboard issues'], services: ['screen-repair', 'battery-replacement', 'water-damage', 'motherboard', 'software'] },
  { id: 'macbook-pro-14-m3', name: 'MacBook Pro 14" (M3)', slug: 'macbook-pro-14-m3', brand: 'apple', type: 'macbook', releaseYear: 2023, popularIssues: ['Display cracks', 'Port issues'], services: ['screen-repair', 'battery-replacement', 'water-damage', 'motherboard', 'software'] },
  { id: 'macbook-air-15-m3', name: 'MacBook Air 15" (M3)', slug: 'macbook-air-15-m3', brand: 'apple', type: 'macbook', releaseYear: 2024, popularIssues: ['Screen damage', 'Liquid spills'], services: ['screen-repair', 'battery-replacement', 'water-damage', 'motherboard', 'software'] },
  // Watch
  { id: 'watch-s9-45', name: 'Apple Watch Series 9 (45mm)', slug: 'watch-s9-45', brand: 'apple', type: 'watch', releaseYear: 2023, popularIssues: ['Screen cracks', 'Battery drain'], services: ['screen-repair', 'battery-replacement', 'water-damage'] },
  { id: 'watch-ultra-2', name: 'Apple Watch Ultra 2', slug: 'watch-ultra-2', brand: 'apple', type: 'watch', releaseYear: 2023, popularIssues: ['Display damage', 'Button issues'], services: ['screen-repair', 'battery-replacement', 'water-damage'] },
];

export const getModelsByBrand = (brandSlug: string) => deviceModels.filter((d) => d.brand === brandSlug);
export const getModelBySlug = (slug: string) => deviceModels.find((d) => d.slug === slug);
