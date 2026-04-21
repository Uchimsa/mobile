import React, { useState } from 'react';
import {
	SafeAreaView,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PieChart } from './piechart';

// --- Types ---

type CardStatus = 'known' | 'unknown' | 'review' | 'nil'

interface FlashcardData {
	id: number
	question: string
	answer: string
	explanation?: string
	result: CardStatus
}

interface Stats {
	known: number
	unknown: number
	review: number
	nil: number
}

interface ProgressBarProps {
	current: number
	total: number
}

interface StatsScreenProps {
	stats: Stats
	onRestart: () => void
}

// --- Mock Data (replace with real data later) ---

const MOCK_CARDS: FlashcardData[] = [
	{
		id: 1,
		question: 'Что такое горутина в Go?',
		answer: 'Легковесный поток выполнения, управляемый планировщиком Go.',
		explanation: 'Горутины потребляют мало памяти (несколько КБ) и переключаются контекстом быстрее, чем ОС-потоки.',
		result: 'nil'
	},
	{
		id: 2,
		question: 'Для чего нужен sync.WaitGroup?',
		answer: 'Для ожидания завершения набора горутин.',
		explanation: 'Методы Add, Done и Wait позволяют синхронизировать выполнение параллельных задач.',
		result: 'nil'
	},
	{
		id: 3,
		question: 'Чем отличается канал от мьютекса?',
		answer: 'Каналы служат для коммуникации, мьютексы служат для доступа к данным.',
		explanation: 'Идиома Go: "Не общайтесь разделяемой памятью, разделяйте память общением".',
		result: 'nil'
	},
]

// --- Statistics Stuff and Utils ---

function ResetResults(){
	for (let i = 0; i < MOCK_CARDS.length; i++) { MOCK_CARDS[i].result = 'nil' }
}

function FormatQuestions(n: number){
	if (n%10==1 && n%100 != 11) {return 'Вопрос'}
	else if (2 <= n%10 && n%10 <= 4 && (n%100 < 12 || n%100 > 14)) {return 'Вопроса'}
	else {return 'Вопросов'}
}

function ProgressBar({ current, total }: ProgressBarProps) {
	const progress = total === 0 ? 0 : (current / total) * 100
	return (
		<View style={styles.progressContainer}>
			<View style={styles.progressBarBackground}>
				<View style={[styles.progressBarFill, { width: `${progress}%` }]} />
			</View>
			<ThemedText type='defaultSemiBold' style={styles.progressText}>
				{current} / {total}
			</ThemedText>
		</View>
	)
}

function StatsScreen({ onRestart }: StatsScreenProps) {
	let known = 0, review = 0, unknown = 0
	for (let i = 0; i < MOCK_CARDS.length; i++) { 
		switch (MOCK_CARDS[i].result) {
			case 'known': {known++; break}
			case 'review': {review++; break}
			case 'unknown': {unknown++; break}
		}
	}
	const total = known + review + unknown
	const stats: Stats = { known: known, unknown: unknown, review: review, nil: 0}
	ResetResults()
	const getPercent = (val: number) => (total === 0 ? 0 : Math.round((val / total) * 100))
	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<ThemedText type='title' style={styles.centerText}>
					Результаты
				</ThemedText>
				
				<View style={styles.chartWrapper}>
					<PieChart
						known={known}
						review={review}
						unknown={unknown}
						size={160}
						width={24}
					/>
					<View style={styles.centerTextContainer}>
						<ThemedText type='title' style={{color:'#F8FAFC', fontSize: 24}}>
							{total}
						</ThemedText>
						<ThemedText style={{ color: '#94A3B8', fontSize: 12}}>
							{FormatQuestions(total)}
						</ThemedText>
					</View>
				</View>

				<View style={styles.statsList}>
					<StatRow label="Знал ранее" count={stats.known} percent={getPercent(stats.known)} color="#10B981" />
					<StatRow label="Закрепил старое" count={stats.review} percent={getPercent(stats.review)} color="#F59E0B" />
					<StatRow label="Узнал новое" count={stats.unknown} percent={getPercent(stats.unknown)} color="#EF4444" />
				</View>

				<TouchableOpacity
					style={styles.restartButton}
					activeOpacity={0.7}
					onPress={onRestart}
				>
					<ThemedText type='defaultSemiBold' style={styles.restartButtonText}>
						Начать заново
					</ThemedText>
				</TouchableOpacity>
			</ScrollView>
		</ThemedView>
	)
}

