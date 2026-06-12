export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    slug: 'water-damage-what-to-do',
    title: 'Water Damage: What to Do in the First 30 Minutes',
    excerpt: 'Immediate steps can save your device from permanent damage. Learn the critical first actions after liquid exposure.',
    content: `Water damage is one of the most common and potentially devastating issues smartphone users face. The first 30 minutes after exposure are absolutely critical for maximizing recovery chances.\n\n**Step 1: Power Off Immediately**\nThe moment your device contacts liquid, power it off completely. Do not attempt to check if it's still working. Electricity and water create a dangerous combination that can cause short circuits.\n\n**Step 2: Remove External Components**\nTake off any case, remove the SIM card tray, and disconnect any accessories. This improves airflow and prevents trapped moisture.\n\n**Step 3: Dry the Exterior**\nUse a lint-free microfiber cloth to gently pat the exterior dry. Pay special attention to ports and speakers. Never use a hair dryer - the heat can damage internal components.\n\n**Step 4: Do NOT Use Rice**\nContrary to popular belief, rice is not an effective drying agent and can introduce dust particles into your device. Instead, place the device in a well-ventilated area with silica gel packets if available.\n\n**Step 5: Bring It to Professionals**\nWithin the first few hours, bring your device to a professional repair center. Our ultrasonic cleaning process removes corrosion before it causes permanent damage. The sooner we start treatment, the higher the recovery rate.`,
    category: 'Repair Guides',
    author: 'iRepairMe Team',
    date: '2024-12-10',
    readTime: '5 min',
    image: '/images/blog-water-damage.jpg',
    tags: ['water damage', 'emergency', 'tips'],
  },
  {
    id: 'b2',
    slug: 'iphone-screen-repair-guide',
    title: 'iPhone Screen Repair: OEM vs High-Tier - Which to Choose?',
    excerpt: 'Understanding the difference between replacement part quality levels can help you make an informed decision for your repair.',
    content: `When it comes to iPhone screen replacement, you typically have two main options: OEM-grade or High-Tier compatible displays. Understanding the differences helps you choose the right option for your needs and budget.\n\n**OEM-Grade Displays**\nThese are manufactured to the exact same specifications as Apple's original displays, often by the same suppliers. They offer:\n- Perfect color accuracy and True Tone compatibility\n- Original brightness levels (up to 1000 nits for Pro models)\n- Full FaceID functionality\n- Original touch sampling rate\n\n**High-Tier Compatible Displays**\nQuality aftermarket alternatives that offer excellent performance at a lower price:\n- Very good color accuracy (minor calibration differences)\n- Slightly lower peak brightness\n- Full touch functionality\n- Great value for money\n\n**Our Recommendation**\nFor iPhone Pro models with ProMotion displays, we recommend OEM-grade for the best experience. For standard models or older devices, High-Tier offers outstanding value without significant compromise.`,
    category: 'Buying Guides',
    author: 'iRepairMe Team',
    date: '2024-12-05',
    readTime: '4 min',
    image: '/images/service-screen.jpg',
    tags: ['iPhone', 'screen repair', 'parts guide'],
  },
  {
    id: 'b3',
    slug: 'battery-health-explained',
    title: 'When Should You Replace Your Phone Battery?',
    excerpt: 'Battery health declining? Learn the signs that indicate it\'s time for a replacement and how to check your battery\'s condition.',
    content: `Smartphone batteries are consumable components that degrade over time. Knowing when to replace them can restore your device\'s performance and usability.\n\n**Signs Your Battery Needs Replacement**\n\n1. **Maximum Capacity Below 80%** - Check in Settings > Battery > Battery Health. Below 80% means reduced peak performance.\n\n2. **Unexpected Shutdowns** - If your phone turns off randomly even with 20-30% charge remaining, the battery can no longer deliver peak power.\n\n3. **Significantly Reduced Usage Time** - If you find yourself charging twice a day when you used to charge once, the battery capacity has degraded.\n\n4. **Physical Signs** - A swollen battery can push the screen up from the frame or make the back glass bulge. This is a safety hazard - replace immediately.\n\n5. **Slow Charging** - Aging batteries may charge slower as the charging circuitry limits current for safety.\n\n**When to Replace**\nWe recommend battery replacement when maximum capacity drops below 85% for power users, or when you notice the symptoms above. A new battery can make a 2-year-old phone feel brand new.`,
    category: 'Tips & Tricks',
    author: 'iRepairMe Team',
    date: '2024-11-28',
    readTime: '6 min',
    image: '/images/service-battery.jpg',
    tags: ['battery', 'maintenance', 'tips'],
  },
  {
    id: 'b4',
    slug: 'foldable-phone-repair',
    title: 'The Future of Foldable Phone Repairs',
    excerpt: 'Foldable phones present unique repair challenges. Discover how repair techniques are evolving for these innovative devices.',
    content: `Foldable phones represent the cutting edge of smartphone design, but their unique form factor creates specialized repair challenges that differ significantly from traditional devices.\n\n**Unique Challenges**\n\nThe flexible OLED display and complex hinge mechanism require specialized expertise. The ultra-thin glass (UTG) layer is more delicate than standard Gorilla Glass, and the hinge contains dozens of precision components.\n\n**Screen Repairs**\nUnlike traditional phones, foldable screens require the entire display assembly to be replaced, including the flexible circuit boards. The process is more complex and requires a dust-free environment.\n\n**Hinge Issues**\nThe most common foldable-specific problem is hinge stiffness or misalignment. Our technicians are trained to disassemble and recondition hinges, which is significantly more cost-effective than full replacement.\n\n**Protective Film**\nThe factory-installed protective film on foldable screens is crucial - never remove it. If it bubbles or peels, we can replace it with specialized equipment.`,
    category: 'Industry Insights',
    author: 'iRepairMe Team',
    date: '2024-11-20',
    readTime: '7 min',
    image: '/images/category-android.jpg',
    tags: ['foldable', 'Samsung', 'advanced repair'],
  },
  {
    id: 'b5',
    slug: 'macbook-common-issues',
    title: 'Most Common MacBook Issues and How to Fix Them',
    excerpt: 'From kernel panics to battery swelling - a comprehensive guide to MacBook problems and their solutions.',
    content: `MacBooks are known for reliability, but they\'re not immune to issues. Here are the most common problems we see and how to address them.\n\n**1. Screen Delamination / Staingate**\nThe anti-reflective coating can wear off, creating visible patches. We offer professional recoating services that restore clarity.\n\n**2. Keyboard Issues (Butterfly Mechanism)**\nSticky or unresponsive keys are common on 2016-2019 MacBook Pros. We can replace individual keys or the entire keyboard assembly.\n\n**3. Battery Swelling**\nA swollen battery is dangerous and can damage the trackpad and chassis. We replace batteries with genuine cells and check for chassis damage.\n\n**4. Logic Board Failures**\nOften caused by liquid damage or component failure. Our micro-soldering expertise allows us to repair rather than replace expensive logic boards.\n\n**5. Storage Issues**\nSSD failures or running out of space. We offer storage upgrades for older MacBooks that can significantly extend their useful life.`,
    category: 'Repair Guides',
    author: 'iRepairMe Team',
    date: '2024-11-15',
    readTime: '8 min',
    image: '/images/category-macbook.jpg',
    tags: ['MacBook', 'troubleshooting', 'repair'],
  },
  {
    id: 'b6',
    slug: 'prevent-phone-overheating',
    title: '10 Tips to Prevent Your Phone from Overheating',
    excerpt: 'Overheating can damage your device and reduce battery life. Follow these practical tips to keep your phone cool.',
    content: `Phone overheating is a common issue that can lead to performance throttling, battery degradation, and in extreme cases, hardware damage. Here are practical tips to keep your device cool.\n\n**1. Remove the Case**\nCases trap heat. Remove it during intensive tasks like gaming or 4K video recording.\n\n**2. Close Background Apps**\nToo many apps running simultaneously increases CPU load. Close apps you\'re not actively using.\n\n**3. Reduce Screen Brightness**\nThe display is a major heat source. Use auto-brightness or keep it at 50-60%.\n\n**4. Disable Unused Features**\nTurn off Bluetooth, GPS, and mobile data when not needed. These radios generate heat.\n\n**5. Avoid Direct Sunlight**\nNever leave your phone in direct sunlight, especially on car dashboards. Internal temperatures can exceed safe limits quickly.\n\n**6. Update Software**\nManufacturers often release updates that optimize thermal management.\n\n**7. Use Original Chargers**\nThird-party chargers can cause inconsistent charging that generates excess heat.\n\n**8. Don\'t Charge While Gaming**\nCharging + heavy processing = maximum heat generation. Wait until you\'re done gaming.\n\n**9. Check for Malware**\nSome malicious apps run crypto miners in the background. If your phone heats up while idle, scan for malware.\n\n**10. Service When Needed**\nIf overheating persists despite these measures, the battery or thermal paste may need servicing.`,
    category: 'Tips & Tricks',
    author: 'iRepairMe Team',
    date: '2024-11-08',
    readTime: '5 min',
    image: '/images/category-iphone.jpg',
    tags: ['overheating', 'maintenance', 'tips'],
  },
];

export const getBlogPostBySlug = (slug: string) => blogPosts.find((p) => p.slug === slug);
