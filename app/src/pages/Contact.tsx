import { useState } from 'react';
import { Link } from 'react-router';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Get in Touch</p>
          <h1 className="text-h-xxl text-neutral-950 mb-4">Contact Us</h1>
          <p className="text-b-lg text-neutral-500 max-w-2xl mx-auto">
            Have a question or need assistance? We&apos;re here to help. Reach out through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
              <h3 className="text-h-sm text-neutral-950 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-neutral-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-b-sm font-medium text-neutral-950">Phone</p>
                    <a href="tel:+918919076275" className="text-b-sm text-neutral-500 hover:text-neutral-950">+91 89190 76275</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-neutral-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-b-sm font-medium text-neutral-950">Email</p>
                    <a href="mailto:support@irepairme.in" className="text-b-sm text-neutral-500 hover:text-neutral-950">support@irepairme.in</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-neutral-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-b-sm font-medium text-neutral-950">Address</p>
                    <p className="text-b-sm text-neutral-500">Shop No 203, 2nd Floor, Podium Mall, Toli Chowki, Hyderabad, Telangana 500008</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-neutral-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-b-sm font-medium text-neutral-950">Working Hours</p>
                    <p className="text-b-sm text-neutral-500">Mon - Sat: 10:00 AM - 8:00 PM</p>
                    <p className="text-b-sm text-neutral-500">Sunday: 11:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
              <h3 className="text-h-sm text-neutral-950 mb-3">Quick Support</h3>
              <p className="text-b-sm text-neutral-500 mb-4">Get instant help via WhatsApp</p>
              <a
                href="https://wa.me/918919076275"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg text-b-sm font-medium hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>

            <img src="/images/contact-storefront.jpg" alt="iRepairMe Storefront" className="w-full rounded-xl object-cover aspect-video" />
          </div>

          {/* Contact Form */}
          <div>
            {submitted ? (
              <div className="bg-green-50 rounded-xl border border-green-200 p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-h-lg text-neutral-950 mb-2">Message Sent!</h3>
                <p className="text-b-sm text-neutral-500">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                <h3 className="text-h-sm text-neutral-950 mb-2">Send a Message</h3>
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-b-xs font-medium text-neutral-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
