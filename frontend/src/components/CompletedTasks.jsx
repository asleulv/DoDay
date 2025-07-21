import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadAllCompletedGoals, deleteGoal } from '../utils/firestoreUtils';

function CompletedTasks({ user, refreshSignal }) {
  const [completedGoals, setCompletedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => {
    let isMounted = true;
    if (user) {
      setLoading(true);
      loadAllCompletedGoals(user.uid)
        .then((goals) => {
          if (isMounted) setCompletedGoals(goals);
        })
        .catch(() => {
          if (isMounted) setCompletedGoals([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [user, refreshSignal]);

  const handleDelete = async (goalId) => {
    const confirmed = window.confirm('Vil du slette denne oppgåva permanent frå arkivet?');
    if (!confirmed || !user) return;
    try {
      await deleteGoal(user.uid, goalId);
      const updated = await loadAllCompletedGoals(user.uid);
      setCompletedGoals(updated);
    } catch (err) {
      console.error('Klarte ikkje slette oppgåve:', err);
    }
  };

  const toggleNote = (goalId) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  const formatDateKey = (date) => date.toLocaleDateString('no-NO');
  const todayKey = formatDateKey(new Date());

  const groupedByDate = completedGoals.reduce((groups, task) => {
    const date = task.completedAt ? new Date(task.completedAt) : null;
    if (!date) return groups;
    const dateKey = formatDateKey(date);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(task);
    return groups;
  }, {});

  const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => {
    if (a === todayKey) return -1;
    if (b === todayKey) return 1;
    return new Date(b) - new Date(a);
  });

  const filterTask = (task) =>
    !searchTerm || task.text.toLowerCase().includes(searchTerm.toLowerCase());

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Ferdige oppgåver
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Du må vere logga inn for å sjå ferdige oppgåver.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Ferdige oppgåver
      </h2>

      <input
        type="text"
        placeholder="Søk etter oppgåve…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/30 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {loading ? (
        <div className="flex items-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-gray-400">Laster ferdige oppgåver...</span>
        </div>
      ) : completedGoals.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          Ingen ferdige oppgåver enno.
        </p>
      ) : (
        <div className="space-y-8">
          {sortedDateKeys.map((dateKey) => {
            const filteredTasks = groupedByDate[dateKey].filter(filterTask);
            if (filteredTasks.length === 0) return null;
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
                      className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                    >
                      <div className="text-gray-900 dark:text-white w-full">
                        <div className="flex justify-between items-start">
                          <div className="font-medium flex items-center">
                            {task.text}
                            {task.note && (
                              <button
                                onClick={() => toggleNote(task.id)}
                                title={expandedNotes[task.id] ? 'Skjul notat' : 'Vis notat'}
                                className="ml-2 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                                style={{ lineHeight: '0' }}
                              >
                                {/* Elegant note-ikon */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5 text-blue-500 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-1.5A2.25 2.25 0 1016.5 6.5l-.768.768-7.03 7.03A2.25 2.25 0 007.5 16.5h3.182a2.25 2.25 0 002.25-2.25v-3.182a2.25 2.25 0 00-.659-1.591l6.659-6.659z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Notat kan vises når åpen */}
                        {expandedNotes[task.id] && task.note && (
                          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap p-2 border-l-4 border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/10 rounded">
                            {task.note}
                          </div>
                        )}

                        {task.subtasks && task.subtasks.length > 0 && (
                          <ul className="ml-4 mt-2 list-disc text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                            {task.subtasks.map((subtask, idx) => (
                              <li key={idx}>↳ {subtask.title}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 sm:ml-6">
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {task.completedAt
                            ? new Date(task.completedAt).toLocaleTimeString(
                                'no-NO',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                }
                              )
                            : 'Ukjend tidspunkt'}
                        </span>
                        <button
                          onClick={() => handleDelete(task.id)}
                          title="Slett oppgåve frå arkivet"
                          className="hover:bg-red-50 dark:hover:bg-red-900 p-1 rounded transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6h16"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 11v6m4-6v6"
                            />
                          </svg>
                        </button>
                      </div>
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
