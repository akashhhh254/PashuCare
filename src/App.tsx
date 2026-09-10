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
import { NotificationCenter } from './components/NotificationCenter';
import { ForegroundNotificationToast } from './components/ForegroundNotificationToast';
import {
  AnimalProfile,
  HealthReport,
  Language,
  Reminder,
  UserProfile,
  VeterinarianRequest,
  PushNotificationItem,
  PushPermissionStatus
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
  addVetRequestToFirestore,
  handleRedirectAuthResult,
  syncUserProfileToFirestore,
  requestPushNotificationPermission,
  subscribeToForegroundFCM,
  subscribeToNotifications,
  markNotificationAsReadInFirestore,
  deleteNotificationFromFirestore,
  dispatchVaccinationAlert,
  dispatchUrgentVetResponseAlert
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

  // Real-time Push Notifications & FCM State
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [foregroundToast, setForegroundToast] = useState<PushNotificationItem | null>(null);
  const [pushPermissionStatus, setPushPermissionStatus] = useState<PushPermissionStatus>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission as PushPermissionStatus;
    }
    return 'unsupported';
  });

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

  // Listen to Firebase Auth state & handle mobile OAuth redirect
  useEffect(() => {
    // Check if returning from Google Sign-In redirect on mobile
    handleRedirectAuthResult().then((redirectProfile) => {
      if (redirectProfile) {
        setUser(redirectProfile);
        localStorage.setItem('pashucare_user', JSON.stringify(redirectProfile));
        setShowAuthModal(false);
      }
    }).catch((e) => {
      console.warn('Redirect auth result check notice:', e);
    });

    const unsubscribe = onAuthUserChanged(async (fbUser) => {
      if (fbUser) {
        try {
          let profile = await getUserProfileFromFirestore(fbUser.uid);
          if (!profile) {
            try {
              const cachedStr = localStorage.getItem('pashucare_user');
              if (cachedStr) {
                const parsed = JSON.parse(cachedStr);
                if (parsed && parsed.id === fbUser.uid) {
                  profile = parsed;
                }
              }
            } catch {}
          }
          if (!profile) {
            profile = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Farmer',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              preferredLanguage: language || 'en',
              farmName: 'My Livestock Farm',
              farmLocation: 'Maharashtra, India',
              role: (fbUser.email && fbUser.email.toLowerCase().includes('admin')) ? 'admin' : 'farmer',
              photoUrl: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString()
            };
            syncUserProfileToFirestore(profile).catch((err) => {
              console.warn('Sync user profile offline note:', err);
            });
          }
          setUser(profile);
          localStorage.setItem('pashucare_user', JSON.stringify(profile));
        } catch (e) {
          console.warn('Firebase user profile retrieval notice:', e);
        }
      }
    });
    return () => unsubscribe();
  }, [language]);

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

    // Subscribe to farmer's real-time push notifications collection
    const unsubNotifications = subscribeToNotifications(
      user.id,
      (realtimeNotifications) => {
        setNotifications(realtimeNotifications);
        try {
          localStorage.setItem('pashucare_notifications', JSON.stringify(realtimeNotifications));
        } catch {}
      },
      (err) => console.warn('Realtime notifications sync note:', err)
    );

    // Subscribe to foreground FCM push events
    const unsubForegroundFCM = subscribeToForegroundFCM((payload) => {
      const item: PushNotificationItem = {
        id: `fcm-${Date.now()}`,
        userId: user.id,
        title: payload.title,
        body: payload.body,
        category: (payload.data?.category as any) || 'system',
        read: false,
        urgent: payload.data?.urgent === 'true',
        createdAt: new Date().toISOString(),
        data: payload.data
      };
      setForegroundToast(item);
    });

    return () => {
      unsubAnimals();
      unsubReports();
      unsubReminders();
      unsubVetRequests();
      unsubNotifications();
      unsubForegroundFCM();
    };
  }, [user?.id]);

  // Automated Upcoming Vaccination Push Notification Alert Scanner
  useEffect(() => {
    if (reminders.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

    const notifiedKey = 'pashucare_vax_notified';
    let notifiedMap: Record<string, boolean> = {};
    try {
      notifiedMap = JSON.parse(localStorage.getItem(notifiedKey) || '{}');
    } catch {}

    reminders.forEach((rem) => {
      if (!rem.completed && (rem.dueDate === today || rem.dueDate === tomorrow || rem.dueDate === dayAfter)) {
        const reminderNotifKey = `${rem.id}_${rem.dueDate}`;
        if (!notifiedMap[reminderNotifKey]) {
          notifiedMap[reminderNotifKey] = true;
          try {
            localStorage.setItem(notifiedKey, JSON.stringify(notifiedMap));
          } catch {}

          const dueLabel = rem.dueDate === today ? 'Today' : rem.dueDate === tomorrow ? 'Tomorrow' : rem.dueDate;
          dispatchVaccinationAlert(
            user?.id || 'farmer',
            rem.animalName,
            rem.title,
            dueLabel
          ).then((alertItem) => {
            setForegroundToast(alertItem);
          }).catch((err) => console.warn('Auto vaccination alert note:', err));
        }
      }
    });
  }, [reminders, user?.id]);

  // Automated Urgent Vet Response Push Notification Alert Scanner
  useEffect(() => {
    if (vetRequests.length === 0) return;

    const vetNotifiedKey = 'pashucare_vet_notified';
    let notifiedVetMap: Record<string, string> = {};
    try {
      notifiedVetMap = JSON.parse(localStorage.getItem(vetNotifiedKey) || '{}');
    } catch {}

    vetRequests.forEach((req) => {
      const isResponded = req.status === 'Accepted' || req.status === 'Completed' || Boolean(req.vetNotes);
      const stateSignature = `${req.id}_${req.status}_${req.vetNotes || ''}`;

      if (isResponded && notifiedVetMap[req.id] !== stateSignature) {
        notifiedVetMap[req.id] = stateSignature;
        try {
          localStorage.setItem(vetNotifiedKey, JSON.stringify(notifiedVetMap));
        } catch {}

        dispatchUrgentVetResponseAlert(
          user?.id || 'farmer',
          req.animalName,
          req.assignedVetName || 'Field Veterinarian',
          req.vetNotes || 'Doctor accepted consultation and supplied clinical instructions.',
          req.status
        ).then((alertItem) => {
          setForegroundToast(alertItem);
        }).catch((err) => console.warn('Auto vet response alert note:', err));
      }
    });
  }, [vetRequests, user?.id]);

  // Enable Push Notification & FCM Token Registration
  const handleEnablePushNotifications = async () => {
    const result = await requestPushNotificationPermission(user?.id);
    setPushPermissionStatus(result.status);
    if (result.status === 'granted') {
      const welcome = await dispatchVaccinationAlert(
        user?.id || 'farmer',
        'PashuCare AI System',
        'Real-time push notifications connected successfully',
        'Active'
      );
      setForegroundToast(welcome);
    }
  };

  // Trigger test vaccination reminder alert
  const handleTestVaccinationAlert = async () => {
    const animalName = animals[0]?.name || 'Gauri (Gir Cow)';
    const alertItem = await dispatchVaccinationAlert(
      user?.id || 'farmer',
      animalName,
      'HS + BQ Combined Booster Immunization',
      'Tomorrow, 08:30 AM'
    );
    setForegroundToast(alertItem);
  };

  // Trigger test urgent vet response alert
  const handleTestUrgentVetAlert = async () => {
    const animalName = animals[0]?.name || 'Lakshmi (Murrah Buffalo)';
    const alertItem = await dispatchUrgentVetResponseAlert(
      user?.id || 'farmer',
      animalName,
      'Dr. Arvind Shinde (Veterinary Officer)',
      'URGENT: Isolate animal immediately in dry shade. Administer oral rehydration fluid every 3 hours. Inspection team dispatched.',
      'Emergency Advice'
    );
    setForegroundToast(alertItem);
  };

  // Notification status updates
  const handleMarkNotificationRead = async (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
    if (user?.id) {
      try {
        await markNotificationAsReadInFirestore(notifId);
      } catch {}
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user?.id) {
      notifications.forEach((n) => {
        if (!n.read) {
          markNotificationAsReadInFirestore(n.id).catch(() => {});
        }
      });
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    if (user?.id) {
      try {
        await deleteNotificationFromFirestore(notifId);
      } catch {}
    }
  };

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
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setShowNotificationCenter(true)}
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

      {/* Foreground Real-Time Push Notification Toast */}
      <ForegroundNotificationToast
        notification={foregroundToast}
        onDismiss={() => setForegroundToast(null)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        language={language}
      />

      {/* Real-Time Push Notification Center Modal */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        notifications={notifications}
        unreadCount={notifications.filter((n) => !n.read).length}
        permissionStatus={pushPermissionStatus}
        onEnablePush={handleEnablePushNotifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
        onTestVaccinationAlert={handleTestVaccinationAlert}
        onTestUrgentVetAlert={handleTestUrgentVetAlert}
        onNavigateTab={(tab) => setActiveTab(tab)}
        language={language}
      />
    </div>
  );
}
