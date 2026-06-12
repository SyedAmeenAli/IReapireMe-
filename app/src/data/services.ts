export interface ServiceData {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  icon: string;
  image: string;
  timeEstimate: string;
  warrantyPeriod: string;
  priceFrom: number;
  popularIssues: string[];
  features: string[];
  applicableDevices: string[];
}

export const services: ServiceData[] = [
  {
    id: 'screen-repair',
    slug: 'screen-repair',
    title: 'Screen Replacement',
    shortTitle: 'Screen',
    description: 'Expert OLED and LCD screen replacement with pixel-perfect calibration.',
    longDescription: 'Our screen replacement service covers everything from minor cracks to complete display failures. We use OEM-grade OLED panels for iPhones and high-quality compatible displays for Android devices. Every replacement includes digitizer calibration, True Tone restoration (where applicable), and water-resistance testing.',
    icon: 'Monitor',
    image: '/images/service-screen.jpg',
    timeEstimate: '30-60 minutes',
    warrantyPeriod: '90 days',
    priceFrom: 1499,
    popularIssues: ['Cracked glass', 'Dead pixels', 'Touch unresponsive', 'Display flickering', 'Black screen'],
    features: ['OEM-grade displays', 'Digitizer calibration', 'Water resistance test', 'Color profile matching'],
    applicableDevices: ['iPhone', 'Android', 'iPad', 'MacBook'],
  },
  {
    id: 'battery-replacement',
    slug: 'battery-replacement',
    title: 'Battery Replacement',
    shortTitle: 'Battery',
    description: 'Restore your device\'s all-day battery life with our premium cell replacement.',
    longDescription: 'Is your battery draining faster than ever? Our battery replacement service uses high-capacity cells that match or exceed original specifications. We perform health diagnostics before and after replacement to ensure optimal performance.',
    icon: 'Battery',
    image: '/images/service-battery.jpg',
    timeEstimate: '20-45 minutes',
    warrantyPeriod: '90 days',
    priceFrom: 999,
    popularIssues: ['Rapid drain', 'Unexpected shutdown', 'Battery swelling', 'Slow charging', 'Overheating'],
    features: ['High-capacity cells', 'Health diagnostics', 'Charge cycle calibration', 'Thermal inspection'],
    applicableDevices: ['iPhone', 'Android', 'iPad', 'MacBook', 'Watch'],
  },
  {
    id: 'charging-port',
    slug: 'charging-port',
    title: 'Charging Port Repair',
    shortTitle: 'Charging',
    description: 'Fix loose connections, debris buildup, and damaged charging ports.',
    longDescription: 'Charging issues are often caused by lint buildup, bent pins, or internal damage. Our technicians use microscopes to inspect and clean charging ports, replacing the entire flex cable when necessary.',
    icon: 'Plug',
    image: '/images/service-screen.jpg',
    timeEstimate: '30-60 minutes',
    warrantyPeriod: '90 days',
    priceFrom: 799,
    popularIssues: ['Won\'t charge', 'Loose connection', 'Slow charging', 'Intermittent charging'],
    features: ['Microscope inspection', 'Deep cleaning', 'Flex cable replacement', 'Continuity testing'],
    applicableDevices: ['iPhone', 'Android', 'iPad'],
  },
  {
    id: 'water-damage',
    slug: 'water-damage',
    title: 'Water Damage Recovery',
    shortTitle: 'Water Damage',
    description: 'Emergency liquid damage treatment with ultrasonic cleaning and component testing.',
    longDescription: 'Time is critical with water damage. Our emergency protocol includes immediate power isolation, ultrasonic cleaning of the logic board, corrosion treatment, and systematic component testing. We have a 78% success rate for devices brought in within 24 hours.',
    icon: 'Droplets',
    image: '/images/blog-water-damage.jpg',
    timeEstimate: '1-3 days',
    warrantyPeriod: '30 days',
    priceFrom: 1499,
    popularIssues: ['Submerged in water', 'Liquid contact indicator triggered', 'Corrosion damage', 'Random reboots after spill'],
    features: ['Ultrasonic cleaning', 'Corrosion treatment', 'Component-level testing', 'Data recovery attempt'],
    applicableDevices: ['iPhone', 'Android', 'iPad', 'MacBook', 'Watch'],
  },
  {
    id: 'camera-repair',
    slug: 'camera-repair',
    title: 'Camera Repair',
    shortTitle: 'Camera',
    description: 'Restore crystal-clear photos with our precision camera module service.',
    longDescription: 'From blurry focus to cracked lens glass, our camera repair service handles all optical issues. We replace entire camera modules for complex repairs and clean/realign lenses for focus issues.',
    icon: 'Camera',
    image: '/images/service-battery.jpg',
    timeEstimate: '30-60 minutes',
    warrantyPeriod: '90 days',
    priceFrom: 1299,
    popularIssues: ['Blurry photos', 'Cracked lens', 'Camera app crashes', 'OIS rattling', 'FaceID not working'],
    features: ['Module replacement', 'Lens cleaning', 'OIS calibration', 'FaceID repair'],
    applicableDevices: ['iPhone', 'Android', 'iPad'],
  },
  {
    id: 'motherboard',
    slug: 'motherboard',
    title: 'Motherboard / Logic Board Repair',
    shortTitle: 'Motherboard',
    description: 'Advanced micro-soldering and IC replacement for complex board-level issues.',
    longDescription: 'Our Level 3 repair service addresses the most complex hardware failures. Using microscopes and precision soldering equipment, we replace damaged ICs, repair broken traces, and recover data from seemingly dead devices.',
    icon: 'Cpu',
    image: '/images/service-screen.jpg',
    timeEstimate: '2-5 days',
    warrantyPeriod: '90 days',
    priceFrom: 2499,
    popularIssues: ['Won\'t power on', 'Boot loop', 'No display', 'Data recovery needed', 'Audio IC failure'],
    features: ['Micro-soldering', 'IC replacement', 'Trace repair', 'Data recovery', 'Reballing'],
    applicableDevices: ['iPhone', 'Android', 'iPad', 'MacBook'],
  },
  {
    id: 'software',
    slug: 'software',
    title: 'Software & Diagnostics',
    shortTitle: 'Software',
    description: 'System restore, OS updates, virus removal, and performance optimization.',
    longDescription: 'Software issues can be as frustrating as hardware problems. Our diagnostic service includes comprehensive system analysis, malware removal, OS reinstallation, and performance tuning.',
    icon: 'Code',
    image: '/images/service-battery.jpg',
    timeEstimate: '1-2 hours',
    warrantyPeriod: '30 days',
    priceFrom: 499,
    popularIssues: ['Slow performance', 'App crashes', 'Virus/malware', 'Update failures', 'Forgot password'],
    features: ['Full diagnostic', 'Malware removal', 'OS restore', 'Performance tuning', 'Data backup'],
    applicableDevices: ['iPhone', 'Android', 'iPad', 'MacBook'],
  },
  {
    id: 'back-glass',
    slug: 'back-glass',
    title: 'Back Glass Replacement',
    shortTitle: 'Back Glass',
    description: 'Laser-precision back glass removal and replacement for shattered panels.',
    longDescription: 'Modern smartphones use wireless charging coils integrated into the back glass. Our laser separation technology safely removes shattered glass without damaging internal components, followed by precise new glass installation.',
    icon: 'Smartphone',
    image: '/images/service-screen.jpg',
    timeEstimate: '1-2 hours',
    warrantyPeriod: '90 days',
    priceFrom: 1799,
    popularIssues: ['Shattered back glass', 'Wireless charging stopped', 'Camera glass cracked'],
    features: ['Laser separation', 'Wireless coil protection', 'OEM glass quality', 'MagSafe compatibility'],
    applicableDevices: ['iPhone', 'Android'],
  },
];

export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);
