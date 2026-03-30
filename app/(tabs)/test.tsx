import { useState } from 'react'
import {
	SafeAreaView,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

interface QuestionData {
	id: number
	time: string
	title: string
	options: string[]
	explanation?: string
}

interface QuestionViewProps {
	data: QuestionData
	onAnswer: (answer: string) => void
	onSkip: () => void
}

function QuestionView({ data, onAnswer, onSkip }: QuestionViewProps) {
	const [showExplanation, setShowExplanation] = useState(false)

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.titleContainer}>
					<View style={styles.badge}>
						<ThemedText type='defaultSemiBold' style={styles.badgeText}>
							№ {data.id}
						</ThemedText>
					</View>
					<View style={styles.timerBadge}>
						<ThemedText type='defaultSemiBold' style={styles.timerText}>
							{data.time}
						</ThemedText>
					</View>
				</View>

				<ThemedView style={styles.cardContainer}>
					<ThemedText type='defaultSemiBold' style={styles.questionText}>
						{data.title}
					</ThemedText>
				</ThemedView>

				<ThemedView style={styles.optionsContainer}>
					{data.options.map((option, index) => (
						<TouchableOpacity
							key={index}
							style={styles.optionButton}
							activeOpacity={0.7}
							onPress={() => onAnswer(option)}
						>
							<ThemedText
								type='defaultSemiBold'
								style={styles.optionButtonText}
							>
								{option}
							</ThemedText>
						</TouchableOpacity>
					))}
				</ThemedView>

				<View style={styles.actionsContainer}>
					{data.explanation && (
						<TouchableOpacity
							style={styles.infoButton}
							activeOpacity={0.7}
							onPress={() => setShowExplanation(!showExplanation)}
						>
							<ThemedText type='defaultSemiBold' style={styles.infoButtonText}>
								{showExplanation ? 'Скрыть пояснение' : 'Пояснение'}
							</ThemedText>
						</TouchableOpacity>
					)}
					<TouchableOpacity
						style={styles.skipButton}
						activeOpacity={0.7}
						onPress={onSkip}
					>
						<ThemedText type='defaultSemiBold' style={styles.skipButtonText}>
							Пропустить
						</ThemedText>
					</TouchableOpacity>
				</View>

				{showExplanation && data.explanation && (
					<ThemedView style={styles.explanationContainer}>
						<ThemedText type='default' style={styles.explanationText}>
							{data.explanation}
						</ThemedText>
					</ThemedView>
				)}
			</ScrollView>
		</ThemedView>
	)
}

export default function TestScreen() {
	const mockData: QuestionData = {
		id: 1,
		time: '10:09',
		title:
			'Время ответа оператора в секундах равно x = [18, 20, 22, 20, 25]. Найдите среднее арифметическое.',
		options: ['19', '20', '21', '22'],
		explanation:
			'Среднее арифметическое находится как сумма всех чисел, деленная на их количество: (18 + 20 + 22 + 20 + 25) / 5 = 105 / 5 = 21.',
	}

	const handleAnswer = (answer: string) => {
		console.log('Выбран ответ:', answer)
	}

	const handleSkip = () => {
		console.log('Вопрос пропущен')
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<QuestionView
				data={mockData}
				onAnswer={handleAnswer}
				onSkip={handleSkip}
			/>
		</SafeAreaView>
	)
}

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
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	badge: {
		backgroundColor: '#2563EB',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
	},
	badgeText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	timerBadge: {
		backgroundColor: '#EF4444',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
	},
	timerText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	cardContainer: {
		backgroundColor: '#1E293B',
		padding: 24,
		borderRadius: 20,
		marginBottom: 32,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	questionText: {
		fontSize: 20,
		lineHeight: 30,
		color: '#F8FAFC',
		textAlign: 'center',
	},
	optionsContainer: {
		gap: 16,
		marginBottom: 32,
		backgroundColor: 'transparent',
	},
	optionButton: {
		backgroundColor: '#334155',
		paddingVertical: 18,
		paddingHorizontal: 24,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#475569',
		alignItems: 'center',
	},
	optionButtonText: {
		fontSize: 18,
		color: '#F8FAFC',
	},
	actionsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 16,
		marginBottom: 24,
	},
	infoButton: {
		flex: 1,
		backgroundColor: '#3b82f6',
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	infoButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	skipButton: {
		flex: 1,
		backgroundColor: '#ef4444',
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	skipButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	explanationContainer: {
		backgroundColor: '#1e293b',
		padding: 20,
		borderRadius: 16,
		borderLeftWidth: 4,
		borderLeftColor: '#3b82f6',
	},
	explanationText: {
		color: '#cbd5e1',
		fontSize: 16,
		lineHeight: 24,
	},
})
