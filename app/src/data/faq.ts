export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqItems: FAQItem[] = [
  {
    id: 'f1',
    category: 'pricing',
    question: 'How much does a typical screen repair cost?',
    answer: 'Screen repair costs vary by device model and display technology. iPhone screens start from ₹4,999 (high-tier) to ₹18,999 (OEM-grade). Android screens range from ₹2,999 to ₹12,999. We always provide a transparent quote before starting any work.',
  },
  {
    id: 'f2',
    category: 'warranty',
    question: 'What warranty do you offer on repairs?',
    answer: 'All our repairs come with a 90-day warranty covering parts and labor. Water damage repairs carry a 30-day warranty. If the same issue recurs within the warranty period, we\'ll fix it free of charge.',
  },
  {
    id: 'f3',
    category: 'pickup',
    question: 'Do you offer pickup and delivery?',
    answer: 'Yes! We offer free doorstep pickup and delivery in major cities including Bangalore, Mumbai, Delhi, Hyderabad, and Chennai. For other locations, we provide a prepaid courier service with device insurance.',
  },
  {
    id: 'f4',
    category: 'time',
    question: 'How long does a typical repair take?',
    answer: 'Most screen and battery replacements are completed within 30-60 minutes. Complex repairs like motherboard work or water damage recovery may take 2-5 days. We provide an estimated timeline with every quote.',
  },
  {
    id: 'f5',
    category: 'data',
    question: 'Will I lose my data during the repair?',
    answer: 'For most repairs (screen, battery, charging port), your data remains intact. For motherboard and water damage repairs, there\'s a small risk. We recommend backing up your device before any repair. We also offer data recovery services if needed.',
  },
  {
    id: 'f6',
    category: 'quality',
    question: 'What\'s the difference between OEM-grade and High-Tier parts?',
    answer: 'OEM-grade parts are manufactured to the same specifications as original components, often by the same factories. High-Tier parts are quality-compatible alternatives that offer excellent performance at a lower price point. Both come with our 90-day warranty.',
  },
  {
    id: 'f7',
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, credit/debit cards, net banking, and cash. For online bookings, you can pay a nominal advance; the balance is due after repair completion and your satisfaction.',
  },
  {
    id: 'f8',
    category: 'booking',
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Absolutely! You can cancel or reschedule your booking up to 2 hours before your scheduled slot with a full refund of any advance paid. For courier pickups, cancellation is free until the pickup agent is dispatched.',
  },
  {
    id: 'f9',
    category: 'diagnostics',
    question: 'Do you charge for diagnostics?',
    answer: 'Our basic diagnostic check is free. For complex issues requiring board-level inspection or water damage assessment, a ₹499 diagnostic fee applies, which is waived if you proceed with the repair.',
  },
  {
    id: 'f10',
    category: 'parts',
    question: 'Can I buy spare parts and do the repair myself?',
    answer: 'Yes! We sell spare parts through our Spares portal. Each listing includes compatibility info, quality grade, and installation difficulty. However, we recommend professional installation for complex repairs to maintain warranty coverage.',
  },
];
