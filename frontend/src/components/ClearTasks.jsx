import { motion } from 'framer-motion';

function ClearTasks({ goals, onClearTasks }) {
  const completedGoals = goals.filter(goal => goal.completed);

  if (completedGoals.length === 0) return null;

  return (
    <motion.button
      onClick={() => onClearTasks('completed')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors duration-300"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2l4-4"
        />
      </svg>
      <span>Rydd ferdige oppgåver</span>
    </motion.button>
  );
}

export default ClearTasks;
