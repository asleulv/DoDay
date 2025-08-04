import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    updateSubtasksAndGoalCompletion,
    updateGoalCompletion
} from '../utils/firestoreUtils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

function TaskBreakdown({ goal, user, onComplete, refreshGoals }) {
    const [subtasks, setSubtasks] = useState(goal.subtasks || []);
    const [isManuallyCompleted, setIsManuallyCompleted] = useState(goal.completed);

    const [showNote, setShowNote] = useState(false); 
    const [noteText, setNoteText] = useState(goal.note || ''); 
    const [savingNote, setSavingNote] = useState(false); 

    const hasSubtasks = subtasks.length > 0;
    const isTaskComplete = hasSubtasks
        ? subtasks.every((s) => s.completed)
        : isManuallyCompleted;

    const handleSubtaskToggle = async (index) => {
        if (!goal || !goal.id || !user?.uid) return;

        const updatedSubtasks = subtasks.map((sub, i) =>
            i === index ? { ...sub, completed: !sub.completed } : sub
        );

        setSubtasks(updatedSubtasks);

        try {
            await updateSubtasksAndGoalCompletion(user.uid, goal.id, updatedSubtasks);
            if (refreshGoals) refreshGoals();
        } catch (error) {
            console.error('Failed to update subtask completion:', error);
        }
    };

    const handleSimpleToggle = async () => {
        const newState = !isManuallyCompleted;
        setIsManuallyCompleted(newState);

        try {
            await updateGoalCompletion(user.uid, goal.id, newState);
            if (refreshGoals) refreshGoals();
        } catch (error) {
            console.error('Failed to update simple goal:', error);
        }
    };

    const handleSaveNote = async () => {
        if (!user?.uid || !goal?.id) return;
        setSavingNote(true);
        try {
            const ref = doc(db, `users/${user.uid}/goals/${goal.id}`);
            await updateDoc(ref, { note: noteText });
            if (refreshGoals) refreshGoals();
        } catch (err) {
            console.error('Klarte ikkje lagre notat:', err);
        } finally {
            setSavingNote(false);
            setShowNote(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg shadow-sm px-3 py-2 mb-1 text-sm leading-snug transition-all duration-300 ${isTaskComplete
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
        >
            <div className="flex items-start space-x-4">
                {!hasSubtasks && (
                    <motion.button
                        onClick={handleSimpleToggle}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${isManuallyCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                            }`}
                    >
                        {isManuallyCompleted && (
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
                )}

                {/* ✅ Main Content */}
                <div className="flex-1 pt-1 min-w-0 w-full">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className={`text-lg font-semibold transition-all duration-300 ${isTaskComplete
                            ? 'text-green-700 dark:text-green-400 line-through'
                            : 'text-gray-900 dark:text-white'
                            }`}>
                            {goal.text}
                        </h3>

                        {/* Notat-ikon ved sidan av tittelen */}
                        {user && goal && (
                            <button
                                onClick={() => setShowNote(!showNote)}
                                title={goal.note ? 'Vis / rediger notat' : 'Legg til notat'}
                                className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
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


                    {/* Subtasks */}
                    {hasSubtasks && (
                        <ul className="space-y-1 ml-1">
                            {subtasks.map((subtask, i) => (
                                <li key={i} className="flex items-center space-x-2 text-sm">
                                    <button
                                        aria-label="Toggle subtask"
                                        onClick={() => handleSubtaskToggle(i)}
                                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition ${subtask.completed
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                                            }`}
                                    >
                                        {subtask.completed && (
                                            <motion.svg
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-3 h-3"
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
                                    </button>
                                    <span
                                        className={`${subtask.completed
                                            ? 'line-through text-gray-400 dark:text-gray-600'
                                            : 'text-gray-800 dark:text-gray-200'
                                            }`}
                                    >
                                        {subtask.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Note textarea */}
                    {showNote && (
                        <div className="mt-4 space-y-2">
                            <textarea
                                rows={3}
                                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-400"
                                placeholder="Skriv eit notat til denne oppgåva..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowNote(false)}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    disabled={savingNote}
                                    className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                >
                                    {savingNote ? 'Lagrer…' : 'Lagre'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Vist notat */}
                    {!showNote && goal.note && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-wrap">
                            💬 {goal.note}
                        </p>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 mt-2">
                        Lagt til{' '}
                        {goal.createdAt.toLocaleTimeString('no-NO', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>

                    {isTaskComplete && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center space-x-2 text-green-700 dark:text-green-400 transition-colors duration-300 mt-2"
                        >
                            <span className="text-2xl">🎉</span>
                            <span className="font-medium">Løyst!</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default TaskBreakdown;