function StatRow({ label, count, percent, color }: { label: string, count: number, percent: number, color: string }) {
	return (
		<View style={styles.statRow}>
			<View style={styles.statLabelContainer}>
				<View style={[styles.statDot, { backgroundColor: color }]} />
				<ThemedText type='defaultSemiBold' style={{ color: '#F8FAFC' }}>{label}</ThemedText>
			</View>
			<ThemedText type='default' style={{ color: '#94A3B8' }}>
				{count} ({percent}%)
			</ThemedText>
		</View>
	)
}

// --- Main ---

export default function FlashcardsScreen() {
	const [queue, setQueue] = useState<FlashcardData[]>([...MOCK_CARDS])
	const [currentCard, setCurrentCard] = useState<FlashcardData | null>(null)
	const [isFlipped, setIsFlipped] = useState(false) // false = question true = answer
	const [showExplanation, setShowExplanation] = useState(false)
	const [stats, setStats] = useState<Stats>({ known: 0, unknown: 0, review: 0, nil: 0}) // init new stats
	const [isFinished, setIsFinished] = useState(false)

	// init first card
	React.useEffect(() => {
		if (!currentCard && queue.length > 0) {
			setCurrentCard(queue[0])
			setQueue(prev => prev.slice(1))
		} else if (!currentCard && queue.length === 0 && !isFinished) {
			setIsFinished(true)
		}
	}, [queue, currentCard, isFinished])

	const handleCardPress = () => {
		if (!isFlipped) {
			setIsFlipped(true)
		}
	}

	const handleAction = (action: CardStatus) => {

		setStats(prev => ({
			...prev,
			[action]: prev[action] + 1 // add 1 to respective statistic
		}))

		if (currentCard) {
			if (action === 'unknown') {
				if (currentCard.result =='nil') { currentCard.result = 'unknown' } // if the card hasn't been completed yet it marks it with the respective statistic
				setQueue(prev => [...prev, currentCard]) // sends to the end
			} else if (action === 'review') {
				if (currentCard.result =='nil') { currentCard.result = 'review' }
				setQueue(prev => {
					const mid = Math.floor(prev.length / 2) // sends to the middle
					const newQueue = [...prev]
					newQueue.splice(mid, 0, currentCard)
					return newQueue
				})
			} else {
				if (currentCard.result =='nil') { currentCard.result = 'known' }
			}
		}
		//reset everything back for the next card
		setIsFlipped(false)
		setShowExplanation(false)
		setCurrentCard(null)
	}

	const handleShowExplanation = () => {
		setShowExplanation(true)
	}

	const handleBackToQuestion = () => {
		setShowExplanation(false)
	}

	if (isFinished) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatsScreen 
					stats={stats} 
					onRestart={() => {
						setQueue([...MOCK_CARDS])
						setStats({ known: 0, unknown: 0, review: 0, nil: 0})
						setIsFinished(false)
						setCurrentCard(null)
					}} 
				/>
			</SafeAreaView>
		)
	}

	if (!currentCard) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<ThemedView style={styles.loadingContainer}>
					<ThemedText>Загрузка...</ThemedText>
				</ThemedView>
			</SafeAreaView>
		)
	}

	const totalCards = MOCK_CARDS.length

	return (
		<SafeAreaView style={styles.safeArea}>
			<ThemedView style={styles.container}>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					
					<ProgressBar current={stats.known} total={totalCards} />

					<TouchableOpacity 
						activeOpacity={0.9} 
						onPress={handleCardPress}
						disabled={isFlipped}
					>
						<ThemedView style={[
							styles.cardContainer, 
							isFlipped ? styles.cardFlipped : {}
						]}>
							{!isFlipped ? (
								// question
								<View style={styles.cardContent}>
									<ThemedText type='title' style={styles.questionText}>
										{currentCard.question}
									</ThemedText>
									<ThemedText type='default' style={styles.hintText}>
										(Нажми, чтобы увидеть ответ)
									</ThemedText>
								</View>
							) : (
								// explanation
								<View style={styles.cardContent}>
									<ThemedText type='defaultSemiBold' style={styles.answerLabel}>
										Ответ:
									</ThemedText>
									<ThemedText type='title' style={styles.answerText}>
										{currentCard.answer}
									</ThemedText>
									
									{showExplanation && currentCard.explanation && (
										<View style={styles.explanationBox}>
											<ThemedText type='default' style={styles.explanationText}>
												{currentCard.explanation}
											</ThemedText>
											<TouchableOpacity onPress={handleBackToQuestion} style={styles.backBtn}>
												<ThemedText style={styles.backBtnText}>← Вернуться к вопросу</ThemedText>
											</TouchableOpacity>
										</View>
									)}
								</View>
							)}
						</ThemedView>
					</TouchableOpacity>

					{isFlipped && !showExplanation && (
						<View style={styles.actionsGrid}>
							<ActionBtn 
								label="Знал" 
								color="#10B981" 
								onPress={() => handleAction('known')} 
							/>
							<ActionBtn 
								label="Повторить" 
								color="#F59E0B" 
								onPress={() => handleAction('review')} 
							/>
							<ActionBtn 
								label="Не знал" 
								color="#EF4444" 
								onPress={() => handleAction('unknown')} 
							/>
							<ActionBtn 
								label="Объясни" 
								color="#3B82F6" 
								onPress={handleShowExplanation} 
							/>
						</View>
					)}

				</ScrollView>
			</ThemedView>
		</SafeAreaView>
	)
}

