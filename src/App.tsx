import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { HealthCheckForm } from './components/HealthCheckForm';
import { HealthReportView } from './components/HealthReportView';
import { AnimalsView } from './components/AnimalsView';
import { AnimalDetailModal } from './components/AnimalDetailModal';
import { HistoryView } from './components/HistoryView';
import { RemindersView } from './components/RemindersView';
import { VeterinarianView } from './components/VeterinarianView';
import { DiseaseLibraryView } from './components/DiseaseLibraryView';
import { AdminView } from './components/AdminView';
import { LandingView } from './components/LandingView';
import { AuthModal } from './components/AuthModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ProfileView } from './components/ProfileView';
import {
  AnimalProfile,
  HealthReport,
  Language,
  Reminder,
  UserProfile,
  VeterinarianRequest
} from './types';
import { translations, getTranslation } from './i18n/translations';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('pashucare_lang') as Language) || 'en';
  });

  // User Authentication State (defaults to null until real user registers/signs in)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('pashucare_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name !== 'Ramesh Patil' && parsed.id !== 'farmer-1') {
          return parsed;
        }
        localStorage.removeItem('pashucare_user');
      }
    } catch {
      localStorage.removeItem('pashucare_user');
    }
    return null;
  });

  // Application Data States
  const [animals, setAnimals] = useState<AnimalProfile[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vetRequests, setVetRequests] = useState<VeterinarianRequest[]>([]);

  // Selected Detail States
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile | null>(null);
  const [preselectedAnimalForCheck, setPreselectedAnimalForCheck] = useState<AnimalProfile | null>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'register'>('register');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleOpenAuth = (tab: 'signin' | 'register' = 'register') => {
    setAuthInitialTab(tab);
    setShowAuthModal(true);
  };

  // Persist language
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('pashucare_lang', lang);
  };

  // Fetch initial data from backend API
  const refreshData = async () => {
    try {
      // Animals
      const animRes = await fetch('/api/animals');
      if (animRes.ok) {
        const animData = await animRes.json();
        setAnimals(animData);
      }

      // Reports
      const repRes = await fetch('/api/reports');
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData);
      }

      // Reminders
      const remRes = await fetch('/api/reminders');
      if (remRes.ok) {
        const remData = await remRes.json();
        setReminders(remData);
      }

      // Vet Requests
      const vetRes = await fetch('/api/vet-requests');
      if (vetRes.ok) {
        const vetData = await vetRes.json();
        setVetRequests(vetData);
      }
    } catch (err) {
      console.warn('Backend API sync offline or deferred, using cached local data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Save User profile change
  const handleUserLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('pashucare_user', JSON.stringify(loggedInUser));
  };

  // Handle user sign out
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('pashucare_user');
  };

  // Handle Adding Animal
  const handleAddAnimal = async (animalData: Partial<AnimalProfile>) => {
    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animalData),
      });
      if (res.ok) {
        const newAnimal = await res.json();
        setAnimals((prev) => [newAnimal, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add animal:', err);
    }
  };

  // Handle Deleting Animal
  const handleDeleteAnimal = async (animalId: string) => {
    try {
      await fetch(`/api/animals/${animalId}`, { method: 'DELETE' });
      setAnimals((prev) => prev.filter((a) => a.id !== animalId));
    } catch (err) {
      console.error('Failed to delete animal:', err);
    }
  };

  // Handle Adding Reminder
  const handleAddReminder = async (reminderData: Partial<Reminder>) => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderData),
      });
      if (res.ok) {
        const newReminder = await res.json();
        setReminders((prev) => [newReminder, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  // Handle Toggle Reminder Complete
  const handleToggleReminderComplete = async (reminderId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !current }),
      });
      if (res.ok) {
        setReminders((prev) =>
          prev.map((r) => (r.id === reminderId ? { ...r, completed: !current } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update reminder:', err);
    }
  };

  // Handle Deleting Reminder
  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await fetch(`/api/reminders/${reminderId}`, { method: 'DELETE' });
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  // Handle Deleting Health Report
  const handleDeleteReport = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
        setActiveTab('history');
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  // Handle Submitting Vet Consultation
  const handleSubmitVetRequest = async (requestData: Partial<VeterinarianRequest>) => {
    try {
      const res = await fetch('/api/vet-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (res.ok) {
        const newReq = await res.json();
        setVetRequests((prev) => [newReq, ...prev]);
      }
    } catch (err) {
      console.error('Failed to submit vet request:', err);
    }
  };

  // Clear Local Cache
  const handleClearLocalCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-stone-900 font-sans antialiased selection:bg-emerald-200">
      
      {/* Offline Status Bar */}
      <OfflineIndicator language={language} />

      {/* Global Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        language={language}
        setLanguage={handleLanguageChange}
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 ${user ? 'pb-20 sm:pb-8' : 'pb-8'}`}>
        {!user ? (
          <LandingView
            language={language}
            onOpenAuth={handleOpenAuth}
            onOpenPrivacy={() => setShowPrivacyModal(true)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                language={language}
                onStartCheck={() => {
                  setPreselectedAnimalForCheck(null);
                  setActiveTab('check');
                }}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                animals={animals}
                reports={reports}
                reminders={reminders}
                user={user}
                language={language}
                onNavigate={(tab) => setActiveTab(tab)}
                onSelectReport={(report) => {
                  setSelectedReport(report);
                  setActiveTab('report');
                }}
                onSelectAnimal={(animal) => {
                  setSelectedAnimal(animal);
                }}
              />
            )}

            {activeTab === 'check' && (
              <HealthCheckForm
                animals={animals}
                language={language}
                preselectedAnimal={preselectedAnimalForCheck}
                onAnalysisComplete={(report) => {
                  setSelectedReport(report);
                  setReports((prev) => [report, ...prev]);
                  setActiveTab('report');
                  refreshData();
                }}
              />
            )}

            {activeTab === 'report' && (
              <HealthReportView
                report={selectedReport}
                language={language}
                onBack={() => setActiveTab('history')}
                onRequestVet={() => {
                  setActiveTab('vet');
                }}
              />
            )}

            {activeTab === 'animals' && (
              <AnimalsView
                animals={animals}
                language={language}
                onAddAnimal={handleAddAnimal}
                onSelectAnimal={(animal) => setSelectedAnimal(animal)}
                onRunHealthCheck={(animal) => {
                  setPreselectedAnimalForCheck(animal);
                  setActiveTab('check');
                }}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                reports={reports}
                language={language}
                onSelectReport={(report) => {
                  setSelectedReport(report);
                  setActiveTab('report');
                }}
                onDeleteReport={handleDeleteReport}
                onStartNewCheck={() => {
                  setPreselectedAnimalForCheck(null);
                  setActiveTab('check');
                }}
              />
            )}

            {activeTab === 'reminders' && (
              <RemindersView
                reminders={reminders}
                animals={animals}
                language={language}
                onAddReminder={handleAddReminder}
                onToggleComplete={handleToggleReminderComplete}
                onDeleteReminder={handleDeleteReminder}
              />
            )}

            {activeTab === 'vet' && (
              <VeterinarianView
                animals={animals}
                reports={reports}
                user={user}
                language={language}
                preselectedReport={selectedReport}
                onSubmitVetRequest={handleSubmitVetRequest}
                pendingRequests={vetRequests}
              />
            )}

            {activeTab === 'diseases' && (
              <DiseaseLibraryView
                language={language}
                onNavigateToCheck={() => {
                  setPreselectedAnimalForCheck(null);
                  setActiveTab('check');
                }}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                animals={animals}
                reports={reports}
                reminders={reminders}
                language={language}
                onLanguageChange={handleLanguageChange}
                onOpenAuth={handleOpenAuth}
                onSignOut={handleSignOut}
                onOpenPrivacy={() => setShowPrivacyModal(true)}
                onNavigate={(tab) => setActiveTab(tab)}
                onClearCache={handleClearLocalCache}
              />
            )}

            {activeTab === 'admin' && (
              <AdminView language={language} />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <footer className="hidden sm:block border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-bold text-stone-800">PashuCare AI</span> • Smart Animal Disease Detection & Livestock Assistant
            <p className="text-[11px] text-stone-400 mt-0.5">
              Powered by Google Gemini 3.8 Flash Vision AI. Emergency Helpline: 1962 (Toll Free).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="text-stone-600 hover:text-emerald-700 transition cursor-pointer"
            >
              Privacy & Medical Boundaries
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (user) {
                  setActiveTab('diseases');
                } else {
                  handleOpenAuth('register');
                }
              }}
              className="text-stone-600 hover:text-emerald-700 transition cursor-pointer"
            >
              Disease Catalog
            </button>
            <span>•</span>
            <a href="tel:1962" className="text-red-700 hover:underline font-bold">
              Call 1962
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Only for logged-in farmers) */}
      {user && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentTab={activeTab}
          setCurrentTab={setActiveTab}
          language={language}
        />
      )}

      {/* Animal Detail & Timeline Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          reports={reports}
          language={language}
          onClose={() => setSelectedAnimal(null)}
          onRunHealthCheck={(animal) => {
            setPreselectedAnimalForCheck(animal);
            setActiveTab('check');
          }}
          onSelectReport={(report) => {
            setSelectedReport(report);
            setActiveTab('report');
          }}
          onDeleteAnimal={handleDeleteAnimal}
        />
      )}

      {/* Sign In / Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialTab={authInitialTab}
        language={language}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleUserLogin}
      />

      {/* Privacy & Medical Charter Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onClearLocalCache={handleClearLocalCache}
      />
    </div>
  );
}
