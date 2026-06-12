import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

interface LegalDoc {
  slug: string;
  title: string;
  content: string;
}

const legalDocs: LegalDoc[] = [
  {
    slug: 'terms',
    title: 'Terms of Service',
    content: `**1. Acceptance of Terms**\nBy accessing and using the iRepairMe website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.\n\n**2. Service Description**\niRepairMe provides device repair services, spare parts sales, and related technical services. All services are subject to availability and device assessment.\n\n**3. Repair Process**\nAll repairs require a preliminary diagnostic assessment. Final pricing may vary based on the actual condition of the device. We will obtain your approval before proceeding with any repairs that exceed the initial quote.\n\n**4. Warranty**\nAll repairs come with a 90-day warranty covering parts and labor, unless otherwise specified. Water damage repairs carry a 30-day warranty. The warranty does not cover subsequent physical damage, liquid exposure, or unauthorized modifications.\n\n**5. Data Responsibility**\nWhile we take utmost care during repairs, we recommend backing up all data before submitting your device. iRepairMe is not responsible for data loss during the repair process.\n\n**6. Cancellation Policy**\nYou may cancel or reschedule your booking up to 2 hours before your scheduled slot with a full refund of any advance paid.\n\n**7. Limitation of Liability**\niRepairMe's liability is limited to the value of the repair service provided. We are not liable for any indirect, incidental, or consequential damages.`,
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    content: `**1. Information Collection**\nWe collect personal information including name, phone number, email address, and device details necessary to provide our repair services.\n\n**2. Use of Information**\nYour information is used solely for the purpose of providing repair services, order tracking, and customer support. We do not sell or share your personal data with third parties for marketing purposes.\n\n**3. Data Security**\nWe implement industry-standard security measures to protect your personal information. All data is stored on secure servers with encryption.\n\n**4. Cookies**\nOur website uses cookies to enhance user experience and analyze traffic. You can control cookie preferences through your browser settings.\n\n**5. Third-Party Services**\nWe may use third-party services for payment processing and analytics. These services have their own privacy policies and data handling practices.\n\n**6. Your Rights**\nYou have the right to access, correct, or delete your personal information. Contact us to exercise these rights.\n\n**7. Policy Updates**\nWe may update this privacy policy from time to time. Changes will be posted on this page with an updated effective date.`,
  },
  {
    slug: 'refund-policy',
    title: 'Return & Refund Policy',
    content: `**1. Repair Services**\nIf we are unable to complete a repair, you will receive a full refund of any charges paid. If the repair is completed but the issue persists within the warranty period, we will re-service at no additional cost.\n\n**2. Spare Parts**\nSpare parts can be returned within 7 days of delivery if unused and in original packaging. Used or installed parts are not eligible for return.\n\n**3. Refund Process**\nRefunds will be processed within 5-7 business days to the original payment method.\n\n**4. Defective Parts**\nDefective spare parts will be replaced free of charge within the warranty period.`,
  },
  {
    slug: 'repair-warranty',
    title: 'Repair Warranty',
    content: `**1. Warranty Coverage**\nAll repairs performed by iRepairMe come with a 90-day warranty covering both parts and labor. Water damage repairs carry a 30-day warranty.\n\n**2. What's Covered**\nThe warranty covers defects in parts and workmanship. If the same issue recurs within the warranty period, we will repair it free of charge.\n\n**3. What's Not Covered**\n- Subsequent physical damage\n- Liquid exposure after repair\n- Unauthorized modifications or repairs\n- Software issues unrelated to the repair\n- Normal wear and tear\n\n**4. Warranty Claim Process**\nContact us with your repair order ID and describe the issue. We will assess the device and proceed with the warranty repair if applicable.\n\n**5. Limitations**\nThe warranty is limited to the original repair and does not extend to other components or issues.`,
  },
  {
    slug: 'pickup-delivery-policy',
    title: 'Pickup & Delivery Policy',
    content: `**1. Service Areas**\nWe offer free doorstep pickup and delivery in Bangalore, Mumbai, Delhi, Hyderabad, and Chennai. For other locations, a prepaid courier service is available.\n\n**2. Scheduling**\nPickup and delivery slots can be scheduled during booking. Same-day pickup is available for bookings made before 2 PM.\n\n**3. Packaging**\nFor courier services, please ensure your device is securely packaged. We recommend using the original box with adequate cushioning.\n\n**4. Insurance**\nAll courier shipments are insured up to the device value. In the unlikely event of damage during transit, we will cover the repair costs.\n\n**5. Delivery Timeline**\nDevices are typically returned within the estimated repair time plus 1 day for delivery. You will receive tracking information once the device is dispatched.`,
  },
];

export default function Legal() {
  const { pageSlug } = useParams<{ pageSlug?: string }>();
  
  const doc = legalDocs.find((d) => d.slug === pageSlug);

  if (!doc) {
    return (
      <div className="pt-24 pb-20">
        <div className="container-main max-w-3xl">
          <h1 className="text-h-xxl text-neutral-950 mb-8">Legal Information</h1>
          <div className="space-y-3">
            {legalDocs.map((d) => (
              <Link
                key={d.slug}
                to={`/${d.slug}`}
                className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors"
              >
                <span className="text-b-sm font-medium text-neutral-950">{d.title}</span>
                <span className="text-b-xs text-neutral-400">View</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container-main max-w-3xl">
        <Link to="/terms" className="inline-flex items-center gap-1 text-b-sm text-neutral-500 hover:text-neutral-950 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Legal Pages
        </Link>
        <h1 className="text-h-xxl text-neutral-950 mb-8">{doc.title}</h1>
        <div className="prose prose-neutral max-w-none">
          {doc.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return <h3 key={i} className="text-h-md text-neutral-950 mt-8 mb-3">{paragraph.replace(/\*\*/g, '')}</h3>;
            }
            return <p key={i} className="text-b-sm text-neutral-600 leading-relaxed mb-4">{paragraph}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
