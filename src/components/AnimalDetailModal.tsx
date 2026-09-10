import React, { useState } from 'react';
import {
  X,
  HeartPulse,
  Calendar,
  Activity,
  Trash2,
  Edit2,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck,
  Plus,
  Syringe,
  Pill,
  Stethoscope,
  Scale,
  Printer,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Save,
  Info
} from 'lucide-react';
import {
  AnimalProfile,
  HealthReport,
  Language,
  VaccinationRecord,
  DewormingRecord,
  TreatmentRecord,
  WeightRecord,
  VetVisitRecord
} from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface AnimalDetailModalProps {
  animal: AnimalProfile;
  reports: HealthReport[];
  language: Language;
  onClose: () => void;
  onRunHealthCheck: (animal: AnimalProfile) => void;
  onSelectReport: (report: HealthReport) => void;
  onDeleteAnimal: (animalId: string) => void;
  onUpdateAnimal?: (updated: AnimalProfile) => Promise<void>;
  onAskAI?: (animal: AnimalProfile) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  reports,
  language,
  onClose,
  onRunHealthCheck,
  onSelectReport,
  onDeleteAnimal,
  onUpdateAnimal,
  onAskAI,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'vaccines' | 'treatments' | 'vet_visits' | 'summary'>('overview');
  
  // Current editable animal state
  const [currentAnimal, setCurrentAnimal] = useState<AnimalProfile>(animal);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit fields
  const [editWeight, setEditWeight] = useState(animal.weight || '');
  const [editReproductive, setEditReproductive] = useState(animal.reproductiveStatus || 'Intact');
  const [editLocation, setEditLocation] = useState(animal.farmLocation || '');
  const [editNotes, setEditNotes] = useState(animal.ownerNotes || '');

  // Log record forms
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({
    vaccineName: 'FMD (Foot and Mouth Disease)',
    dateAdministered: new Date().toISOString().split('T')[0],
    nextDueDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
    veterinarian: '',
    batchNumber: '',
    notes: '',
  });

  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState({
    medicationName: '',
    reason: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    prescribingVet: '',
    dosageInstructions: '',
    withdrawalPeriodDays: 3,
    notes: '',
  });

  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    clinicOrVet: '',
    reason: 'Routine Checkup / Followup',
    officialDiagnosis: '',
    clinicalFindings: '',
    prescribedPlan: '',
    followUpDate: '',
  });

  const animalReports = reports.filter((r) => r.animalId === currentAnimal.id);

  // Save edited profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updated: AnimalProfile = {
        ...currentAnimal,
        weight: editWeight,
        reproductiveStatus: editReproductive as any,
        farmLocation: editLocation,
        ownerNotes: editNotes,
        updatedAt: new Date().toISOString()
      };
      if (onUpdateAnimal) {
        await onUpdateAnimal(updated);
      }
      setCurrentAnimal(updated);
      setIsEditingProfile(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Vaccination
  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineForm.vaccineName.trim()) return;

    const newRecord: VaccinationRecord = {
      id: `vac-${Date.now()}`,
      vaccineName: vaccineForm.vaccineName,
      dateAdministered: vaccineForm.dateAdministered,
      nextDueDate: vaccineForm.nextDueDate || undefined,
      veterinarian: vaccineForm.veterinarian || undefined,
      batchNumber: vaccineForm.batchNumber || undefined,
      notes: vaccineForm.notes || undefined
    };

    const updatedVaccines = [...(currentAnimal.vaccinations || []), newRecord];
    const updated: AnimalProfile = {
      ...currentAnimal,
      vaccinations: updatedVaccines,
      updatedAt: new Date().toISOString()
    };

    if (onUpdateAnimal) {
      await onUpdateAnimal(updated);
    }
    setCurrentAnimal(updated);
    setShowAddVaccineModal(false);
    setVaccineForm({
      vaccineName: 'FMD (Foot and Mouth Disease)',
      dateAdministered: new Date().toISOString().split('T')[0],
      nextDueDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
      veterinarian: '',
      batchNumber: '',
      notes: '',
    });
  };

  // Add Treatment
  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentForm.medicationName.trim()) return;

    const newRecord: TreatmentRecord = {
      id: `treat-${Date.now()}`,
      medicationName: treatmentForm.medicationName,
      reason: treatmentForm.reason,
      startDate: treatmentForm.startDate,
      endDate: treatmentForm.endDate || undefined,
      prescribingVet: treatmentForm.prescribingVet || undefined,
      dosageInstructions: treatmentForm.dosageInstructions || undefined,
      withdrawalPeriodDays: Number(treatmentForm.withdrawalPeriodDays) || 0,
      notes: treatmentForm.notes || undefined
    };

    const updatedTreatments = [...(currentAnimal.treatments || []), newRecord];
    const updated: AnimalProfile = {
      ...currentAnimal,
      treatments: updatedTreatments,
      updatedAt: new Date().toISOString()
    };

    if (onUpdateAnimal) {
      await onUpdateAnimal(updated);
    }
    setCurrentAnimal(updated);
    setShowAddTreatmentModal(false);
  };

  // Add Vet Visit
  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitForm.clinicOrVet.trim()) return;

    const newRecord: VetVisitRecord = {
      id: `visit-${Date.now()}`,
      visitDate: visitForm.visitDate,
      clinicOrVet: visitForm.clinicOrVet,
      reason: visitForm.reason,
      clinicalFindings: visitForm.clinicalFindings || undefined,
      officialDiagnosis: visitForm.officialDiagnosis || undefined,
      prescribedPlan: visitForm.prescribedPlan || undefined,
      followUpDate: visitForm.followUpDate || undefined
    };

    const updatedVisits = [...(currentAnimal.vetVisits || []), newRecord];
    const updated: AnimalProfile = {
      ...currentAnimal,
      vetVisits: updatedVisits,
      updatedAt: new Date().toISOString()
    };

    if (onUpdateAnimal) {
      await onUpdateAnimal(updated);
    }
    setCurrentAnimal(updated);
    setShowAddVisitModal(false);
  };

  // Combined Timeline Events
  const timelineEvents = [
    {
      id: 'birth',
      date: currentAnimal.dateOfBirth || currentAnimal.createdAt,
      type: 'birth',
      title: 'Registration / Janam Kundli Opened',
      desc: `Registered as ${currentAnimal.type} (${currentAnimal.breed || 'Indigenous'}) with Ear Tag ${currentAnimal.tagId || 'No Tag'}.`,
    },
    ...(currentAnimal.vaccinations || []).map((v) => ({
      id: v.id,
      date: v.dateAdministered,
      type: 'vaccine',
      title: `Vaccination: ${v.vaccineName}`,
      desc: `Administered on ${v.dateAdministered}${v.veterinarian ? ` by Dr. ${v.veterinarian}` : ''}. Next due: ${v.nextDueDate || 'Not set'}.`,
    })),
    ...(currentAnimal.treatments || []).map((t) => ({
      id: t.id,
      date: t.startDate,
      type: 'treatment',
      title: `Treatment: ${t.medicationName}`,
      desc: `Prescribed for "${t.reason}". Withdrawal period: ${t.withdrawalPeriodDays || 0} days for food safety.`,
    })),
    ...(currentAnimal.vetVisits || []).map((vv) => ({
      id: vv.id,
      date: vv.visitDate,
      type: 'vet_visit',
      title: `Vet Visit: ${vv.clinicOrVet}`,
      desc: `Official Diagnosis: ${vv.officialDiagnosis || vv.reason || 'General Examination'}.`,
    })),
    ...animalReports.map((r) => ({
      id: r.id,
      date: r.createdAt,
      type: 'ai_check',
      title: `AI Health Scan (${r.result?.riskLevel || 'Low'} Risk)`,
      desc: `Observed: ${r.symptoms?.join(', ') || 'Routine examination'}. AI Health Score: ${r.result?.healthScore || 80}/100.`,
      report: r,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="relative h-44 bg-emerald-900 overflow-hidden shrink-0">
          {currentAnimal.photoUrl ? (
            <img
              src={currentAnimal.photoUrl}
              alt={currentAnimal.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-white/30 bg-radial from-emerald-700 to-emerald-950">
              {currentAnimal.type === 'Cow' ? '🐄' : currentAnimal.type === 'Buffalo' ? '🐃' : currentAnimal.type === 'Goat' ? '🐐' : '🐑'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Ear Tag */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                  {currentAnimal.type} • {currentAnimal.breed || 'Indigenous'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/80 text-white">
                  Janam Kundli
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                {currentAnimal.name}
              </h2>
              <span className="text-xs text-stone-300 block">
                Ear Tag ID: {currentAnimal.tagId || 'Unassigned'} • Microchip: {currentAnimal.microchipNumber || 'None'}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                  currentAnimal.status === 'Critical'
                    ? 'bg-red-600 text-white'
                    : currentAnimal.status === 'Under Observation'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {currentAnimal.status}
              </span>
              <span className="block text-[11px] text-emerald-200 mt-1 font-bold">
                Health Score: {currentAnimal.healthScore || 85}/100
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 overflow-x-auto shrink-0 scrollbar-none px-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            📋 Profile & Kundli
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'timeline'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            🕒 Health Timeline ({timelineEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vaccines')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'vaccines'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            💉 Vaccines & Deworming ({currentAnimal.vaccinations?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('treatments')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'treatments'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            💊 Treatments & Withdrawals ({currentAnimal.treatments?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vet_visits')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'vet_visits'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            🩺 Vet Visits ({currentAnimal.vetVisits?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'summary'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            📄 Vet Summary Dossier
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW & JANAM KUNDLI */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Quick Action Bar */}
              <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRunHealthCheck(currentAnimal);
                  }}
                  className="flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Run AI Health Vision Scan</span>
                </button>

                {onAskAI && (
                  <button
                    type="button"
                    onClick={() => onAskAI(currentAnimal)}
                    className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    <span>Ask AI about {currentAnimal.name}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="p-2.5 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4 text-stone-600" />
                  <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Kundli'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove ${currentAnimal.name} from your herd? This cannot be undone.`)) {
                      onDeleteAnimal(currentAnimal.id);
                      onClose();
                    }
                  }}
                  className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Mode View */}
              {isEditingProfile ? (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
                  <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-700" />
                    <span>Update Janam Kundli Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Body Weight (kg)</label>
                      <input
                        type="text"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        placeholder="e.g. 350"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Reproductive Status</label>
                      <select
                        value={editReproductive}
                        onChange={(e) => setEditReproductive(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                      >
                        <option value="Intact">Intact / Normal</option>
                        <option value="Lactating">Lactating (दूध दे रही है)</option>
                        <option value="Pregnant">Pregnant (गाभिन / गर्भावती)</option>
                        <option value="Dry">Dry Period</option>
                        <option value="In Heat">In Heat (मद में / ताव)</option>
                        <option value="Neutered">Neutered / Castrated</option>
                        <option value="Spayed">Spayed</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Barn / Shed Location</label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="Shed No. 2, East Stall"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Caretaker / Health Notes</label>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Gentle temper, prefers dry fodder..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Kundli'}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Detailed Janam Kundli Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Age & DOB</span>
                  <strong className="text-stone-900 text-sm">{currentAnimal.age || '—'} Years</strong>
                  {currentAnimal.dateOfBirth && (
                    <span className="text-[10px] text-stone-500 block">DOB: {currentAnimal.dateOfBirth}</span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Sex & Status</span>
                  <strong className="text-stone-900 text-sm">{currentAnimal.gender || 'Female'}</strong>
                  <span className="text-[10px] text-emerald-700 font-bold block">{currentAnimal.reproductiveStatus || 'Intact'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Weight</span>
                  <strong className="text-stone-900 text-sm">
                    {currentAnimal.weight ? `${currentAnimal.weight} ${currentAnimal.weightUnit || 'kg'}` : 'Not recorded'}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Health Score</span>
                  <strong className="text-emerald-700 text-sm font-black">{currentAnimal.healthScore || 85} / 100</strong>
                  <span className="text-[10px] text-stone-500 block">Status: {currentAnimal.status}</span>
                </div>
              </div>

              {/* Identification and Herd Details */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>Identification & Registration Particulars</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-stone-600">
                  <div><strong>Ear Tag ID:</strong> {currentAnimal.tagId || 'None'}</div>
                  <div><strong>Microchip:</strong> {currentAnimal.microchipNumber || 'Not chipped'}</div>
                  <div><strong>Breed Classification:</strong> {currentAnimal.breed || 'Indigenous / Desi'}</div>
                  <div><strong>Herd / Stall Location:</strong> {currentAnimal.farmLocation || 'Main Barn'}</div>
                  <div><strong>Color & Markings:</strong> {currentAnimal.colorMarkings || 'Natural coat'}</div>
                  <div><strong>Acquisition Date:</strong> {currentAnimal.acquisitionDate || 'Not specified'}</div>
                </div>
                {currentAnimal.ownerNotes && (
                  <div className="mt-2 pt-2 border-t border-stone-200 text-xs text-stone-600">
                    <strong>Owner Notes:</strong> {currentAnimal.ownerNotes}
                  </div>
                )}
              </div>

              {/* Recent AI Health Checks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Recent AI Health Vision Reports ({animalReports.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRunHealthCheck(currentAnimal);
                    }}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    + New Scan
                  </button>
                </div>

                {animalReports.length > 0 ? (
                  <div className="space-y-2">
                    {animalReports.slice(0, 3).map((rep) => (
                      <div
                        key={rep.id}
                        onClick={() => {
                          onClose();
                          onSelectReport(rep);
                        }}
                        className="p-3 rounded-xl bg-white border border-stone-200 hover:border-emerald-600 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">
                              {rep.result?.possibleConditions?.[0]?.name || 'Health Assessment'}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                rep.result?.riskLevel === 'Emergency' || rep.result?.riskLevel === 'High'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {rep.result?.riskLevel || 'Low'} Risk
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-400 block mt-0.5">
                            {new Date(rep.createdAt).toLocaleDateString()} • {rep.symptoms?.join(', ') || 'No symptoms reported'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold">
                          <span>{rep.result?.healthScore || 80}/100</span>
                          <ChevronRight className="w-4 h-4 text-stone-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                    No health scans completed yet. Click "Run AI Health Vision Scan" above.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: LONGITUDINAL HEALTH TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Chronological Health Timeline</h4>
                  <p className="text-xs text-stone-500">All registered clinical events, scans, and treatments.</p>
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {timelineEvents.map((evt) => (
                  <div key={evt.id} className="relative group">
                    {/* Timeline node */}
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-600 shadow-2xs" />
                    
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-500 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">{evt.title}</span>
                        <span className="text-[10px] text-stone-400 font-medium">{new Date(evt.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">{evt.desc}</p>
                      
                      {evt.report && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectReport(evt.report);
                          }}
                          className="mt-2 text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>View Full Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VACCINES & DEWORMING */}
          {activeTab === 'vaccines' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Vaccination & Parasite Control</h4>
                  <p className="text-xs text-stone-500">Track immunization schedules and booster due dates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddVaccineModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Vaccination</span>
                </button>
              </div>

              {/* Add Vaccine Modal */}
              {showAddVaccineModal && (
                <form onSubmit={handleAddVaccine} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Record New Vaccination</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Vaccine Name *</label>
                      <input
                        type="text"
                        value={vaccineForm.vaccineName}
                        onChange={(e) => setVaccineForm({ ...vaccineForm, vaccineName: e.target.value })}
                        placeholder="FMD, HS, Anthrax, BQ, Rabies..."
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Date Administered *</label>
                      <input
                        type="date"
                        value={vaccineForm.dateAdministered}
                        onChange={(e) => setVaccineForm({ ...vaccineForm, dateAdministered: e.target.value })}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Next Booster Due Date</label>
                      <input
                        type="date"
                        value={vaccineForm.nextDueDate}
                        onChange={(e) => setVaccineForm({ ...vaccineForm, nextDueDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Veterinarian / Para-Vet</label>
                      <input
                        type="text"
                        value={vaccineForm.veterinarian}
                        onChange={(e) => setVaccineForm({ ...vaccineForm, veterinarian: e.target.value })}
                        placeholder="Dr. Deshmukh"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVaccineModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                    >
                      Save Vaccine Record
                    </button>
                  </div>
                </form>
              )}

              {/* Vaccine List */}
              {currentAnimal.vaccinations && currentAnimal.vaccinations.length > 0 ? (
                <div className="space-y-2">
                  {currentAnimal.vaccinations.map((vac) => (
                    <div key={vac.id} className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Syringe className="w-4 h-4 text-emerald-700" />
                          <strong className="text-xs sm:text-sm text-stone-900">{vac.vaccineName}</strong>
                        </div>
                        <p className="text-xs text-stone-500">
                          Given on {vac.dateAdministered} {vac.veterinarian ? `• Administered by Dr. ${vac.veterinarian}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Next Booster</span>
                        <span className="text-xs font-bold text-emerald-800">{vac.nextDueDate || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                  No vaccinations logged yet. Click "Log Vaccination" to record FMD, HS, Blackleg, or Rabies doses.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TREATMENTS & MEDICATIONS */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Medications & Food Safety Withdrawals</h4>
                  <p className="text-xs text-stone-500">Track antibiotic & drug treatments, plus milk/meat withdrawal periods.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTreatmentModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Treatment</span>
                </button>
              </div>

              {/* Add Treatment Modal */}
              {showAddTreatmentModal && (
                <form onSubmit={handleAddTreatment} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Record Medical Treatment</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Medication Name *</label>
                      <input
                        type="text"
                        value={treatmentForm.medicationName}
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, medicationName: e.target.value })}
                        placeholder="e.g. Amoxicillin, Meloxicam, Oxytetracycline"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Reason / Condition *</label>
                      <input
                        type="text"
                        value={treatmentForm.reason}
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, reason: e.target.value })}
                        placeholder="e.g. Mastitis, Respiratory Infection"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={treatmentForm.startDate}
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Withdrawal Period (Days for Milk/Meat)</label>
                      <input
                        type="number"
                        min="0"
                        value={treatmentForm.withdrawalPeriodDays}
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, withdrawalPeriodDays: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTreatmentModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                    >
                      Save Treatment Record
                    </button>
                  </div>
                </form>
              )}

              {/* Treatment List */}
              {currentAnimal.treatments && currentAnimal.treatments.length > 0 ? (
                <div className="space-y-2">
                  {currentAnimal.treatments.map((treat) => (
                    <div key={treat.id} className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-teal-700" />
                          <strong className="text-xs sm:text-sm text-stone-900">{treat.medicationName}</strong>
                        </div>
                        {treat.withdrawalPeriodDays ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {treat.withdrawalPeriodDays} Days Milk/Meat Withdrawal
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-stone-600">
                        <strong>Prescribed For:</strong> {treat.reason} • Started: {treat.startDate}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                  No active treatments recorded.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VET VISITS */}
          {activeTab === 'vet_visits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Official Veterinary Consultations</h4>
                  <p className="text-xs text-stone-500">Record in-person doctor visits and verified official diagnoses.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Vet Visit</span>
                </button>
              </div>

              {/* Add Visit Form */}
              {showAddVisitModal && (
                <form onSubmit={handleAddVisit} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Record Veterinary Consultation</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Veterinarian / Hospital *</label>
                      <input
                        type="text"
                        value={visitForm.clinicOrVet}
                        onChange={(e) => setVisitForm({ ...visitForm, clinicOrVet: e.target.value })}
                        placeholder="Government Veterinary Dispensary / Dr. Rao"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Visit Date *</label>
                      <input
                        type="date"
                        value={visitForm.visitDate}
                        onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Reason for Visit</label>
                      <input
                        type="text"
                        value={visitForm.reason}
                        onChange={(e) => setVisitForm({ ...visitForm, reason: e.target.value })}
                        placeholder="Sudden fever and lameness"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Official Doctor Diagnosis</label>
                      <input
                        type="text"
                        value={visitForm.officialDiagnosis}
                        onChange={(e) => setVisitForm({ ...visitForm, officialDiagnosis: e.target.value })}
                        placeholder="Confirmed Foot Rot (Interdigital necrobacillosis)"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVisitModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                    >
                      Save Visit Record
                    </button>
                  </div>
                </form>
              )}

              {/* Visits List */}
              {currentAnimal.vetVisits && currentAnimal.vetVisits.length > 0 ? (
                <div className="space-y-2">
                  {currentAnimal.vetVisits.map((v) => (
                    <div key={v.id} className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-emerald-700" />
                          <strong className="text-xs sm:text-sm text-stone-900">{v.clinicOrVet}</strong>
                        </div>
                        <span className="text-[11px] text-stone-400 font-medium">{v.visitDate}</span>
                      </div>
                      <p className="text-xs text-stone-700">
                        <strong>Official Diagnosis:</strong> {v.officialDiagnosis || 'General Examination'}
                      </p>
                      {v.reason && (
                        <p className="text-[11px] text-stone-500">Reported Issue: {v.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                  No clinic visits logged yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: VET SUMMARY DOSSIER */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Veterinary Clinical Health Dossier</h4>
                  <p className="text-xs text-stone-500">Exportable medical summary for veterinary consultations and referrals.</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Dossier</span>
                </button>
              </div>

              {/* Printable Medical Card Preview */}
              <div className="p-6 rounded-2xl bg-white border-2 border-stone-300 space-y-4 text-stone-800 print:border-none">
                <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg text-emerald-950">PASHU SAATHI AI • LIVESTOCK DOSSIER</h3>
                    <span className="text-[11px] text-stone-500 block">Animal Health Card & Observation History</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-stone-100 px-2.5 py-1 rounded-md">
                    TAG: {currentAnimal.tagId || 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><strong>Name:</strong> {currentAnimal.name}</div>
                  <div><strong>Species:</strong> {currentAnimal.type}</div>
                  <div><strong>Breed:</strong> {currentAnimal.breed || 'Indigenous'}</div>
                  <div><strong>Age:</strong> {currentAnimal.age} Years</div>
                  <div><strong>Sex:</strong> {currentAnimal.gender}</div>
                  <div><strong>Reproductive Status:</strong> {currentAnimal.reproductiveStatus || 'Intact'}</div>
                  <div><strong>Weight:</strong> {currentAnimal.weight ? `${currentAnimal.weight} kg` : '—'}</div>
                  <div><strong>Location:</strong> {currentAnimal.farmLocation || 'Farm'}</div>
                  <div><strong>Health Score:</strong> {currentAnimal.healthScore || 85}/100</div>
                </div>

                <div className="border-t border-stone-200 pt-3 text-xs space-y-2">
                  <strong className="block text-stone-900 uppercase tracking-wider text-[11px]">Vaccination Summary:</strong>
                  {currentAnimal.vaccinations && currentAnimal.vaccinations.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5">
                      {currentAnimal.vaccinations.map((v) => (
                        <li key={v.id}>{v.vaccineName} on {v.dateAdministered} (Next Due: {v.nextDueDate || '—'})</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-stone-400">No vaccinations recorded.</p>
                  )}
                </div>

                <div className="border-t border-stone-200 pt-3 text-xs space-y-2">
                  <strong className="block text-stone-900 uppercase tracking-wider text-[11px]">Recent AI Observation Findings:</strong>
                  {animalReports.length > 0 ? (
                    <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
                      <div><strong>Latest Scan Date:</strong> {new Date(animalReports[0].createdAt).toLocaleDateString()}</div>
                      <div><strong>Flagged Symptoms:</strong> {animalReports[0].symptoms?.join(', ') || 'None'}</div>
                      <div><strong>AI Suspected Conditions:</strong> {animalReports[0].result?.possibleConditions?.map(c => c.name).join(', ') || 'Normal'}</div>
                    </div>
                  ) : (
                    <p className="text-stone-400">No recent AI scans.</p>
                  )}
                </div>

                <div className="border-t border-stone-200 pt-3 text-[10px] text-stone-500 leading-relaxed">
                  <strong>Veterinary Disclaimer:</strong> This dossier integrates farm-level observations and preliminary AI vision insights to assist qualified veterinarians. It is not an official prescription or certified medical diagnosis.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-400">
            Pashu Saathi AI • Helpline: 1962
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
