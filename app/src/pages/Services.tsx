import { Link, useParams } from 'react-router';
import { Monitor, Battery, Droplets, Cpu, Camera, Smartphone, Code, ArrowLeft, Check, Clock, Shield, ChevronRight } from 'lucide-react';
import { services, getServiceBySlug } from '@/data/services';
import { deviceModels } from '@/data/devices';
import { useMemo } from 'react';

const iconMap: Record<string, React.ElementType> = {
  'screen-repair': Monitor,
  'battery-replacement': Battery,
  'water-damage': Droplets,
  'motherboard': Cpu,
  'camera-repair': Camera,
  'charging-port': Smartphone,
  'software': Code,
  'back-glass': Smartphone,
};

export default function Services() {
  const { serviceSlug } = useParams<{ serviceSlug?: string }>();
  const service = serviceSlug ? getServiceBySlug(serviceSlug) : null;

  if (serviceSlug && service) {
    return <ServiceDetail service={service} />;
  }

  if (serviceSlug && !service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-h-xl text-neutral-950 mb-2">Service Not Found</h2>
          <p className="text-b-sm text-neutral-500 mb-4">The service you are looking for does not exist.</p>
          <Link to="/services" className="text-b-sm font-medium text-neutral-600 hover:text-neutral-950">
            View All Services
          </Link>
        </div>
      </div>
    );
  }

  return <ServicesList />;
}

function ServicesList() {
  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">What We Offer</p>
          <h1 className="text-h-xxl text-neutral-950 mb-4">Repair Services</h1>
          <p className="text-b-lg text-neutral-500 max-w-2xl mx-auto">
            From screen replacements to complex motherboard repairs, our certified technicians handle it all with precision and care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s) => {
            const Icon = iconMap[s.slug] || Smartphone;
            return (
              <Link
                key={s.id}
                to={`/services/${s.slug}`}
                className="group flex gap-5 bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-card-hover transition-all"
              >
                <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-neutral-900 transition-colors">
                  <Icon className="w-7 h-7 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-h-md text-neutral-950">{s.title}</h3>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
                  </div>
                  <p className="text-b-sm text-neutral-500 mb-3">{s.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-b-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.timeEstimate}
                    </span>
                    <span className="text-b-xs text-neutral-500 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {s.warrantyPeriod} warranty
                    </span>
                    <span className="text-b-xs font-medium text-neutral-700">From &#8377;{s.priceFrom.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ServiceDetail({ service }: { service: NonNullable<ReturnType<typeof getServiceBySlug>> }) {
  const Icon = iconMap[service.slug] || Smartphone;
  
  const compatibleDevices = useMemo(() => {
    const deviceSet = new Set<string>();
    service.applicableDevices.forEach((deviceType) => {
      deviceModels.filter((d) => {
        if (deviceType === 'iPhone' && d.type === 'iphone') return true;
        if (deviceType === 'Android' && d.type === 'android') return true;
        if (deviceType === 'iPad' && d.type === 'ipad') return true;
        if (deviceType === 'MacBook' && d.type === 'macbook') return true;
        if (deviceType === 'Watch' && d.type === 'watch') return true;
        return false;
      }).forEach((d) => deviceSet.add(d.name));
    });
    return Array.from(deviceSet).slice(0, 8);
  }, [service]);

  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <Link to="/services" className="inline-flex items-center gap-1 text-b-sm text-neutral-500 hover:text-neutral-950 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div>
            <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mb-6">
              <Icon className="w-8 h-8 text-neutral-700" />
            </div>
            <h1 className="text-h-xxl text-neutral-950 mb-4">{service.title}</h1>
            <p className="text-b-lg text-neutral-600 mb-6">{service.longDescription}</p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg">
                <Clock className="w-4 h-4 text-neutral-600" />
                <span className="text-b-sm font-medium">{service.timeEstimate}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg">
                <Shield className="w-4 h-4 text-neutral-600" />
                <span className="text-b-sm font-medium">{service.warrantyPeriod} warranty</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white rounded-lg">
                <span className="text-b-sm font-medium">From &#8377;{service.priceFrom.toLocaleString()}</span>
              </div>
            </div>

            <Link
              to="/repair"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-neutral-950 text-white rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Book This Service
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h3 className="text-h-sm text-neutral-950 mb-4">Popular Issues We Fix</h3>
              <ul className="space-y-2.5">
                {service.popularIssues.map((issue) => (
                  <li key={issue} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-b-sm text-neutral-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h3 className="text-h-sm text-neutral-950 mb-4">What's Included</h3>
              <ul className="space-y-2.5">
                {service.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-b-sm text-neutral-700">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {compatibleDevices.length > 0 && (
          <div>
            <h3 className="text-h-lg text-neutral-950 mb-4">Compatible Devices</h3>
            <div className="flex flex-wrap gap-2">
              {compatibleDevices.map((device) => (
                <Link
                  key={device}
                  to="/devices"
                  className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-b-sm text-neutral-700 hover:border-neutral-400 transition-colors"
                >
                  {device}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
