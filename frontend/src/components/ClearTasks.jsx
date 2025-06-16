import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

function ClearTasks({ goals, onClearTasks }) {
  const [showModal, setShowModal] = useState(false);
  
  const completedCount = goals.filter(goal => goal.completed).length;
  const incompleteCount = goals.filter(goal => !goal.completed).length;

  const handleClearOption = (option) => {
    onClearTasks(option);
    setShowModal(false);
  };

  if (goals.length === 0) return null;

  return (
    <>
      {/* Clear Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-300"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Slett oppgåver</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Slett oppgåver</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Kva vil du slette?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {/* Clear Completed Only */}
                {completedCount > 0 && (
                  <motion.button
                    onClick={() => handleClearOption('completed')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 text-left bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-300">Slett løyste oppgåver</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Slett {completedCount} løyste oppgåve{completedCount !== 1 ? 'r' : ''}</div>
                      </div>
                      <div className="text-green-600 dark:text-green-400">✓</div>
                    </div>
                  </motion.button>
                )}

                {/* Clear Incomplete Only */}
                {incompleteCount > 0 && (
                  <motion.button
                    onClick={() => handleClearOption('incomplete')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 text-left bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-yellow-800 dark:text-yellow-300">Slett uløyste oppgåver</div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">Slett {incompleteCount} uløyste oppgåve{incompleteCount !== 1 ? 'r' : ''}</div>
                      </div>
                      <div className="text-yellow-600 dark:text-yellow-400">⏳</div>
                    </div>
                  </motion.button>
                )}

                {/* Clear All */}
                <motion.button
                  onClick={() => handleClearOption('all')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-800 dark:text-red-300">Slett oppgåver</div>
                      <div className="text-sm text-red-600 dark:text-red-400">Fjern alle {goals.length} oppgåve{goals.length !== 1 ? 'r' : ''} (løyste & uløyste)</div>
                    </div>
                    <div className="text-red-600 dark:text-red-400">🗑️</div>
                  </div>
                </motion.button>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Avbryt
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ClearTasks;
