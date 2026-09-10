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
import {
  logOutFromFirebase,
  onAuthUserChanged,
  getUserProfileFromFirestore,
  subscribeToAnimals,
  subscribeToReports,
  subscribeToReminders,
  subscribeToVetRequests,
  addAnimalToFirestore,
  deleteAnimalFromFirestore,
  addReportToFirestore,
  deleteReportFromFirestore,
  addReminderToFirestore,
  toggleReminderInFirestore,
  deleteReminderFromFirestore,
  addVetRequestToFirestore
} from './lib/firebase';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('pashucare_lang') as Language) || 'en';
  });

  // User Authentication State (defaults to null until user manually logs in or registers)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('pashucare_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name !== 'Ramesh Patil' && parsed.id !== 'farmer-1') {
          return parsed;
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

  const handleOpenAuth = (tab: 'signin' | 'register' = 'register') => {
    setAuthInitialTab(tab);
    setShowAuthModal(true);
  };

  // Persist language
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('pashucare_lang', lang);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfileFromFirestore(fbUser.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem('pashucare_user', JSON.stringify(profile));
          }
        } catch (e) {
          console.warn('Firebase user profile retrieval notice:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial data from backend API as fallback
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

  // Real-time Firestore synchronization for logged-in farmers
  useEffect(() => {
    if (!user?.id) {
      refreshData();
      return;
    }

    // Subscribe in real-time to Firestore collections for this farmer
    const unsubAnimals = subscribeToAnimals(
      user.id,
      (realtimeAnimals) => {
        setAnimals(realtimeAnimals);
      },
      (err) => console.warn('Realtime animals sync:', err)
    );

    const unsubReports = subscribeToReports(
      user.id,
      (realtimeReports) => {
        setReports(realtimeReports);
      },
      (err) => console.warn('Realtime reports sync:', err)
    );

    const unsubReminders = subscribeToReminders(
      user.id,
      (realtimeReminders) => {
        setReminders(realtimeReminders);
      },
      (err) => console.warn('Realtime reminders sync:', err)
    );

    const unsubVetRequests = subscribeToVetRequests(
      user.id,
      (realtimeRequests) => {
        setVetRequests(realtimeRequests);
      },
      (err) => console.warn('Realtime vet requests sync:', err)
    );

    return () => {
      unsubAnimals();
      unsubReports();
      unsubReminders();
      unsubVetRequests();
    };
  }, [user?.id]);

  // Save User profile change upon manual registration or login
  const handleUserLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('pashucare_user', JSON.stringify(loggedInUser));
  };

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await logOutFromFirebase();
    } catch (e) {
      console.warn('Signout notice:', e);
    }
    setUser(null);
    localStorage.removeItem('pashucare_user');
  };

  // Handle Adding Animal with Real-Time Firestore Sync
  const handleAddAnimal = async (animalData: Partial<AnimalProfile>) => {
    const animalId = `anim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullAnimal: AnimalProfile = {
      id: animalId,
      userId: user?.id || 'anonymous',
      name: animalData.name || 'Livestock Animal',
      tagId: animalData.tagId || `IN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: animalData.type || 'Cow',
      age: animalData.age || '3 years',
      gender: animalData.gender || 'Female',
      breed: animalData.breed || 'Indigenous',
      farmLocation: animalData.farmLocation || user?.farmLocation || 'Maharashtra, India',
      healthScore: animalData.healthScore ?? 90,
      status: animalData.status || 'Healthy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoUrl: animalData.photoUrl
    };

    // Optimistically update local state
    setAnimals((prev) => [fullAnimal, ...prev]);

    // Persist in real-time Firestore database
    if (user?.id) {
      try {
        await addAnimalToFirestore(fullAnimal);
      } catch (err) {
        console.warn('Firestore animal write fallback:', err);
      }
    }

    // Backend endpoint backup
    try {
      await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullAnimal),
      });
    } catch (err) {
      console.error('Failed to add animal to backup API:', err);
    }
  };

  // Handle Deleting Animal with Real-Time Firestore Sync
  const handleDeleteAnimal = async (animalId: string) => {
    setAnimals((prev) => prev.filter((a) => a.id !== animalId));
    if (user?.id) {
      try {
        await deleteAnimalFromFirestore(animalId);
      } catch (err) {
        console.warn('Firestore animal delete fallback:', err);
      }
    }
    try {
      await fetch(`/api/animals/${animalId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete animal from API:', err);
    }
  };

  // Handle Adding Reminder with Real-Time Firestore Sync
  const handleAddReminder = async (reminderData: Partial<Reminder>) => {
    const reminderId = `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullReminder: Reminder = {
      id: reminderId,
      userId: user?.id || 'anonymous',
      title: reminderData.title || 'Livestock Reminder',
      animalName: reminderData.animalName || 'Livestock',
      animalId: reminderData.animalId,
      type: reminderData.type || 'vaccination',
      dueDate: reminderData.dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      notes: reminderData.notes,
      createdAt: new Date().toISOString()
    };

    setReminders((prev) => [fullReminder, ...prev]);

    if (user?.id) {
      try {
        await addReminderToFirestore(fullReminder);
      } catch (err) {
        console.warn('Firestore reminder write fallback:', err);
      }
    }

    try {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullReminder),
      });
    } catch (err) {
      console.error('Failed to add reminder to API:', err);
    }
  };

  // Handle Toggle Reminder Complete with Real-Time Firestore Sync
  const handleToggleReminderComplete = async (reminderId: string, current: boolean) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, completed: !current } : r))
    );

    if (user?.id) {
      try {
        await toggleReminderInFirestore(reminderId, !current);
      } catch (err) {
        console.warn('Firestore reminder update fallback:', err);
      }
    }

    try {
      await fetch(`/api/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !current }),
      });
    } catch (err) {
      console.error('Failed to update reminder:', err);
    }
  };

  // Handle Deleting Reminder with Real-Time Firestore Sync
  const handleDeleteReminder = async (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    if (user?.id) {
      try {
        await deleteReminderFromFirestore(reminderId);
      } catch (err) {
        console.warn('Firestore reminder delete fallback:', err);
      }
    }
    try {
      await fetch(`/api/reminders/${reminderId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  // Handle Deleting Health Report with Real-Time Firestore Sync
  const handleDeleteReport = async (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
      setActiveTab('history');
    }

    if (user?.id) {
      try {
        await deleteReportFromFirestore(reportId);
      } catch (err) {
        console.warn('Firestore report delete fallback:', err);
      }
    }

    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  // Handle Submitting Vet Consultation with Real-Time Firestore Sync
  const handleSubmitVetRequest = async (requestData: Partial<VeterinarianRequest>) => {
    const reqId = `vet_req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullRequest: VeterinarianRequest = {
      id: reqId,
      userId: user?.id || 'anonymous',
      userName: user?.name || requestData.userName || 'Farmer',
      userPhone: user?.phone || requestData.userPhone || '+91 98765 43210',
      animalId: requestData.animalId,
      animalName: requestData.animalName || 'Livestock',
      animalType: requestData.animalType || 'Cow',
      symptoms: requestData.symptoms || [],
      preferredDate: requestData.preferredDate || new Date().toISOString().split('T')[0],
      preferredTime: requestData.preferredTime || 'Morning (9 AM - 12 PM)',
      description: requestData.description || '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setVetRequests((prev) => [fullRequest, ...prev]);

    if (user?.id) {
      try {
        await addVetRequestToFirestore(fullRequest);
      } catch (err) {
        console.warn('Firestore vet request write fallback:', err);
      }
    }

    try {
      await fetch('/api/vet-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullRequest),
      });
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
                onAnalysisComplete={async (report) => {
                  const savedReport = {
                    ...report,
                    userId: user?.id || report.userId || 'anonymous'
                  };
                  setSelectedReport(savedReport);
                  setReports((prev) => [savedReport, ...prev]);
                  setActiveTab('report');
                  if (user?.id) {
                    try {
                      await addReportToFirestore(savedReport);
                    } catch (err) {
                      console.warn('Firestore report save:', err);
                    }
                  }
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
