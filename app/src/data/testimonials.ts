export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  device: string;
  service: string;
  date: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Rahul Sharma',
    location: 'Bangalore',
    rating: 5,
    text: 'Got my iPhone 15 Pro screen replaced in under 45 minutes. The display quality is indistinguishable from the original. Professional service and transparent pricing!',
    device: 'iPhone 15 Pro',
    service: 'Screen Replacement',
    date: '2024-12-15',
  },
  {
    id: 't2',
    name: 'Priya Patel',
    location: 'Mumbai',
    rating: 5,
    text: 'My Galaxy S24 Ultra had water damage after a pool incident. They recovered all my data and the phone works perfectly now. Truly lifesaving service!',
    device: 'Galaxy S24 Ultra',
    service: 'Water Damage Recovery',
    date: '2024-11-28',
  },
  {
    id: 't3',
    name: 'Amit Kumar',
    location: 'Delhi',
    rating: 5,
    text: 'Replaced the battery on my iPhone 13. It now lasts a full day again. The 90-day warranty gives great peace of mind. Highly recommended!',
    device: 'iPhone 13',
    service: 'Battery Replacement',
    date: '2024-12-05',
  },
  {
    id: 't4',
    name: 'Sneha Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'Best repair experience ever! My OnePlus 12 charging port was fixed while I waited. Clean shop, professional staff, fair prices.',
    device: 'OnePlus 12',
    service: 'Charging Port Repair',
    date: '2024-12-10',
  },
  {
    id: 't5',
    name: 'Vikram Singh',
    location: 'Pune',
    rating: 5,
    text: 'MacBook Pro logic board repair saved me from buying a new laptop. These guys know their stuff when it comes to micro-soldering.',
    device: 'MacBook Pro 16"',
    service: 'Motherboard Repair',
    date: '2024-11-20',
  },
  {
    id: 't6',
    name: 'Ananya Gupta',
    location: 'Chennai',
    rating: 5,
    text: 'Dropped my Pixel 8 Pro and cracked both the screen and back glass. They fixed both in 2 hours with OEM quality parts. Amazing!',
    device: 'Pixel 8 Pro',
    service: 'Screen + Back Glass',
    date: '2024-12-01',
  },
];
