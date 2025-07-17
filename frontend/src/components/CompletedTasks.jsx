import { useEffect, useState } from 'react';
import { loadAllCompletedGoals, clearAllCompletedGoals } from '../utils/firestoreUtils';

function CompletedTasks({ user }) {
  const [completedGoals, setCompletedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (user) {
      setLoading(true);
      loadAllCompletedGoals(user.uid)
        .then((goals) => { if (isMounted) setCompletedGoals(goals); })
        .catch(() => { if (isMounted) setCompletedGoals([]); })
        .finally(() => { if (isMounted) setLoading(false); });
    }
    return () => { isMounted = false; };
  }, [user]);

  // Helper to format date parts
  const formatDateKey = (date) => date.toLocaleDateString('no-NO');
  const todayKey = formatDateKey(new Date());

  // Group tasks by completion date string
  const groupedByDate = completedGoals.reduce((groups, task) => {
    const date = task.completedAt ? new Date(task.completedAt) : null;
    if (!date) return groups;
    const dateKey = formatDateKey(date);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(task);
    return groups;
  }, {});

  // Sort dates: Put today first, then descending order for previous dates
  const sortedDateKeys = Object.keys(groupedByDate)
    .sort((a, b) => {
      if (a === todayKey) return -1;
      if (b === todayKey) return 1;
      return new Date(b) - new Date(a);
    });

  // Filter function: match task.text with searchTerm
  const filterTask = (task) =>
    !searchTerm || task.text.toLowerCase().includes(searchTerm.toLowerCase());

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ferdige oppgåver</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Du må vere logga inn for å sjå ferdige oppgåver.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ferdige oppgåver</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Søk etter oppgåve…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-6 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/30 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Archive clear button */}
      {completedGoals.length > 0 && (
        <button
          className="mb-6 px-3 py-1.5 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 hover:bg-red-200/80 dark:hover:bg-red-950/70 transition text-sm"
          disabled={clearing}
          onClick={async () => {
            if (!user) return;
            if (!window.confirm("Er du sikker på at du vil slette alle ferdige oppgåver (arkiv)?")) return;
            setClearing(true);
            try {
              await clearAllCompletedGoals(user.uid);
              setCompletedGoals([]);
            } finally {
              setClearing(false);
            }
          }}
        >
          {clearing ? "Slettar …" : "Tøm arkivet"}
        </button>
      )}

      {loading ? (
        <div className="flex items-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-gray-400">Laster ferdige oppgåver...</span>
        </div>
      ) : completedGoals.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Ingen ferdige oppgåver enno.</p>
      ) : (
        <div className="space-y-8">
          {sortedDateKeys.map((dateKey) => {
            const filteredTasks = groupedByDate[dateKey].filter(filterTask);
            if (filteredTasks.length === 0) return null; // Hide empty sections
            return (
              <div
                key={dateKey}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 mb-4 shadow-sm"
              >
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3 border-b border-blue-100 dark:border-gray-500 pb-1 uppercase tracking-wide">
                  {dateKey === todayKey ? 'I dag' : dateKey}
                </h3>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTasks.map((task) => (
                    <li
                      key={task.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between"
                    >
                      <span className="text-gray-900 dark:text-white">{task.text}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 sm:ml-6">
                        {task.completedAt
                          ? new Date(task.completedAt).toLocaleTimeString('no-NO', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })
                          : 'Ukjend tidspunkt'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CompletedTasks;
