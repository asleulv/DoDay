import { useEffect, useState, useRef, useCallback } from 'react';
import { loadCompletedGoalsPaginated, deleteGoal } from '../utils/firestoreUtils';

function CompletedTasks({ user }) {
    const [completedGoals, setCompletedGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedNotes, setExpandedNotes] = useState({});
    const loaderRef = useRef();

    const batchSize = 30;

    const fetchMore = useCallback(async () => {
        if (!user || !hasMore || loading) return;

        setLoading(true);
        try {
            const { tasks, lastVisible } = await loadCompletedGoalsPaginated(
                user.uid,
                '',
                lastDoc,
                batchSize
            );

            // Dedupliser oppgaver basert på task.id
            setCompletedGoals((prev) => {
                const combined = [...prev, ...tasks];
                const map = new Map();
                combined.forEach((task) => map.set(task.id, task));
                return Array.from(map.values());
            });

            setLastDoc(lastVisible);
            if (!lastVisible || tasks.length < batchSize) setHasMore(false);
        } catch (err) {
            console.error('Feil ved lasting:', err);
        }
        setLoading(false);
    }, [user, lastDoc, hasMore, loading]);

    useEffect(() => {
        if (user) {
            setCompletedGoals([]);
            setLastDoc(null);
            setHasMore(true);
        }
    }, [user]);

    useEffect(() => {
        if (user && completedGoals.length === 0) fetchMore();
    }, [user, completedGoals.length, fetchMore]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchMore();
            }
        }, { threshold: 1 });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [fetchMore]);

    const handleDelete = async (goalId) => {
        if (!user || !window.confirm('Vil du slette denne oppgåva?')) return;
        try {
            await deleteGoal(user.uid, goalId);
            setCompletedGoals((prev) => prev.filter((task) => task.id !== goalId));
        } catch (err) {
            console.error('Feil ved sletting:', err);
        }
    };

    const toggleNote = (goalId) => {
        setExpandedNotes((prev) => ({
            ...prev,
            [goalId]: !prev[goalId],
        }));
    };

    const formatDateKey = (task) => {
        try {
            const raw = task.completedAt;

            if (!raw) throw new Error('No completedAt');

            // Firestore Timestamp: call .toDate()
            const date = typeof raw.toDate === 'function' ? raw.toDate() : new Date(raw);

            if (isNaN(date.getTime())) throw new Error('Invalid date');
            return date.toLocaleDateString('no-NO');
        } catch {
            return `unknown-${task.id}`;
        }
    }

    const todayKey = new Date().toLocaleDateString('no-NO');

    const groupedByDate = completedGoals.reduce((groups, task) => {
        const dateKey = formatDateKey(task);
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
        !searchTerm || (task.text?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ferdige oppgåver</h2>

            <input
                type="text"
                placeholder="Søk etter oppgåve…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/30 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {Object.keys(groupedByDate).length === 0 && !loading && (
                <p className="text-gray-600 dark:text-gray-400">Ingen ferdige oppgåver enno.</p>
            )}

            <div className="space-y-8">
                {sortedDateKeys.map((dateKey) => {
                    const tasks = groupedByDate[dateKey].filter(filterTask);
                    if (tasks.length === 0) return null;
                    return (
                        <div
                            key={dateKey}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 mb-4 shadow-sm"
                        >
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3 border-b border-blue-100 dark:border-gray-500 pb-1 uppercase tracking-wide">
                                {dateKey === todayKey ? 'I dag' : dateKey}
                            </h3>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {tasks.map((task) => (
                                    <li
                                        key={`${dateKey}-${task.id}`}
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
                                                                    d="M7 8h10M7 12h4m1 8H6a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {expandedNotes[task.id] && task.note && (
                                                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap p-2 border-l-4 border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/10 rounded">
                                                    {task.note}
                                                </div>
                                            )}

                                            {task.subtasks?.length > 0 && (
                                                <ul className="ml-4 mt-2 list-disc text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                                                    {task.subtasks.map((subtask, idx) => (
                                                        <li key={idx}>{subtask.title}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 sm:ml-6">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {task.completedAt
                                                    ? new Date(task.completedAt).toLocaleTimeString('no-NO', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false,
                                                    })
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
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m5 0H4"
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

            <div ref={loaderRef} className="h-10 mt-8" />

            {loading && (
                <div className="mt-4 text-center text-sm text-gray-400">
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent animate-spin rounded-full mx-auto mb-2" />
                    Laster fleire oppgåver…
                </div>
            )}
        </div>
    );
}

export default CompletedTasks;
