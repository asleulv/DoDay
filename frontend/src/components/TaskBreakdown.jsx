import { motion } from 'framer-motion';
import { useState } from 'react';

function TaskBreakdown({ goal, onComplete }) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleToggle = () => {
    setIsCompleted(!isCompleted);
    if (!isCompleted) {
      // Goal is being completed
      setTimeout(() => onComplete(goal), 300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg shadow-sm p-6 mb-4 transition-all duration-300 ${
        isCompleted 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
        >
          {isCompleted && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </motion.svg>
          )}
        </motion.button>

        {/* Goal Content */}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 transition-all duration-300 ${
            isCompleted 
              ? 'text-green-700 dark:text-green-400 line-through' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {goal.text}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Added at {goal.createdAt.toLocaleTimeString()}
          </p>

          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center space-x-2"
            >
              <span className="text-2xl">🎉</span>
              <span className="text-green-700 dark:text-green-400 font-medium transition-colors duration-300">Goal completed!</span>
            </motion.div>
          )}
        </div>

        {/* Status Badge */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300"
          >
            ✓ Done
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default TaskBreakdown;
