// App.jsx  – full updated version
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

import {
  saveGoalToFirestore,
  loadActiveGoals,
  updateGoalCompletion,
  loadAllCompletedGoals
} from './utils/firestoreUtils';

import GoalInput          from './components/GoalInput';
import ProgressSummary    from './components/ProgressSummary';
import GroupedGoals       from './components/GroupedGoals';
import ThemeToggle        from './components/ThemeToggle';
import ClearTasks         from './components/ClearTasks';
import CompletedTasks     from './components/CompletedTasks';
import { useTheme }       from './contexts/ThemeContext';

function App() {
  const [user, loading]     = useAuthState(auth);

  const [todaysGoals,     setTodaysGoals]     = useState([]);
  const [isLoadingGoals,  setIsLoadingGoals]  = useState(false);
  const [showArchive,     setShowArchive]     = useState(false);

  const [completedTasks,  setCompletedTasks]  = useState([]);   // archive
  const [completedRefresh, setCompletedRefresh] = useState(0);

  const { isDark } = useTheme();

  /* ─────────────────────────────────────────────
     Fetch ACTIVE goals (unchanged)
  ───────────────────────────────────────────── */
  const loadUserGoals = async () => {
    if (!user) return;
    setIsLoadingGoals(true);
    try {
      const goals = await loadActiveGoals(user.uid);
      setTodaysGoals(goals);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const refreshGoals = async () => {
    if (!user) return;
    const updated = await loadActiveGoals(user.uid);
    setTodaysGoals(updated);
    setCompletedRefresh(Date.now());
  };

  /* ─────────────────────────────────────────────
     🆕  Fetch COMPLETED goals immediately on login
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!user) {
      setCompletedTasks([]);
      return;
    }

    const fetchCompleted = async () => {
      try {
        const done = await loadAllCompletedGoals(user.uid); // must return items with .text or .goal
        setCompletedTasks(done);
      } catch (err) {
        console.error('Failed to load completed goals:', err);
      }
    };

    fetchCompleted();
  }, [user]);

  /* ─────────────────────────────────────────────
     Re-run active-goal fetch when login state changes
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (user && !loading) loadUserGoals();
    else if (!user && !loading) {
      setTodaysGoals([]);
      setCompletedTasks([]);
    }
  }, [user, loading]);

  /* ─────────────────────────────────────────────
     Handlers
  ───────────────────────────────────────────── */
  const handleGoalSubmit = async (structuredGoals) => {
    if (!user || structuredGoals.length === 0) return;
    try {
      await saveGoalToFirestore(user.uid, structuredGoals);
      await refreshGoals();
    } catch (err) {
      console.error('Failed to save goals:', err);
    }
  };

  const handleClearTasks = async (option) => {
    if (!user) return;
    try {
      if (option === 'completed') {
        setTodaysGoals((prev) => prev.filter((g) => !g.completed));
      } else if (option === 'incomplete') {
        setTodaysGoals((prev) => prev.filter((g) => g.completed));
      } else {
        setTodaysGoals([]);
      }
      setCompletedRefresh(Date.now());
    } catch (err) {
      console.error('Failed to clear tasks:', err);
    }
  };

  const handleGoalComplete = async (completedGoal) => {
    if (!user) return;
    try {
      await updateGoalCompletion(user.uid, completedGoal.id, true);
      await refreshGoals();
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const logoSrc = isDark ? '/circle.png' : '/circle_light.png';

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  if (loading || isLoadingGoals) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-700 dark:text-gray-300">
            {loading ? 'Loading...' : 'Loading your goals...'}
          </span>
        </div>
      </div>
    );
  }

  /* ───── Logged-in view ───── */
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src={logoSrc} alt="Ferdig logo" className="w-8 h-8" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Ferdig!</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowArchive((prev) => !prev)}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {showArchive ? 'Tilbake' : 'Arkiv'}
              </button>
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Logg ut
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {showArchive ? (
            <CompletedTasks
              user={user}
              refreshSignal={completedRefresh}
              onLoaded={(tasks) => setCompletedTasks(tasks)}  // still keep live refresh
            />
          ) : (
            <>
              {/* 🔥 autocomplete now has data via completedTasks */}
              <GoalInput
                onGoalSubmit={handleGoalSubmit}
                user={user}
                archivedGoals={completedTasks}
              />

              {todaysGoals.length > 0 && (
                <div className="flex justify-between mb-6">
                  <div />
                  <ClearTasks goals={todaysGoals} onClearTasks={handleClearTasks} />
                </div>
              )}

              {todaysGoals.length > 0 && <ProgressSummary goals={todaysGoals} />}

              <GroupedGoals
                goals={todaysGoals}
                user={user}
                onComplete={handleGoalComplete}
                refreshGoals={refreshGoals}
              />
            </>
          )}
        </main>
      </div>
    );
  }

  /* ───── Not-logged-in view ───── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <img src={logoSrc} alt="Ferdig logo" className="w-10 h-10" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Ferdig!</h1>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Ein liten, ukomplisert app som gjer det lettare å få oversikt over det du skal og det du har gjort.
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center px-5 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Fortsett med Google
        </button>
      </div>
    </div>
  );
}

export default App;
