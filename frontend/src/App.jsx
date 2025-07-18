import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import {
  saveGoalToFirestore,
  loadTodaysGoals,
  updateGoalCompletion,
  clearGoals
} from './utils/firestoreUtils';
import GoalInput from './components/GoalInput';
import TaskBreakdown from './components/TaskBreakdown';
import ProgressSummary from './components/ProgressSummary';
import GroupedGoals from './components/GroupedGoals';
import ThemeToggle from './components/ThemeToggle';
import ClearTasks from './components/ClearTasks';
import CompletedTasks from './components/CompletedTasks';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [user, loading, error] = useAuthState(auth);
  const [todaysGoals, setTodaysGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const { isDark } = useTheme();

  // Load goals when user logs in
  useEffect(() => {
    if (user && !loading) {
      loadUserGoals();
    } else if (!user && !loading) {
      setTodaysGoals([]);
    }
  }, [user, loading]);

  const loadUserGoals = async () => {
    if (!user) return;

    setIsLoadingGoals(true);
    try {
      const goals = await loadTodaysGoals(user.uid);
      setTodaysGoals(goals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const handleGoalSubmit = async (goalText) => {
  if (!user) return;

  const separators = /,|\r?\n/;

  const goalParts = goalText
    .split(separators)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      // Capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1);
    });

  try {
    for (const part of goalParts) {
      const goalId = await saveGoalToFirestore(user.uid, part);

      const newGoal = {
        id: goalId,
        text: part,
        createdAt: new Date(),
        completed: false,
        completedAt: null,
      };

      setTodaysGoals((prevGoals) => [...prevGoals, newGoal]);
    }
  } catch (error) {
    console.error('Failed to save goals:', error);
  }
};


  const handleClearTasks = async (option) => {
    if (!user) return;

    try {
      const deletedCount = await clearGoals(user.uid, option);

      // Update local state based on option
      if (option === 'completed') {
        setTodaysGoals((prevGoals) => prevGoals.filter((goal) => !goal.completed));
      } else if (option === 'incomplete') {
        setTodaysGoals((prevGoals) => prevGoals.filter((goal) => goal.completed));
      } else {
        // 'all'
        setTodaysGoals([]);
      }

      console.log(`Cleared ${deletedCount} goals`);
    } catch (error) {
      console.error('Failed to clear goals:', error);
    }
  };

  const handleGoalComplete = async (completedGoal) => {
    if (!user) return;

    try {
      // Update in Firestore
      await updateGoalCompletion(user.uid, completedGoal.id, true);

      // Update local state
      setTodaysGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal.id === completedGoal.id
            ? { ...goal, completed: true, completedAt: new Date() }
            : goal
        )
      );
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Choose logo based on theme
  const logoSrc = isDark ? '/circle.png' : '/circle_light.png';

  if (loading || isLoadingGoals) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-700 dark:text-gray-300">
            {loading ? 'Loading...' : 'Loading your goals...'}
          </span>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src={logoSrc} alt="Ferdig logo" className="w-8 h-8 mr-2" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ferdig!
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowArchive((show) => !show)}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {showArchive ? 'Tilbake' : 'Arkiv'}
                </button>
                <ThemeToggle />
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Logg ut
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {showArchive ? (
            <CompletedTasks user={user} />
          ) : (
            <>
              <GoalInput onGoalSubmit={handleGoalSubmit} user={user} />

              {todaysGoals.length > 0 && (
                <div className="flex justify-between items-center mb-6">
                  <div></div>
                  <ClearTasks goals={todaysGoals} onClearTasks={handleClearTasks} />
                </div>
              )}

              {todaysGoals.length > 0 && <ProgressSummary goals={todaysGoals} />}
              <GroupedGoals goals={todaysGoals} onComplete={handleGoalComplete} />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <img src={logoSrc} alt="Ferdig logo" className="w-10 h-10 mr-3" />
            <span className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Ferdig!
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Ein liten, ukomplisert app som gjer det lettare å få oversikt over det skal og det du har gjort.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm transition-colors duration-300">
          <button
            onClick={signInWithGoogle}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Fortsett med Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
