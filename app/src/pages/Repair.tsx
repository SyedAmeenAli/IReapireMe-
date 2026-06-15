import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, ChevronLeft, Search, Check, ArrowRight, Smartphone, Tablet, Laptop, Watch, Headphones, Monitor, FileText, CalendarCheck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { services as staticServices } from '@/data/services';
import { useStore } from '@/store/useStore';

type Step = 'device' | 'brand' | 'model' | 'issue' | 'quote';

const deviceIcons: Record<string, React.ElementType> = {
  iphone: Smartphone,
  android: Smartphone,
  ipad: Tablet,
  macbook: Laptop,
  laptop: Laptop,
  watch: Watch,
  imac: Monitor,
  other: Smartphone,
};

const deviceLabels: Record<string, string> = {
  iphone: 'iPhone',
  android: 'Android Phone',
  ipad: 'iPad',
  macbook: 'MacBook',
  laptop: 'Laptop',
  watch: 'Apple Watch',
  imac: 'iMac',
  other: 'Other',
};

export default function Repair() {
  const [step, setStep] = useState<Step>('device');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { isLoggedIn, setLoginModalOpen, updateBooking } = useStore();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        setDbServices(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error("Failed to fetch services", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const dynamicDeviceTypes = useMemo(() => Array.from(new Set(dbServices.map(s => s.deviceType))).filter(Boolean) as string[], [dbServices]);
  
  const availableBrands = useMemo(() => {
    return Array.from(new Set(dbServices.filter(s => s.deviceType === selectedDevice).map(s => s.brand))).filter(Boolean) as string[];
  }, [dbServices, selectedDevice]);

  const availableModels = useMemo(() => {
    return Array.from(new Set(dbServices.filter(s => s.deviceType === selectedDevice && s.brand === selectedBrand).map(s => s.deviceModel))).filter(Boolean) as string[];
  }, [dbServices, selectedDevice, selectedBrand]);

  const filteredModels = modelSearch
    ? availableModels.filter((m: string) => m.toLowerCase().includes(modelSearch.toLowerCase()))
    : availableModels;

  const availableServicesForModel = useMemo(() => {
    return dbServices.filter(s => s.deviceModel === selectedModel);
  }, [dbServices, selectedModel]);

  const availableServicesList = useMemo(() => {
    return availableServicesForModel.map(dbSvc => {
      const staticSvc = staticServices.find(s => s.title === dbSvc.service);
      return {
        id: dbSvc.id,
        title: dbSvc.service,
        timeEstimate: staticSvc?.timeEstimate || '1-2 hours',
        warrantyPeriod: staticSvc?.warrantyPeriod || '90 days',
        priceFrom: dbSvc.price,
      };
    });
  }, [availableServicesForModel]);

  const selectedService = availableServicesList.find((s) => s.id === selectedIssueId);

  const handleBook = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    updateBooking({
      deviceType: selectedDevice as any,
      brand: selectedBrand,
      model: selectedModel,
      issue: selectedService?.title || '',
      priceLabel: selectedService ? `₹${selectedService.priceFrom.toLocaleString()}` : '',
      estimatedTime: selectedService?.timeEstimate || '',
    });
    navigate('/booking');
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'device', label: 'Device' },
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'issue', label: 'Issue' },
    { key: 'quote', label: 'Quote' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const howItWorksSteps = [
    {
      number: '01',
      icon: Smartphone,
      title: 'Tell Us Your Device & Issue',
      desc: 'Select your device type, brand, model, and describe what needs fixing. Takes under 60 seconds.',
    },
    {
      number: '02',
      icon: FileText,
      title: 'Get an Instant Quote',
      desc: 'Receive a transparent, upfront price estimate with repair time and warranty — no hidden fees.',
    },
    {
      number: '03',
      icon: CalendarCheck,
      title: 'Book or Schedule Pickup',
      desc: 'Confirm your appointment at our store or opt for our convenient doorstep pickup & delivery service.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── BOOKING FORM ── */}
      <div className="pt-28 pb-14">
      <div className="container-main max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-h-xxl text-neutral-950 mb-2">Book a Repair</h2>
          <p className="text-b-sm text-neutral-500">Follow the steps below to get an instant quote</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <button
                onClick={() => {
                  if (i < currentStepIndex) setStep(s.key);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-b-xs font-medium transition-colors ${
                  i <= currentStepIndex ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-500'
                } ${i < currentStepIndex ? 'cursor-pointer hover:bg-neutral-800' : ''}`}
              >
                {i < currentStepIndex ? <Check className="w-4 h-4" /> : i + 1}
              </button>
              <span className={`hidden sm:inline ml-2 text-b-xs font-medium ${i <= currentStepIndex ? 'text-neutral-950' : 'text-neutral-400'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 mx-1 text-neutral-300" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8">
          
          {isLoading ? (
             <div className="py-12 flex items-center justify-center">
                <p className="text-b-sm text-neutral-500">Loading catalog from database...</p>
             </div>
          ) : (
            <>
              {/* Device Selection */}
              {step === 'device' && (
                <div>
                  <h2 className="text-h-lg text-neutral-950 mb-6">Select Your Device Type</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {dynamicDeviceTypes.map((key) => {
                      const label = deviceLabels[key] || key;
                      const Icon = deviceIcons[key] || Smartphone;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedDevice(key);
                            setStep('brand');
                          }}
                          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover:border-neutral-400 ${
                            selectedDevice === key ? 'border-neutral-950 bg-neutral-50' : 'border-neutral-200'
                          }`}
                        >
                          <Icon className="w-8 h-8 text-neutral-600" />
                          <span className="text-b-sm font-medium text-neutral-950 capitalize">{label}</span>
                        </button>
                      );
                    })}
                    {dynamicDeviceTypes.length === 0 && (
                      <p className="col-span-full text-center text-b-sm text-neutral-500 py-4">No devices configured yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Brand Selection */}
              {step === 'brand' && (
                <div>
                  <button onClick={() => setStep('device')} className="text-b-sm text-neutral-500 hover:text-neutral-950 mb-4 flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-h-lg text-neutral-950 mb-6">Select Brand</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          setSelectedBrand(brand);
                          setStep('model');
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-neutral-400 ${
                          selectedBrand === brand ? 'border-neutral-950 bg-neutral-50' : 'border-neutral-200'
                        }`}
                      >
                        <span className="text-b-sm font-medium text-neutral-950">{brand}</span>
                      </button>
                    ))}
                    {availableBrands.length === 0 && (
                      <p className="col-span-full text-center text-b-sm text-neutral-500 py-4">No brands configured for this device.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Model Selection */}
              {step === 'model' && (
                <div>
                  <button onClick={() => setStep('brand')} className="text-b-sm text-neutral-500 hover:text-neutral-950 mb-4 flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-h-lg text-neutral-950 mb-4">Select Model</h2>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Search models..."
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg text-b-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    {filteredModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setStep('issue');
                        }}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all hover:border-neutral-400 text-left ${
                          selectedModel === model ? 'border-neutral-950 bg-neutral-50' : 'border-neutral-200'
                        }`}
                      >
                        <div>
                          <span className="text-b-sm font-medium text-neutral-950">{model}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                      </button>
                    ))}
                    {filteredModels.length === 0 && (
                      <p className="col-span-full text-center text-b-sm text-neutral-500 py-8">No models found. Try a different search.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Issue Selection */}
              {step === 'issue' && (
                <div>
                  <button onClick={() => setStep('model')} className="text-b-sm text-neutral-500 hover:text-neutral-950 mb-4 flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-h-lg text-neutral-950 mb-2">What&apos;s the Issue?</h2>
                  <p className="text-b-sm text-neutral-500 mb-6">{selectedModel}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableServicesList.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedIssueId(service.id);
                          setStep('quote');
                        }}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all hover:border-neutral-400 text-left ${
                          selectedIssueId === service.id ? 'border-neutral-950 bg-neutral-50' : 'border-neutral-200'
                        }`}
                      >
                        <span className="text-b-sm font-medium text-neutral-950 mb-1">{service.title}</span>
                        <span className="text-b-xs text-neutral-500">{service.timeEstimate}</span>
                        <span className="text-b-xs font-medium text-neutral-700 mt-1">&#8377;{service.priceFrom.toLocaleString()}</span>
                      </button>
                    ))}
                    {availableServicesList.length === 0 && (
                      <p className="col-span-full text-center text-b-sm text-neutral-500 py-8">No services configured for this model.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Quote */}
              {step === 'quote' && selectedService && (
                <div>
                  <button onClick={() => setStep('issue')} className="text-b-sm text-neutral-500 hover:text-neutral-950 mb-4 flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  
                  <div className="text-center mb-6">
                    <h2 className="text-h-lg text-neutral-950 mb-1">Repair Quote</h2>
                    <p className="text-b-sm text-neutral-500">{selectedModel} &middot; {selectedService.title}</p>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 mb-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-neutral-950 mb-1">
                        &#8377;{selectedService.priceFrom.toLocaleString()}
                      </p>
                      <p className="text-b-xs text-neutral-500 mb-4">Total Cost</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-b-xs text-neutral-500">Estimated Time</p>
                        <p className="text-b-sm font-medium">{selectedService.timeEstimate}</p>
                      </div>
                      <div>
                        <p className="text-b-xs text-neutral-500">Warranty</p>
                        <p className="text-b-sm font-medium">{selectedService.warrantyPeriod}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleBook}
                      className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3.5 rounded-lg text-b-sm font-semibold hover:bg-neutral-800 transition-colors"
                    >
                      Book Repair
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href="https://wa.me/918919076275"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 border border-neutral-300 text-neutral-700 py-3.5 rounded-lg text-b-sm font-medium hover:bg-neutral-50 transition-colors"
                    >
                      Ask on WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
      </div>

      {/* ── PREMIUM HOW IT WORKS SECTION ── */}
      <div
        className="pb-16 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #071a2e 0%, #0a2540 40%, #0d3b38 100%)',
        }}
      >
        {/* decorative glows */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(26,188,156,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(26,188,156,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div className="container-main relative pt-16">
          {/* badge */}
          <div className="flex justify-center mb-5">
            <span style={{ background: 'rgba(26,188,156,0.15)', border: '1px solid rgba(26,188,156,0.35)', color: '#1abc9c', borderRadius: '9999px', padding: '0.3rem 1.1rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              How it works
            </span>
          </div>

          {/* heading */}
          <div className="text-center mb-12">
            <h2 style={{ color: '#ffffff', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '0.75rem' }}>
              Get Your Device Fixed in
              <span style={{ color: '#1abc9c' }}> 3 Simple Steps</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
              Fast, transparent and hassle-free device repair — right from your screen.
            </p>
          </div>

          {/* steps grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {howItWorksSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ position: 'relative' }}>
                  {/* connector arrow between cards (desktop) */}
                  {i < howItWorksSteps.length - 1 && (
                    <div style={{ position: 'absolute', top: '50%', right: '-1.75rem', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', alignItems: 'center' }} className="hidden lg:flex">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <path d="M4 14h20M18 8l6 6-6 6" stroke="rgba(26,188,156,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* card */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '1.25rem',
                      padding: '2rem 1.75rem',
                      backdropFilter: 'blur(12px)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(26,188,156,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  >
                    {/* decorative step number */}
                    <span style={{ position: 'absolute', top: '0.75rem', right: '1.25rem', fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, color: 'rgba(26,188,156,0.08)', userSelect: 'none', pointerEvents: 'none' }}>
                      {s.number}
                    </span>

                    {/* icon bubble */}
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(26,188,156,0.3), rgba(26,188,156,0.1))', border: '1px solid rgba(26,188,156,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 0 20px rgba(26,188,156,0.15)' }}>
                      <Icon style={{ width: '24px', height: '24px', color: '#1abc9c' }} />
                    </div>

                    {/* step label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1abc9c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1abc9c', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Step {i + 1}</span>
                    </div>

                    <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, marginBottom: '0.6rem' }}>{s.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
