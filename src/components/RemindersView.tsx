import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Syringe,
  Pill,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';
import { Reminder, AnimalProfile, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface RemindersViewProps {
  reminders: Reminder[];
  animals: AnimalProfile[];
  language: Language;
  onAddReminder: (reminder: Partial<Reminder>) => Promise<void>;
  onToggleComplete: (reminderId: string, current: boolean) => Promise<void>;
  onDeleteReminder: (reminderId: string) => Promise<void>;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  animals,
  language,
  onAddReminder,
  onToggleComplete,
  onDeleteReminder,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    animalId: '',
    animalName: 'General Herd',
    type: 'vaccination' as 'vaccination' | 'medicine' | 'routine' | 'deworming',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedAnimal = animals.find((a) => a.id === formData.animalId);
      await onAddReminder({
        ...formData,
        animalName: selectedAnimal ? selectedAnimal.name : 'General Herd',
      });
      setShowAddModal(false);
      setFormData({
        title: '',
        animalId: '',
        animalName: 'General Herd',
        type: 'vaccination',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return Syringe;
      case 'deworming':
      case 'medicine':
        return Pill;
      default:
        return Calendar;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-emerald-700" />
            <span>{t('reminderTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Keep your cows, buffaloes, and small ruminants safe with scheduled vaccinations and deworming.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>FCM Push Alerts Active for Upcoming Vaccinations</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('reminderAdd')}</span>
        </button>
      </div>

      {/* Recommended National Vaccination Schedule Guide */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
        <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Government Recommended Livestock Vaccine Schedule</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-900">
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
            <strong>FMD (Foot & Mouth):</strong>
            <p className="text-[11px] text-emerald-800 mt-0.5">Every 6 months (Feb-Mar & Aug-Sep) under NADCP program.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
            <strong>HS & BQ (Galghontu & Lango):</strong>
            <p className="text-[11px] text-emerald-800 mt-0.5">Annually before monsoon (May-June) for cattle & buffaloes.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
            <strong>PPR (Goat Plague):</strong>
            <p className="text-[11px] text-emerald-800 mt-0.5">Every 3 years for goats and sheep above 3 months of age.</p>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length > 0 ? (
          reminders.map((rem) => {
            const Icon = getReminderIcon(rem.type);
            const isOverdue = new Date(rem.dueDate) < new Date() && !rem.completed;
            const isToday = new Date(rem.dueDate).toDateString() === new Date().toDateString() && !rem.completed;

            return (
              <div
                key={rem.id}
                className={`p-4 sm:p-5 rounded-2xl border transition shadow-2xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 ${
                  rem.completed
                    ? 'bg-stone-50/70 border-stone-200 opacity-70'
                    : isOverdue
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <button
                    onClick={() => onToggleComplete(rem.id, rem.completed)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition border ${
                      rem.completed
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'border-stone-300 hover:border-emerald-600 bg-white text-transparent'
                    }`}
                    title={t('reminderMarkComplete')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-700" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm sm:text-base font-bold text-stone-900 ${
                          rem.completed ? 'line-through text-stone-400' : ''
                        }`}
                      >
                        {rem.title}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {rem.animalName || 'Herd'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-500">
                      <span className="capitalize">{rem.type}</span>
                      <span>•</span>
                      <span>Due: {rem.dueDate}</span>
                      {rem.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-stone-600">"{rem.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  {isOverdue && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                      Overdue
                    </span>
                  )}
                  {isToday && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      Due Today
                    </span>
                  )}
                  {rem.completed && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {t('reminderCompleted')}
                    </span>
                  )}

                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                    title={t('reminderDelete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-900 text-base">No Reminders Scheduled</h3>
            <p className="text-xs text-stone-500 mt-1">
              Add upcoming vaccination dates, medicine schedules, or deworming cycles to get notified.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition"
            >
              {t('reminderAdd')}
            </button>
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-700" />
                <span>{t('reminderAdd')}</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FMD Booster Vaccine, Fenbendazole Deworming"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('reminderType')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="vaccination">Vaccination</option>
                    <option value="deworming">Deworming</option>
                    <option value="medicine">Medicine</option>
                    <option value="routine">Routine Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Assign Animal
                  </label>
                  <select
                    value={formData.animalId}
                    onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="">All Herd / General</option>
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('reminderDueDate')} *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('reminderNotes')}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 5ml subcutaneous, administer on empty morning stomach"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
