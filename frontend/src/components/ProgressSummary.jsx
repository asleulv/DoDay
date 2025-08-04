// ProgressSummary.jsx  – full updated version
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,   // 100 %
  FireIcon,          // 70 %+
  RocketLaunchIcon,  // >0 %
  FlagIcon           // 0 %
} from '@heroicons/react/24/solid';

function ProgressSummary({ goals }) {
  /* ------------ numbers ------------ */
  const allWorkItems = goals.flatMap(g =>
    g.subtasks?.length
      ? g.subtasks.map(s => ({ completed: s.completed }))
      : [{ completed: g.completed }]
  );

  const completedCount   = allWorkItems.filter(i => i.completed).length;
  const totalCount       = allWorkItems.length;
  const pct              = totalCount ? (completedCount / totalCount) * 100 : 0;

  /* ------------ pick icon + message ------------ */
  let Icon   = FlagIcon;
  let color  = 'text-gray-600 dark:text-gray-300';
  let text   = 'Klar til å sette i gong?';

  if (pct === 100) {
    Icon  = CheckCircleIcon;
    color = 'text-green-700 dark:text-green-400';
    text  = 'Du har løyst alle oppgåver. Dritbra!';
  } else if (pct >= 70) {
    Icon  = FireIcon;
    color = 'text-blue-700 dark:text-blue-400';
    text  = 'Snart i mål!';
  } else if (pct > 0) {
    Icon  = RocketLaunchIcon;
    color = 'text-yellow-700 dark:text-yellow-400';
    text  = 'Du er godt i gong!';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors"
    >
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Status</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {completedCount} av {totalCount} oppgåve{totalCount !== 1 && 'r'} løyst
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(pct)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">ferdig!</div>
        </div>
      </div>

      {/* bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={[
            'h-3 rounded-full',
            pct === 100
              ? 'bg-green-500 dark:bg-green-400'
              : pct >= 70
              ? 'bg-blue-500 dark:bg-blue-400'
              : 'bg-yellow-500 dark:bg-yellow-400'
          ].join(' ')}
        />
      </div>

      {/* message */}
      <div className={`flex items-center space-x-2 ${color}`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{text}</span>
      </div>
    </motion.div>
  );
}

export default ProgressSummary;
