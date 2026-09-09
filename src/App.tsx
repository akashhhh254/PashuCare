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
import { GoogleConsentModal } from './components/GoogleConsentModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ProfileView } from './components/ProfileView';
import { Footer } from './components/Footer';
import {
  AnimalProfile,
  HealthReport,
  Language,
  Reminder,
  UserProfile,
  VeterinarianRequest
} from './types';
import { translations, getTranslation } from './i18n/translations';
import { auth, signInWithGooglePopup, logOutFromFirebase } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('pashucare_lang') as Language) || 'en';
  });

  // User Authentication State (defaults to null until user explicitly consents & authenticates)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const consentGiven = localStorage.getItem('pashucare_consent_given');
      const saved = localStorage.getItem('pashucare_user');
      if (saved && consentGiven === 'true') {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name !== 'Ramesh Patil' && parsed.id !== 'farmer-1') {
          const userConsent = localStorage.getItem(`pashucare_consent_${parsed.id}`);
          if (userConsent === 'true') {
            return parsed;
          }
        }
      }
      localStorage.removeItem('pashucare_user');
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
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any | null>(null);
  const [showGoogleConsentModal, setShowGoogleConsentModal] = useState(false);

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

  // Listen to official Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const hasConsented =
          localStorage.getItem('pashucare_consent_given') === 'true' &&
          localStorage.getItem(`pashucare_consent_${firebaseUser.uid}`) === 'true';

        if (!hasConsented) {
          // Explicitly hold Firebase user in pending state and show Data Sharing & Account Access modal FIRST
          setPendingGoogleUser(firebaseUser);
          setShowGoogleConsentModal(true);
        } else {
          const userProfile: UserProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Farmer',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            role: 'farmer',
            preferredLanguage: language,
            farmName: 'My Dairy & Livestock Farm',
            farmLocation: 'Maharashtra, India',
            createdAt: new Date().toISOString(),
          };
          setUser(userProfile);
          localStorage.setItem('pashucare_user', JSON.stringify(userProfile));
        }
      }
    });
    return () => unsubscribe();
  }, [language]);

  // Save User profile change
  const handleUserLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('pashucare_user', JSON.stringify(loggedInUser));
  };

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await logOutFromFirebase();
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setUser(null);
    setPendingGoogleUser(null);
    setShowGoogleConsentModal(false);
    localStorage.removeItem('pashucare_user');
    localStorage.removeItem('pashucare_consent_given');
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

      {/* Main Content Area with Mobile Bottom Nav Clearance */}
      <main className={`flex-1 ${user ? 'pb-24 lg:pb-10' : 'pb-10'}`}>
        {!user ? (
          <LandingView
            language={language}
            onOpenAuth={handleOpenAuth}
            onOpenPrivacy={() => setShowPrivacyModal(true)}
            onGoogleSignIn={() => {
              // Open Data Sharing & Account Access consent screen FIRST as required
              setShowGoogleConsentModal(true);
            }}
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

      {/* Global Rich Livestock & Helpline Footer */}
      <Footer
        language={language}
        user={user}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenAuth={handleOpenAuth}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
      />

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
        onGoogleConsentNeeded={(fbUser) => {
          setPendingGoogleUser(fbUser);
          setShowGoogleConsentModal(true);
        }}
      />

      {/* Data Sharing & Account Access Consent Modal with Sticky Agree and Continue */}
      <GoogleConsentModal
        isOpen={showGoogleConsentModal}
        googleUser={pendingGoogleUser}
        language={language}
        onAgreeAndContinue={async (existingProfile) => {
          let activeUser = pendingGoogleUser;
          let profileToUse = existingProfile;

          // If user opened consent modal directly from landing screen, launch Google OAuth now:
          if (!activeUser) {
            const fbUser = await signInWithGooglePopup();
            if (!fbUser) return;
            activeUser = fbUser;
            profileToUse = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Farmer / पशुपालक',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              role: 'farmer',
              preferredLanguage: language,
              farmName: 'My Dairy & Livestock Farm',
              farmLocation: 'Maharashtra, India',
              createdAt: new Date().toISOString(),
              photoUrl: fbUser.photoURL || undefined,
            };
          }

          // Explicitly save consent to ensure no bypass
          if (activeUser?.uid) {
            localStorage.setItem('pashucare_consent_given', 'true');
            localStorage.setItem(`pashucare_consent_${activeUser.uid}`, 'true');
          }

          if (profileToUse) {
            handleUserLogin(profileToUse);
          }

          setShowGoogleConsentModal(false);
          setPendingGoogleUser(null);
        }}
        onCancelOrSwitchAccount={async () => {
          await logOutFromFirebase().catch(() => {});
          setShowGoogleConsentModal(false);
          setPendingGoogleUser(null);
        }}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
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
