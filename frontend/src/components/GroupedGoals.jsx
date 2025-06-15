import { motion, AnimatePresence } from 'framer-motion';
import TaskBreakdown from './TaskBreakdown';

function GroupedGoals({ goals, onComplete }) {
  const incompleteGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);

  return (
    <div className="space-y-6">
      {/* Active Goals */}
      {incompleteGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Active Goals ({incompleteGoals.length})
            </h3>
            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {incompleteGoals.map(goal => (
                <TaskBreakdown 
                  key={goal.id} 
                  goal={goal}
                  onComplete={onComplete}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 transition-colors duration-300">
              Completed Goals ({completedGoals.length})
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
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-green-800 dark:text-green-300 font-medium line-through transition-colors duration-300">{goal.text}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 transition-colors duration-300">
                        Completed at {goal.completedAt?.toLocaleTimeString() || 'Unknown time'}
                      </p>
                    </div>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium transition-colors duration-300">✓ Done</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">No goals yet</h3>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Add your first goal above to get started!</p>
        </motion.div>
      )}
    </div>
  );
}

export default GroupedGoals;
