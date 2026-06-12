export type SubmissionStatus = 'new' | 'quote-sent' | 'approved' | 'pickup-scheduled' | 'received' | 'diagnosis' | 'waiting-for-part' | 'repairing' | 'testing' | 'ready' | 'delivered' | 'cancelled';
export type SourceType = 'web' | 'whatsapp' | 'call' | 'instagram' | 'walk-in';

export interface Submission {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: SubmissionStatus;
  source: SourceType;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  device: {
    deviceType: string;
    brand: string;
    model: string;
    issue: string;
    partQuality?: string;
    images: string[];
  };
  appointment: {
    serviceMethod: 'pickup' | 'dropoff' | 'courier' | 'onsite';
    appointmentDatetime?: string;
    address?: string;
    notes?: string;
  };
  quotedPriceLabel?: string;
  estimatedTimeLabel?: string;
  internalNotes?: string;
}

export const submissions: Submission[] = [
  {
    id: 'SUB-240612-001',
    createdAt: '2024-12-12T09:30:00Z',
    updatedAt: '2024-12-12T14:20:00Z',
    status: 'repairing',
    source: 'web',
    customer: { name: 'Arjun Mehta', phone: '+91 98765 43210', email: 'arjun.m@email.com' },
    device: { deviceType: 'iphone', brand: 'Apple', model: 'iPhone 14 Pro', issue: 'Screen cracked, touch not working', partQuality: 'oem', images: [] },
    appointment: { serviceMethod: 'dropoff', appointmentDatetime: '2024-12-12T10:00:00Z', notes: 'Customer dropped off at 10 AM' },
    quotedPriceLabel: '₹12,499 (OEM)',
    estimatedTimeLabel: '45 minutes',
    internalNotes: 'Screen replacement in progress. Display assembly removed, installing new OEM panel.',
  },
  {
    id: 'SUB-240612-002',
    createdAt: '2024-12-12T08:15:00Z',
    updatedAt: '2024-12-12T11:00:00Z',
    status: 'diagnosis',
    source: 'whatsapp',
    customer: { name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya.s@email.com' },
    device: { deviceType: 'android', brand: 'Samsung', model: 'Galaxy S23 Ultra', issue: 'Phone won\'t charge, liquid damage suspected', partQuality: 'oem', images: [] },
    appointment: { serviceMethod: 'courier', address: '42, MG Road, Bangalore - 560001', notes: 'Courier pickup scheduled' },
    quotedPriceLabel: '₹2,499 (diagnostic) + parts',
    estimatedTimeLabel: '2-3 days',
    internalNotes: 'Device received via courier. Initial inspection shows corrosion around charging port. Ultrasonic cleaning scheduled.',
  },
  {
    id: 'SUB-240612-003',
    createdAt: '2024-12-12T07:45:00Z',
    updatedAt: '2024-12-12T09:00:00Z',
    status: 'new',
    source: 'web',
    customer: { name: 'Rahul Verma', phone: '+91 76543 21098', email: 'rahul.v@email.com' },
    device: { deviceType: 'iphone', brand: 'Apple', model: 'iPhone 13', issue: 'Battery draining fast, overheating', partQuality: 'high-tier', images: [] },
    appointment: { serviceMethod: 'pickup', address: '15, Koramangala 5th Block, Bangalore', notes: 'Prefer morning pickup' },
    quotedPriceLabel: '₹1,999 (High-Tier)',
    estimatedTimeLabel: '30 minutes',
  },
  {
    id: 'SUB-240612-004',
    createdAt: '2024-12-11T16:30:00Z',
    updatedAt: '2024-12-12T10:00:00Z',
    status: 'ready',
    source: 'call',
    customer: { name: 'Sneha Gupta', phone: '+91 65432 10987', email: 'sneha.g@email.com' },
    device: { deviceType: 'macbook', brand: 'Apple', model: 'MacBook Air M2', issue: 'Liquid spill, keyboard not working', images: [] },
    appointment: { serviceMethod: 'dropoff', appointmentDatetime: '2024-12-11T17:00:00Z', notes: 'Coffee spill on keyboard' },
    quotedPriceLabel: '₹8,499',
    estimatedTimeLabel: '1 day',
    internalNotes: 'Keyboard replacement complete. All keys tested. Device cleaned and reassembled. Ready for pickup.',
  },
  {
    id: 'SUB-240612-005',
    createdAt: '2024-12-11T14:00:00Z',
    updatedAt: '2024-12-11T18:30:00Z',
    status: 'delivered',
    source: 'walk-in',
    customer: { name: 'Vikram Reddy', phone: '+91 54321 09876', email: 'vikram.r@email.com' },
    device: { deviceType: 'android', brand: 'OnePlus', model: 'OnePlus 11', issue: 'Back glass cracked', partQuality: 'high-tier', images: [] },
    appointment: { serviceMethod: 'dropoff', appointmentDatetime: '2024-12-11T14:30:00Z' },
    quotedPriceLabel: '₹2,499',
    estimatedTimeLabel: '1 hour',
    internalNotes: 'Back glass replaced using laser separation. Customer picked up at 6:30 PM.',
  },
  {
    id: 'SUB-240612-006',
    createdAt: '2024-12-11T11:20:00Z',
    updatedAt: '2024-12-11T15:00:00Z',
    status: 'approved',
    source: 'instagram',
    customer: { name: 'Ananya Patel', phone: '+91 43210 98765', email: 'ananya.p@email.com' },
    device: { deviceType: 'iphone', brand: 'Apple', model: 'iPhone 15 Pro Max', issue: 'Camera lens cracked, photos blurry', partQuality: 'oem', images: [] },
    appointment: { serviceMethod: 'courier', address: '88, Indiranagar, Bangalore - 560038' },
    quotedPriceLabel: '₹5,999 (OEM)',
    estimatedTimeLabel: '45 minutes',
  },
  {
    id: 'SUB-240612-007',
    createdAt: '2024-12-11T09:00:00Z',
    updatedAt: '2024-12-11T12:00:00Z',
    status: 'testing',
    source: 'web',
    customer: { name: 'Karan Malhotra', phone: '+91 32109 87654', email: 'karan.m@email.com' },
    device: { deviceType: 'iphone', brand: 'Apple', model: 'iPhone 12', issue: 'Motherboard issue, won\'t boot', images: [] },
    appointment: { serviceMethod: 'dropoff', appointmentDatetime: '2024-12-10T11:00:00Z', notes: 'Important data needs recovery' },
    quotedPriceLabel: '₹4,999 (diagnostic) + parts',
    estimatedTimeLabel: '3-5 days',
    internalNotes: 'IC replacement completed. Board-level repair done. Testing all functions before handover. Data recovered successfully.',
  },
  {
    id: 'SUB-240612-008',
    createdAt: '2024-12-10T15:30:00Z',
    updatedAt: '2024-12-10T16:00:00Z',
    status: 'cancelled',
    source: 'whatsapp',
    customer: { name: 'Neha Kapoor', phone: '+91 21098 76543', email: 'neha.k@email.com' },
    device: { deviceType: 'ipad', brand: 'Apple', model: 'iPad Air 5', issue: 'Screen unresponsive after drop', images: [] },
    appointment: { serviceMethod: 'pickup', address: '21, Whitefield, Bangalore' },
    quotedPriceLabel: '₹8,999',
    estimatedTimeLabel: '1 hour',
    internalNotes: 'Customer cancelled - decided to buy new iPad instead.',
  },
  {
    id: 'SUB-240612-009',
    createdAt: '2024-12-10T13:00:00Z',
    updatedAt: '2024-12-12T08:00:00Z',
    status: 'waiting-for-part',
    source: 'web',
    customer: { name: 'Rohit Singh', phone: '+91 10987 65432', email: 'rohit.s@email.com' },
    device: { deviceType: 'android', brand: 'Google', model: 'Pixel 8 Pro', issue: 'Display showing green lines', partQuality: 'oem', images: [] },
    appointment: { serviceMethod: 'dropoff', appointmentDatetime: '2024-12-10T14:00:00Z' },
    quotedPriceLabel: '₹14,999 (OEM)',
    estimatedTimeLabel: '45 minutes',
    internalNotes: 'OEM display panel on order. Expected delivery by Dec 13.',
  },
  {
    id: 'SUB-240612-010',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-10T11:30:00Z',
    status: 'pickup-scheduled',
    source: 'call',
    customer: { name: 'Divya Nair', phone: '+91 99887 76655', email: 'divya.n@email.com' },
    device: { deviceType: 'watch', brand: 'Apple', model: 'Apple Watch Series 9', issue: 'Screen popped out, battery swollen', images: [] },
    appointment: { serviceMethod: 'pickup', address: '55, JP Nagar, Bangalore', notes: 'Morning pickup preferred' },
    quotedPriceLabel: '₹3,499',
    estimatedTimeLabel: '1 hour',
  },
];

export const statusLabels: Record<SubmissionStatus, string> = {
  'new': 'New',
  'quote-sent': 'Quote Sent',
  'approved': 'Approved',
  'pickup-scheduled': 'Pickup Scheduled',
  'received': 'Received',
  'diagnosis': 'In Diagnosis',
  'waiting-for-part': 'Waiting for Part',
  'repairing': 'Repairing',
  'testing': 'Testing',
  'ready': 'Ready',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
};

export const statusColors: Record<SubmissionStatus, string> = {
  'new': 'bg-blue-50 text-blue-700',
  'quote-sent': 'bg-yellow-50 text-yellow-700',
  'approved': 'bg-green-50 text-green-700',
  'pickup-scheduled': 'bg-purple-50 text-purple-700',
  'received': 'bg-gray-100 text-gray-700',
  'diagnosis': 'bg-orange-50 text-orange-700',
  'waiting-for-part': 'bg-pink-50 text-pink-700',
  'repairing': 'bg-indigo-50 text-indigo-700',
  'testing': 'bg-cyan-50 text-cyan-700',
  'ready': 'bg-emerald-50 text-emerald-700',
  'delivered': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-50 text-red-700',
};
