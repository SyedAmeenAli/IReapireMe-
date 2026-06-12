import { BookOpen, Clock, Award, MessageCircle, ChevronRight, Monitor, Cpu, Layers } from 'lucide-react';
import { Link } from 'react-router';

const courses = [
  {
    title: 'iPhone Repairing Course',
    description: 'Master iPhone repairs from basic screen replacements to advanced motherboard troubleshooting. Covers all models from iPhone X to 15 Pro Max.',
    duration: '4 weeks',
    level: 'Beginner to Advanced',
    icon: Monitor,
    topics: ['Screen & Battery Replacement', 'Water Damage Recovery', 'FaceID & Camera Repair', 'Logic Board Diagnostics'],
  },
  {
    title: 'MacBook Repairing Course',
    description: 'Learn professional MacBook repair techniques including T2 chip issues, liquid damage, and SSD upgrades. Covers Intel and Apple Silicon models.',
    duration: '6 weeks',
    level: 'Intermediate to Advanced',
    icon: Cpu,
    topics: ['Screen & Keyboard Replacement', 'Liquid Damage Treatment', 'T2 Chip Issues', 'SSD Upgrades'],
  },
  {
    title: 'LCD & LED Refurbishing Course',
    description: 'Specialized training in display panel refurbishing. Learn glass-only replacement, OCA lamination, and polarizer replacement techniques.',
    duration: '3 weeks',
    level: 'Specialized',
    icon: Layers,
    topics: ['Glass-Only Replacement', 'OCA Lamination', 'Polarizer Replacement', 'Dead Pixel Repair'],
  },
];

export default function Learn() {
  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Training Center</p>
          <h1 className="text-h-xxl text-neutral-950 mb-4">Learn With Us</h1>
          <p className="text-b-lg text-neutral-500 max-w-2xl mx-auto">
            Professional repair training courses taught by certified technicians with years of hands-on experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div key={course.title} className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-card-hover transition-all">
                <div className="p-6">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-neutral-700" />
                  </div>
                  <h3 className="text-h-md text-neutral-950 mb-2">{course.title}</h3>
                  <p className="text-b-sm text-neutral-500 mb-4">{course.description}</p>
                  <div className="flex items-center gap-4 mb-4 text-b-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {course.level}</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-b-xs font-medium text-neutral-700 mb-2">Topics Covered:</p>
                    <ul className="space-y-1.5">
                      {course.topics.map((topic) => (
                        <li key={topic} className="flex items-center gap-2 text-b-sm text-neutral-600">
                          <ChevronRight className="w-3 h-3 text-neutral-400" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <a
                    href="https://wa.me/919876543210?text=Hi! I'm interested in the repair training courses."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-950 text-white rounded-lg text-b-sm font-medium hover:bg-neutral-800 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enquire via WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why Learn With Us */}
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 md:p-12">
          <h2 className="text-h-xl text-neutral-950 text-center mb-10">Why Learn With iRepairMe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Hands-On Training', desc: 'Work on real devices under expert supervision. No simulations - only real repairs.' },
              { title: 'Certified Instructors', desc: 'Learn from Apple-certified and industry-veteran technicians with 10+ years experience.' },
              { title: 'Job Placement', desc: 'Graduates get priority placement in our partner service centers across India.' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="text-h-sm text-neutral-950 mb-2">{item.title}</h3>
                <p className="text-b-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
