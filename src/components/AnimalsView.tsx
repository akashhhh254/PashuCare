import React, { useState } from 'react';
import {
  Plus,
  Search,
  Users,
  HeartPulse,
  Tag,
  ChevronRight,
  Filter,
  X,
  Upload
} from 'lucide-react';
import { AnimalProfile, Language, SupportedAnimalType } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import { getBreedsForSpecies } from '../data/animals';

interface AnimalsViewProps {
  animals: AnimalProfile[];
  language: Language;
  onAddAnimal: (animal: Partial<AnimalProfile>) => Promise<void>;
  onSelectAnimal: (animal: AnimalProfile) => void;
  onRunHealthCheck: (animal: AnimalProfile) => void;
}

export const AnimalsView: React.FC<AnimalsViewProps> = ({
  animals,
  language,
  onAddAnimal,
  onSelectAnimal,
  onRunHealthCheck,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Animal Form State
  const [formData, setFormData] = useState({
    name: '',
    tagId: '',
    microchipNumber: '',
    type: 'Cow' as SupportedAnimalType,
    age: '3',
    dateOfBirth: '',
    gender: 'Female',
    reproductiveStatus: 'Intact',
    breed: '',
    weight: '',
    farmLocation: '',
    photoUrl: '',
    ownerNotes: '',
  });

  const availableBreeds = getBreedsForSpecies(formData.type);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.tagId && animal.tagId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (animal.breed && animal.breed.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = selectedFilter === 'All' || animal.type === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleSubmitNewAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddAnimal(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        tagId: '',
        type: 'Cow',
        age: '3',
        gender: 'Female',
        breed: '',
        weight: '',
        farmLocation: '',
        photoUrl: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header & Primary Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-700" />
            <span>{t('navMyAnimals')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage your livestock health cards, ear tags, and ongoing observation records.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          id="open-add-animal-modal-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addAnimalTitle')}</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-animals-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by animal name, ear tag ID, breed..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Cow', 'Buffalo', 'Goat', 'Sheep'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Animals Cards Grid */}
      {filteredAnimals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnimals.map((animal) => {
            const isHealthy = animal.status === 'Healthy';
            const isCritical = animal.status === 'Critical';

            return (
              <div
                key={animal.id}
                id={`animal-card-${animal.id}`}
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-600 transition overflow-hidden flex flex-col group"
              >
                {/* Animal Photo or Icon Banner */}
                <div
                  onClick={() => onSelectAnimal(animal)}
                  className="relative h-44 bg-stone-100 cursor-pointer overflow-hidden"
                >
                  {animal.photoUrl ? (
                    <img
                      src={animal.photoUrl}
                      alt={animal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-stone-50 text-stone-300">
                      {animal.type === 'Cow' ? '🐄' : animal.type === 'Buffalo' ? '🐃' : animal.type === 'Goat' ? '🐐' : '🐑'}
                    </div>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      {animal.type}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                        isCritical
                          ? 'bg-red-600 text-white'
                          : isHealthy
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {animal.status}
                    </span>
                  </div>

                  {/* Health score pill at bottom-right */}
                  <div className="absolute bottom-2 right-3">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-white/90 text-stone-900 shadow-xs backdrop-blur-xs">
                      Health: {animal.healthScore || 80}/100
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div onClick={() => onSelectAnimal(animal)} className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-stone-900 group-hover:text-emerald-800 transition">
                        {animal.name}
                      </h3>
                      {animal.tagId && (
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          {animal.tagId}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-stone-500 flex items-center gap-2">
                      <span>{animal.breed || 'Indigenous'}</span>
                      <span>•</span>
                      <span>{animal.age || '—'} Yrs</span>
                      <span>•</span>
                      <span>{animal.gender || 'Female'}</span>
                    </div>
                    {animal.farmLocation && (
                      <p className="text-[11px] text-stone-400 mt-2 truncate">
                        Location: {animal.farmLocation}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                    <button
                      onClick={() => onRunHealthCheck(animal)}
                      id={`check-animal-${animal.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition"
                    >
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Health Check</span>
                    </button>
                    <button
                      onClick={() => onSelectAnimal(animal)}
                      className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition text-xs font-medium"
                      title="View Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No Animals Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            {searchTerm ? 'Try changing your search keywords or category filter.' : t('noAnimalsYet')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition"
          >
            {t('addAnimalTitle')}
          </button>
        </div>
      )}

      {/* Register New Animal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-700" />
                <span>{t('addAnimalTitle')}</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewAnimal} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('animalName')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gauri, Lakshmi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('animalType')} *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SupportedAnimalType })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Cow">Cow (गाय)</option>
                    <option value="Buffalo">Buffalo (भैंस / म्हैस)</option>
                    <option value="Goat">Goat (बकरी / शेळी)</option>
                    <option value="Sheep">Sheep (भेड़ / मेंढी)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('animalIdTag')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IN-MH-2024-0012"
                    value={formData.tagId}
                    onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('animalBreed')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gir, Murrah, Osmanabadi"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('animalAge')}
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('animalGender')}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Female">Female (मादा)</option>
                    <option value="Male">Male (नर)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('animalWeight')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 420"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('animalLocation')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Barn Stall 2, North Field"
                  value={formData.farmLocation}
                  onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Photo URL or Image Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:bg-stone-400"
                >
                  {isSubmitting ? 'Saving...' : t('saveAnimalBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
