import { useState } from 'react';
import { Search, ChevronRight, MessageCircle } from 'lucide-react';
import { faqItems } from '@/data/faq';

const categories = ['all', 'pricing', 'warranty', 'pickup', 'time', 'data', 'quality', 'payment', 'booking', 'diagnostics', 'parts'];

const categoryLabels: Record<string, string> = {
  all: 'All Questions',
  pricing: 'Pricing',
  warranty: 'Warranty',
  pickup: 'Pickup & Delivery',
  time: 'Repair Time',
  data: 'Data Safety',
  quality: 'Part Quality',
  payment: 'Payment',
  booking: 'Booking',
  diagnostics: 'Diagnostics',
  parts: 'Spare Parts',
};

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = faqItems.filter((f) => {
    const matchesSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-24 pb-20">
      <div className="container-main max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Help Center</p>
          <h1 className="text-h-xxl text-neutral-950 mb-4">Frequently Asked Questions</h1>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-b-xs font-medium transition-colors ${
                activeCategory === cat ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filtered.map((faq) => (
            <details key={faq.id} className="group bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-neutral-50 transition-colors">
                <span className="text-b-sm font-medium text-neutral-950 pr-4">{faq.question}</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-5 pb-5">
                <p className="text-b-sm text-neutral-600 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-b-sm text-neutral-500">No questions found. Try a different search.</p>
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="mt-10 bg-neutral-50 rounded-xl border border-neutral-200 p-6 text-center">
          <p className="text-b-sm text-neutral-600 mb-3">Still have questions? Chat with us on WhatsApp</p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg text-b-sm font-medium hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Chat Now
          </a>
        </div>
      </div>
    </div>
  );
}
