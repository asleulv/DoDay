import { motion } from 'framer-motion';

function ProgressSummary({ goals }) {
  // 👇 Normalize all "work units": subtasks OR tasks without subtasks
  const allWorkItems = goals.flatMap((goal) =>
    goal.subtasks && goal.subtasks.length > 0
      ? goal.subtasks.map((sub) => ({ completed: sub.completed }))
      : [{ completed: goal.completed }]
  );

  const completedCount = allWorkItems.filter((item) => item.completed).length;
  const totalCount = allWorkItems.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
            Status
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
            {completedCount} av {totalCount} oppgåve
            {totalCount !== 1 ? 'r' : ''} løyst
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
            ferdig!
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 transition-colors duration-300">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-3 rounded-full transition-all ${
            progressPercentage === 100
              ? 'bg-green-500 dark:bg-green-400'
              : progressPercentage >= 70
              ? 'bg-blue-500 dark:bg-blue-400'
              : 'bg-yellow-500 dark:bg-yellow-400'
          }`}
        />
      </div>

      {/* Boost Message */}
      {progressPercentage === 100 ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center space-x-2 text-green-700 dark:text-green-400 transition-colors duration-300"
        >
          <span className="text-xl">🎉</span>
          <span className="font-semibold">Du har løyst alle oppgåver. Dritbra!</span>
        </motion.div>
      ) : progressPercentage >= 70 ? (
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 transition-colors duration-300">
          <span className="text-xl">💪</span>
          <span className="font-medium">Snart i mål!</span>
        </div>
      ) : progressPercentage > 0 ? (
        <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-400 transition-colors duration-300">
          <span className="text-xl">🚀</span>
          <span className="font-medium">Du er godt i gong!</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
          <span className="text-xl">🎯</span>
          <span className="font-medium">Klar til å sette i gong?</span>
        </div>
      )}
    </motion.div>
  );
}

export default ProgressSummary;
