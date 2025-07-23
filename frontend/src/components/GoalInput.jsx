import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

function GoalInput({ onGoalSubmit, user, archivedGoals = [] }) {
    const [goalText, setGoalText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [suggestion, setSuggestion] = useState('')
    const { isDark } = useTheme()
    const textareaRef = useRef(null)
    const ghostRef = useRef(null)

    // Autosize textarea + ghost-div ved endring
    useEffect(() => {
        if (!textareaRef.current || !ghostRef.current) return

        textareaRef.current.style.height = 'auto'
        const newHeight = textareaRef.current.scrollHeight + 'px'
        textareaRef.current.style.height = newHeight
        ghostRef.current.style.height = newHeight
    }, [goalText])

    const parseGoals = (text) => {
        if (!text.trim()) return []
        const lines = text.split(/\r?\n/)
        return lines
            .map((line) => {
                const trimmed = line.trim()
                if (!trimmed) return null
                const match = trimmed.match(/^(.+?)\s*\((.+)\)$/)
                if (match) {
                    return {
                        text: match[1].trim(),
                        subtasks: match[2]
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((title) => ({ title, completed: false })),
                    }
                } else {
                    return { text: trimmed, subtasks: [] }
                }
            })
            .filter(Boolean)
    }

    const structuredGoals = parseGoals(goalText)

    const getActiveLineInfo = (text = '') => {
        const lines = text.split('\n')
        const cursorPos = textareaRef.current?.selectionStart ?? text.length
        let runningCount = 0
        for (let i = 0; i < lines.length; i++) {
            runningCount += lines[i].length + 1
            if (cursorPos <= runningCount) {
                return {
                    index: i,
                    value: lines[i],
                    before: lines.slice(0, i).join('\n'),
                    after: lines.slice(i + 1).join('\n'),
                }
            }
        }
        return {
            index: lines.length - 1,
            value: lines.at(-1),
            before: lines.slice(0, -1).join('\n'),
            after: '',
        }
    }

    useEffect(() => {
        const { value: activeLine } = getActiveLineInfo(goalText)
        const query = activeLine?.trim().toLowerCase()
        if (!query || archivedGoals.length === 0) {
            setSuggestion('')
            return
        }
        const seen = new Set()
        const match = archivedGoals
            .slice(-100)
            .map((g) => g.text || g.goal || '')
            .filter(Boolean)
            .find((text) => {
                const lower = text.toLowerCase()
                const match = lower.startsWith(query) && !seen.has(lower)
                seen.add(lower)
                return match
            })
        if (match && match.toLowerCase() !== activeLine.toLowerCase()) {
            setSuggestion(match)
        } else {
            setSuggestion('')
        }
    }, [goalText, archivedGoals])

    const handleKeyDown = (e) => {
        if (!suggestion) return
        if (e.key === 'Tab' || e.key === 'ArrowRight') {
            e.preventDefault()
            const { value, before, after } = getActiveLineInfo(goalText)
            const completedLine = suggestion
            const newText = [before, completedLine, after].filter(Boolean).join('\n')
            setGoalText(newText)
            setSuggestion('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!goalText.trim() || isSubmitting) return
        setIsSubmitting(true)
        await onGoalSubmit(structuredGoals)
        setGoalText('')
        setIsSubmitting(false)
        setSuggestion('')
    }

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 10) return 'God morgon'
        if (hour >= 10 && hour < 17) return 'God dag'
        if (hour >= 17 && hour < 20) return 'God ettermiddag'
        if (hour >= 20 && hour < 23) return 'God kveld'
        return 'God natt'
    }

    const logoSrc = isDark ? '/circle.png' : '/circle_light.png'

    const currentLine = getActiveLineInfo(goalText).value || ''
    const ghostSuffix =
        suggestion && suggestion.toLowerCase().startsWith(currentLine.toLowerCase())
            ? suggestion.substring(currentLine.length)
            : ''

    const syncScroll = (e) => {
        if (ghostRef.current) {
            ghostRef.current.scrollTop = e.target.scrollTop
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300"
        >
            <div className="flex items-center space-x-3 mb-4">
                {user.photoURL && (
                    <img src={user.photoURL} alt="Profilbilete" className="w-10 h-10 rounded-full" />
                )}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        {getTimeBasedGreeting()}, {user.displayName?.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Kva vil du få gjort?</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative w-full">
                    {/* Ghost suggestion overlay */}
                    <div
                        ref={ghostRef}
                        className="absolute top-0 left-0 w-full p-4 text-gray-400 dark:text-gray-500 whitespace-pre-wrap pointer-events-none overflow-auto"
                        style={{
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            lineHeight: 'inherit',
                            zIndex: 1,
                            boxSizing: 'border-box',
                            minHeight: 120, // matcher rows=5
                            maxHeight: 400,
                            overflow: 'hidden'
                        }}
                        aria-hidden="true"
                    >
                        {goalText + ghostSuffix}
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={goalText}
                        onChange={(e) => setGoalText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onScroll={syncScroll}
                        placeholder={`Til dømes:\nSend e-post (skriv utkast, legg ved fil)\nLes korrektur`}
                        className="w-full p-4 border border-gray-200 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-300 relative z-10"
                        rows={5}
                        maxLength={500}
                        autoComplete="off"
                        style={{
                            minHeight: 120,
                            maxHeight: 400,
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                <AnimatePresence>
                    {structuredGoals.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
                        >
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Legg til ({structuredGoals.length} oppgåve
                                    {structuredGoals.length !== 1 ? 'r' : ''}):
                                </span>
                            </div>
                            <div className="space-y-3">
                                {structuredGoals.map((goal, index) => (
                                    <div key={index}>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
                                            <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                                {goal.text}
                                            </span>
                                        </div>
                                        {goal.subtasks.length > 0 && (
                                            <ul className="ml-5 mt-1 space-y-1">
                                                {goal.subtasks.map((subtask, subIndex) => (
                                                    <li
                                                        key={subIndex}
                                                        className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 text-sm"
                                                    >
                                                        <div className="w-1.5 h-1.5 bg-blue-300 dark:bg-blue-500 rounded-full" />
                                                        <span>{subtask.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {goalText.length}/500 teikn
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        💡 Éi oppgåve per linje. Legg underoppgåver i parentes.
                    </span>
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
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                            {`Legg til ${structuredGoals.length > 0 ? structuredGoals.length : ''} oppgåve${structuredGoals.length !== 1 ? 'r' : ''
                                }`}
                        </span>
                    )}
                </motion.button>
            </form>
        </motion.div>
    )
}

export default GoalInput
