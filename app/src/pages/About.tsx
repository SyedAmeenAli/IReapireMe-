import { Award, Users, Wrench, Clock, Shield, MapPin } from 'lucide-react';

const stats = [
  { value: '25,000+', label: 'Devices Repaired' },
  { value: '8+', label: 'Years Experience' },
  { value: '15+', label: 'Expert Technicians' },
  { value: '98%', label: 'Customer Satisfaction' },
];

const values = [
  { icon: Shield, title: 'Quality First', desc: 'We use only OEM-grade or high-tier compatible parts, never compromising on the quality of our repairs.' },
  { icon: Clock, title: 'Speed & Efficiency', desc: 'Most repairs are completed within the hour. We understand how important your device is to your daily life.' },
  { icon: Users, title: 'Customer Centric', desc: 'Transparent pricing, no hidden fees, and clear communication throughout the repair process.' },
  { icon: Award, title: 'Certified Experts', desc: 'Our technicians undergo rigorous training and certification for all major device brands.' },
];

export default function About() {
  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Our Story</p>
          <h1 className="text-h-xxl text-neutral-950 mb-4">About iRepairMe</h1>
          <p className="text-b-lg text-neutral-500 max-w-3xl mx-auto">
            Founded in 2016, iRepairMe has grown from a small repair shop to one of India&apos;s most trusted device restoration services. 
            Our mission is simple: provide professional, transparent, and reliable repair services for every device.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 text-center">
              <p className="text-h-xl text-neutral-950 mb-1">{s.value}</p>
              <p className="text-b-xs text-neutral-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Workshop Image */}
        <div className="rounded-2xl overflow-hidden mb-16">
          <img src="/images/about-workshop.jpg" alt="iRepairMe Workshop" className="w-full aspect-video object-cover" />
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-h-xxl text-neutral-950 text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-neutral-700" />
                </div>
                <h3 className="text-h-sm text-neutral-950 mb-2">{title}</h3>
                <p className="text-b-sm text-neutral-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-h-xxl text-neutral-950 text-center mb-10">Our Expert Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'David Henderson', role: 'Lead Technician', exp: '12 years' },
              { name: 'Mark Sterling', role: 'Micro-Soldering Specialist', exp: '8 years' },
              { name: 'Alex Mercer', role: 'Apple Certified Tech', exp: '6 years' },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-xl border border-neutral-200 p-6 text-center">
                <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-h-sm text-neutral-950 mb-1">{member.name}</h3>
                <p className="text-b-sm text-neutral-500 mb-1">{member.role}</p>
                <p className="text-b-xs text-neutral-400">{member.exp} experience</p>
              </div>
            ))}
          </div>
        </div>

        {/* Careers CTA */}
        <div className="bg-neutral-950 rounded-2xl p-8 md:p-12 text-center">
          <Wrench className="w-10 h-10 text-white mx-auto mb-4" />
          <h2 className="text-h-xl text-white mb-3">Join Our Team</h2>
          <p className="text-b-sm text-neutral-400 max-w-lg mx-auto mb-6">
            We&apos;re always looking for talented technicians who share our passion for quality repairs and customer service.
          </p>
          <a
            href="mailto:careers@irepairme.in"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-950 rounded-lg text-b-sm font-semibold hover:bg-neutral-100 transition-colors"
          >
            View Open Positions
          </a>
        </div>
      </div>
    </div>
  );
}