function ActionBtn({ label, color, onPress }: { label: string, color: string, onPress: () => void }) {
	return (
		<TouchableOpacity
			style={[styles.actionBtn, { backgroundColor: color }]}
			activeOpacity={0.7}
			onPress={onPress}
		>
			<ThemedText type='defaultSemiBold' style={styles.actionBtnText}>
				{label}
			</ThemedText>
		</TouchableOpacity>
	)
}

// --- Styles ---

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#0f172a',
	},
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	scrollContent: {
		padding: 24,
		alignItems: 'center',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	progressContainer: {
		width: '100%',
		marginBottom: 24,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	progressBarBackground: {
		flex: 1,
		height: 8,
		backgroundColor: '#334155',
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressBarFill: {
		height: '100%',
		backgroundColor: '#3B82F6',
	},
	progressText: {
		color: '#94A3B8',
		minWidth: 40,
		textAlign: 'right',
	},
	cardContainer: {
		width: '100%',
		minHeight: 300,
		backgroundColor: '#1E293B',
		padding: 24,
		borderRadius: 20,
		marginBottom: 32,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#334155',
	},
	cardFlipped: {
		backgroundColor: '#1e293b',
		borderColor: '#3B82F6',
	},
	cardContent: {
		width: '100%',
		alignItems: 'center',
	},
	questionText: {
		fontSize: 22,
		lineHeight: 32,
		color: '#F8FAFC',
		textAlign: 'center',
		marginBottom: 20,
	},
	hintText: {
		color: '#64748B',
		marginTop: 10,
	},
	answerLabel: {
		color: '#3B82F6',
		marginBottom: 8,
		textTransform: 'uppercase',
		fontSize: 12,
		letterSpacing: 1,
	},
	answerText: {
		fontSize: 20,
		lineHeight: 28,
		color: '#F8FAFC',
		textAlign: 'center',
	},
	explanationBox: {
		marginTop: 24,
		paddingTop: 24,
		borderTopWidth: 1,
		borderTopColor: '#334155',
		width: '100%',
	},
	explanationText: {
		color: '#CBD5E1',
		fontSize: 16,
		lineHeight: 24,
		textAlign: 'center',
		marginBottom: 16,
	},
	backBtn: {
		alignSelf: 'center',
		padding: 8,
	},
	backBtnText: {
		color: '#3B82F6',
		fontSize: 14,
	},
	actionsGrid: {
		width: '100%',
		flexDirection: 'column',
		gap: 12,
		justifyContent: 'space-between',
	},
	actionBtn: {
		flex: 1,
		minWidth: '45%',
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	actionBtnText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	centerText: {
		textAlign: 'center',
		marginBottom: 32,
		fontSize: 25,
		color: '#F8FAFC',
	},
	chartContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		overflow: 'hidden',
		flexDirection: 'row',
		marginBottom: 32,
		borderWidth: 4,
		borderColor: '#1E293B',
	},
	chartSegment: {
		height: '100%',
	},
	statsList: {
		width: '100%',
		backgroundColor: '#1E293B',
		borderRadius: 16,
		padding: 20,
		marginBottom: 32,
		gap: 16,
	},
	statRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	statLabelContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	statDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	restartButton: {
		width: '100%',
		backgroundColor: '#3B82F6',
		paddingVertical: 18,
		borderRadius: 16,
		alignItems: 'center',
	},
	restartButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
	},
	chartWrapper: {
		width: 160,
		height: 160,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 32,
		position: 'relative',
	},
	centerTextContainer: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
	}
})