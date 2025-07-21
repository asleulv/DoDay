import { motion, AnimatePresence } from 'framer-motion';
import TaskBreakdown from './TaskBreakdown';
import { useTheme } from '../contexts/ThemeContext';
import { deleteGoal } from '../utils/firestoreUtils';

function GroupedGoals({ goals, user, onComplete, refreshGoals }) {
  const incompleteGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);
  const { isDark } = useTheme();
  const logoSrc = isDark ? "/circle.png" : "/circle_light.png";

  const handleDelete = async (goalId) => {
    const confirmed = window.confirm("Vil du slette denne oppgåva permanent?");
    if (!confirmed || !user) return;
    try {
      await deleteGoal(user.uid, goalId);
      refreshGoals();
    } catch (error) {
      console.error('Klarte ikkje å slette oppgåva:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Aktive oppgåver */}
      {incompleteGoals.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Uløyste oppgåver ({incompleteGoals.length})
            </h3>
            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {incompleteGoals.map(goal => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <TaskBreakdown
                        goal={goal}
                        user={user}
                        onComplete={onComplete}
                        refreshGoals={refreshGoals}
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      title="Slett oppgåve"
                      className="hover:bg-red-50 dark:hover:bg-red-900 p-1 rounded transition-colors"
                    >
                      {/* Moderne trash-ikon */}
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6h16" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 11v6m4-6v6" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Ferdige oppgåver */}
      {completedGoals.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 transition-colors duration-300">
              Løyste oppgåver ({completedGoals.length})
            </h3>
            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {completedGoals.map(goal => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 transition-colors duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-green-800 dark:text-green-300 font-medium line-through transition-colors duration-300">
                        {goal.text}
                      </p>
                      {goal.subtasks?.length > 0 && (
                        <ul className="ml-4 mt-1 list-disc text-sm text-green-700 dark:text-green-400 space-y-0.5">
                          {goal.subtasks.map((subtask, idx) => (
                            <li key={idx}>↳ {subtask.title}</li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-green-600 dark:text-green-400 transition-colors duration-300">
                        Ferdig{' '}
                        {goal.completedAt?.toLocaleTimeString('no-NO', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                        }) || 'Ukjend tid'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      title="Slett oppgåve"
                      className="hover:bg-red-50 dark:hover:bg-red-900 p-1 rounded transition-colors"
                    >
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6h16" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 11v6m4-6v6" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="mb-4">
            <img src={logoSrc} alt="Ferdig logo" className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Ingen oppgåver enda
          </h3>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Legg til ei eller fleire oppgåver for å kome i gong!
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default GroupedGoals;
