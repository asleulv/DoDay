import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function GoalInput({ onGoalSubmit, user }) {
    const [goalText, setGoalText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isDark } = useTheme();

    // Parse goals in real-time
    const parseGoals = (text) => {
        if (!text.trim()) return [];

        const separators = /[,;]|\sand\s|\sog\s/i;
        return text.split(separators)
            .map(part => part.trim())
            .filter(part => part.length > 0);
    };

    const parsedGoals = parseGoals(goalText);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (goalText.trim() && !isSubmitting) {
            setIsSubmitting(true);
            await onGoalSubmit(goalText.trim());
            setGoalText('');
            setIsSubmitting(false);
        }
    };

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 10) {
            return "God morgon";
        } else if (hour >= 10 && hour < 17) {
            return "God dag";
        } else if (hour >= 17 && hour < 20) {
            return "God ettermiddag";
        } else if (hour >= 20 && hour < 23) {
            return "God kveld";
        } else {
            return "God natt";
        }
    };

    // Use theme-aware logo
    const logoSrc = isDark ? "/circle.png" : "/circle_light.png";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300"
        >
            <div className="flex items-center space-x-3 mb-4">
                {user.photoURL && (
                    <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                    />
                )}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        {getTimeBasedGreeting()}, {user.displayName?.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Kva vil du få gjort?</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <textarea
                        value={goalText}
                        onChange={(e) => setGoalText(e.target.value)}
                        placeholder="Til dømes: Les korrektur, send ut SMS, finn adressegrunnlag..."
                        className="w-full p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-300"
                        rows={3}
                        maxLength={500}
                    />

                    {/* Live Goal Preview */}
                    <AnimatePresence>
                        {parsedGoals.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        Legg til ({parsedGoals.length} oppgåver{parsedGoals.length !== 1 ? 's' : ''}):
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {parsedGoals.map((goal, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center space-x-2 text-sm"
                                        >
                                            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                            <span className="text-blue-800 dark:text-blue-200">{goal}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {goalText.length}/500 teikn
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            💡 Bruk komma mellom oppgåvene
                        </span>
                    </div>
                </div>

                <motion.button
                    type="submit"
                    disabled={!goalText.trim() || isSubmitting}
                    whileHover={{ scale: goalText.trim() ? 1.02 : 1 }}
                    whileTap={{ scale: goalText.trim() ? 0.98 : 1 }}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${goalText.trim() && !isSubmitting
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Legg til oppgåver...</span>
                        </div>
                    ) : (
                        <span className="flex items-center justify-center">
                            <img
                                src={logoSrc}
                                alt="Ferdig logo"
                                className="w-5 h-5 mr-2"
                                style={{ display: 'inline-block', verticalAlign: 'middle' }}
                            />
                            {`Legg til ${parsedGoals.length > 0 ? parsedGoals.length : ''} oppgåve${parsedGoals.length !== 1 ? 'r' : ''}`}
                        </span>
                    )}
                </motion.button>

            </form>
        </motion.div>
    );
}

export default GoalInput;
