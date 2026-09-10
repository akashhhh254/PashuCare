import React, { useState } from 'react';
import {
  PhoneCall,
  MapPin,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
  Navigation,
  Search,
  UserCheck,
  Star,
  FileText
} from 'lucide-react';
import { AnimalProfile, HealthReport, Language, VeterinarianRequest, UserProfile } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import { sampleVeterinaryDirectory } from '../data/diseases';

interface VeterinarianViewProps {
  animals: AnimalProfile[];
  reports: HealthReport[];
  user: UserProfile | null;
  language: Language;
  preselectedReport?: HealthReport | null;
  onSubmitVetRequest: (requestData: Partial<VeterinarianRequest>) => Promise<void>;
  pendingRequests: VeterinarianRequest[];
}

export const VeterinarianView: React.FC<VeterinarianViewProps> = ({
  animals,
  reports,
  user,
  language,
  preselectedReport,
  onSubmitVetRequest,
  pendingRequests,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [activeTab, setActiveTab] = useState<'consult' | 'directory' | 'my_requests'>('consult');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<string | null>(null);

  // Consultation Form State
  const [selectedAnimalId, setSelectedAnimalId] = useState(preselectedReport?.animalId || animals[0]?.id || '');
  const [preferredDate, setPreferredDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('Morning (09:00 AM - 12:00 PM)');
  const [description, setDescription] = useState(preselectedReport ? `Based on AI report: ${preselectedReport.result?.possibleConditions?.[0]?.name}` : '');
  const [attachReportId, setAttachReportId] = useState(preselectedReport?.id || (reports[0]?.id || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Request GPS Location
  const handleGetLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocating(false);
          setUserCoords(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setLocating(false);
          console.warn('Geolocation error:', error);
          setUserCoords('Baramati & Pune Agri Zone (Defaulted)');
        }
      );
    } else {
      setLocating(false);
    }
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedAnimal = animals.find((a) => a.id === selectedAnimalId);
      const chosenReport = reports.find((r) => r.id === attachReportId);

      await onSubmitVetRequest({
        userName: user?.name || 'Livestock Farmer',
        userPhone: user?.phone || '+91 98221 00000',
        animalId: selectedAnimalId,
        animalName: selectedAnimal ? selectedAnimal.name : (chosenReport?.animalName || 'Livestock'),
        animalType: selectedAnimal ? selectedAnimal.type : (chosenReport?.animalType || 'Cow'),
        symptoms: chosenReport?.symptoms || [],
        preferredDate,
        preferredTime,
        description,
        reportId: attachReportId || undefined,
        status: 'Pending',
      });

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 6000);
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDirectory = sampleVeterinaryDirectory.filter(
    (vet) =>
      vet.name.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      vet.location.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      vet.clinicName.toLowerCase().includes(searchDistrict.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner & 1962 Emergency Bar */}
      <div className="rounded-3xl bg-red-800 text-white p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider inline-block mb-2">
            Government of India • Ministry of Animal Husbandry
          </span>
          <h2 className="text-xl sm:text-2xl font-black">
            National Livestock Emergency Helpline: 1962
          </h2>
          <p className="text-xs sm:text-sm text-red-100 mt-1">
            Dial 1962 (Toll-Free 24x7) for immediate emergency assistance, mobile veterinary ambulances, or epidemic reporting.
          </p>
        </div>

        <a
          href="tel:1962"
          id="direct-call-1962-btn"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-red-800 font-extrabold text-sm sm:text-base hover:bg-red-50 transition shadow-md active:scale-95"
        >
          <PhoneCall className="w-5 h-5 text-red-700" />
          <span>Call 1962 Now</span>
        </a>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveTab('consult')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'consult'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          {t('vetConsultationTitle')}
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'directory'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          {t('vetNearbyHospitals')}
        </button>

        <button
          onClick={() => setActiveTab('my_requests')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'my_requests'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          My Requests ({pendingRequests.length})
        </button>
      </div>

      {/* TAB 1: Request Consultation Form */}
      {activeTab === 'consult' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-stone-900 mb-1">
              Book a Veterinary Doctor or Paravet Inspection
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mb-3">
              Your consultation request and attached AI findings will be dispatched to the taluka veterinary dispensary.
            </p>
            <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>Real-time Urgent Push Alerts active: You will be notified instantly when a doctor responds.</span>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Request Submitted Successfully!</strong>
                  <p className="mt-0.5">{t('vetRequestSuccess')}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitConsultation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('vetSelectAnimal')} *
                  </label>
                  <select
                    value={selectedAnimalId}
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type} - {a.tagId || 'No tag'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('vetAttachReport')}
                  </label>
                  <select
                    value={attachReportId}
                    onChange={(e) => setAttachReportId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="">-- None / Manual Inspection --</option>
                    {reports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.animalName} ({new Date(r.createdAt).toLocaleDateString()} - {r.result?.riskLevel} Risk)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('vetPreferredDate')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('vetPreferredTime')} *
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Morning (08:00 AM - 12:00 PM)">Morning (08:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                    <option value="Evening (04:00 PM - 07:00 PM)">Evening (04:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Farmer Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  defaultValue={user?.phone || '+91 98221 54321'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('vetDescription')}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your animal's signs, sudden drop in milk yield, refusal of feed, or specific questions for the doctor..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="submit-vet-consultation-btn"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition disabled:bg-stone-400 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : t('vetSubmitRequest')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Nearby Directory & Hospitals */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Location & District Search bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                placeholder="Search hospital by district, city, or doctor name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              onClick={handleGetLocation}
              disabled={locating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition shadow-2xs"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-700 ${locating ? 'animate-spin' : ''}`} />
              <span>{userCoords || t('vetUseLocation')}</span>
            </button>
          </div>

          {/* Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDirectory.map((vet) => (
              <div
                key={vet.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-emerald-600 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">{vet.name}</h3>
                      <span className="text-xs text-emerald-700 font-semibold block mt-0.5">
                        {vet.role}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {vet.rating}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    <p className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                      <span>{vet.clinicName}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                      <span>{vet.location} ({vet.distance})</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                      <span>{vet.availableTime}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {vet.services.map((srv, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100">
                  <a
                    href={`tel:${vet.phone}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Clinic ({vet.phone})</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: My Consultation Requests */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                      {req.animalName} ({req.animalType})
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mt-1">
                    "{req.description}"
                  </p>

                  <div className="mt-2 text-[11px] text-stone-400 flex items-center gap-3">
                    <span>Preferred Date: {req.preferredDate} ({req.preferredTime})</span>
                    <span>•</span>
                    <span>Requested on: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Assigned: Baramati Livestock Dispensary
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center max-w-md mx-auto">
              <UserCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-900 text-base">No Active Consultation Requests</h3>
              <p className="text-xs text-stone-500 mt-1">
                You haven't requested any veterinarian visits yet.
              </p>
              <button
                onClick={() => setActiveTab('consult')}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition"
              >
                Book a Consultation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
